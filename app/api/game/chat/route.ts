import { createOpenAI } from '@ai-sdk/openai';
import { SYSTEM_PROMPT } from '@/prompts/system-prompt';

const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    // 转换消息格式
    const chatMessages = (messages || []).map((msg: any) => {
      if (msg.content) {
        return {
          role: msg.role,
          content: msg.content,
        };
      }

      if (msg.parts && Array.isArray(msg.parts)) {
        const textParts = msg.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('');

        return {
          role: msg.role,
          content: textParts,
        };
      }

      return {
        role: msg.role,
        content: '',
      };
    });

    // 将系统提示词作为第一条消息
    const messagesWithSystem = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT,
      },
      ...chatMessages,
    ];

    // 直接调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messagesWithSystem,
        temperature: 0.85,
        stream: false,  // 使用非流式响应
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ DeepSeek API 错误:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();

    // 提取内容
    const content = data.choices?.[0]?.message?.content || '';

    // 清理可能的 Markdown 代码块标记
    const cleanedContent = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    console.log('✅ 场景加载成功');

    // 返回纯文本 JSON
    return new Response(cleanedContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('❌ API 错误:', error);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
