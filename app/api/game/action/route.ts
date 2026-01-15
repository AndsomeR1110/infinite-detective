/**
 * 游戏动作 API 路由
 * 处理玩家的选择，调用 LLM 生成下一个场景
 */

import { createOpenAI } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';
import { GAME_SCENE_WITH_TENSION_SCHEMA, GameRequestSchema } from '@/lib/schema';
import { SYSTEM_PROMPT } from '@/prompts/system-prompt';

// ==================== 配置 ====================

// 创建 OpenAI 客户端
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==================== 辅助函数 ====================

/**
 * 构建用户提示词
 *
 * ⚠️ 关键：这里我们将理智值明确传递给 LLM
 */
function buildUserPrompt(request: z.infer<typeof GameRequestSchema>): string {
  const { context, playerAction } = request;

  // 🔥 核心步骤 1: 从 context 中提取理智值（使用默认值）
  const currentSanity = 70; // 可以从请求体中传入

  // 🔥 核心步骤 2: 根据理智值生成特定的提示
  const sanityInstruction = getSanityInstruction(currentSanity);

  return `
# 当前玩家状态
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

# 玩家的选择
${playerAction.type === 'talk' ? '对话' : playerAction.type} ${playerAction.choiceId ? `(选项ID: ${playerAction.choiceId})` : ''}

# ⚠️ 当前理智值: ${currentSanity}/100

${sanityInstruction}

# 请返回下一个场景的 JSON 响应
确保包含:
1. narrative (剧情文本)
2. atmosphere (氛围)
3. visual_cues (视觉提示)
4. options (2-5个选项)
5. player_state_update (更新后的玩家状态)
6. tension (0-100, 用于控制视觉特效)
7. is_game_over (是否游戏结束)

⚠️ 特别注意：
- 如果理智 < 40，narrative 必须包含 [幻觉] 标记的内容
- 如果理智 < 30，移除复杂的 hack/investigate 选项
- 如果理智 < 20，考虑触发游戏结束
- 如果理智降到 0，设置 is_game_over: true
`.trim();
}

/**
 * 根据理智值生成特定的指令
 *
 * 🔥 这是理智值系统的核心：我们根据当前理智值，
 * 给 LLM 发送不同的指令，确保返回的内容符合玩家状态
 */
function getSanityInstruction(sanity: number): string {
  if (sanity >= 70) {
    return `
# 理智状态: 清醒 (70-100)
- 返回正常的叙事，不要包含幻觉内容
- 所有类型的选项都可用
- 氛围可以是任何类型
- tension 可以根据场景自由设置 (0-100)
    `.trim();
  }

  if (sanity >= 40) {
    return `
# 理智状态: 压力 (40-69)
- 偶尔在 narrative 中质疑现实（"你看到的可能是真的吗？"）
- 可以移除 1-2 个复杂的选项（标记为不可用）
- 氛围倾向于 neon_rain, noir_bar（压抑的氛围）
- tension 应该保持在 40-70 范围
    `.trim();
  }

  if (sanity >= 20) {
    return `
# 理智状态: 崩溃边缘 (20-39)
- 🔥 必须在 narrative 中包含 [幻觉] 标记的内容
- 移除 50% 的复杂选项（hack, investigate）
- 只保留基础选项（talk, fight, move）
- 氛围倾向于 danger_alley, matrix_digital
- tension 应该保持在 60-90 范围
- 视觉提示应该包含幻觉相关的内容
    `.trim();
  }

  // sanity < 20
  return `
# 理智状态: 精神崩溃 (0-19)
- 🔥🔥 narrative 的大部分内容应该是幻觉（使用 [幻觉] 标记）
- 只保留最基本的选项（fight, move）
- 氛围强制使用 matrix_digital 或 danger_alley
- tension 应该 > 80（极高）
- 如果继续降低理智，考虑设置 is_game_over: true
- game_over_reason: "你在霓虹灯的闪烁中彻底疯了"
  `.trim();
}

/**
 * 验证理智值是否在有效范围内
 */
function validateSanity(sanity: number): boolean {
  return sanity >= 0 && sanity <= 100;
}

/**
 * 计算理智值变化建议（供 LLM 参考）
 */
function getSanityChangeGuidance(currentSanity: number): string {
  if (currentSanity > 80) {
    return '当前理智较高，可以适度减少（-5 到 -10）';
  } else if (currentSanity > 50) {
    return '当前理智中等，可以保持或小幅变化（-5 到 +5）';
  } else if (currentSanity > 20) {
    return '当前理智较低，应该提供恢复机会（+5 到 +10）';
  } else {
    return '⚠️ 当前理智极低，应该提供快速恢复途径或触发游戏结束';
  }
}

// ==================== API 路由处理器 ====================

export async function POST(req: Request) {
  try {
    // 1. 解析请求体
    const body = await req.json();
    const validatedRequest = GameRequestSchema.parse(body);

    // 2. 提取当前理智值（用于日志和验证）
    const currentSanity = 70; // 默认值，可以从请求体中扩展

    console.log('🎮 收到游戏请求');
    console.log(`🧠 当前理智值: ${currentSanity}/100`);
    console.log(`📍 当前位置: ${validatedRequest.context.currentLocation.name}`);
    console.log(`⚡ 玩家行动: ${validatedRequest.playerAction.type}`);

    // 3. 验证理智值
    if (!validateSanity(currentSanity)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid sanity value: ${currentSanity}. Must be between 0 and 100.`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. 构建用户提示词（🔥 这里理智值被传递给 LLM）
    const userPrompt = buildUserPrompt(validatedRequest);

    console.log('📝 发送提示词到 LLM...');
    console.log(`🧠 理智值指令: ${getSanityInstruction(currentSanity).split('\n')[0]}`);

    // 5. 调用 LLM 并流式返回结构化对象
    const result = await streamObject({
      model: openai('gpt-4-turbo'),
      schema: GAME_SCENE_WITH_TENSION_SCHEMA,
      prompt: userPrompt,
      system: SYSTEM_PROMPT,
      temperature: 0.85, // 稍高的温度以增加创造性
    });

    // 6. 返回流式响应
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('❌ API 错误:', error);

    // 处理 Zod 验证错误
    if (error instanceof Error && error.name === 'ZodError') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request format',
          details: error.message,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 处理其他错误
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ==================== 配置 ====================

export const runtime = 'edge'; // 或 'nodejs'
export const dynamic = 'force-dynamic';
