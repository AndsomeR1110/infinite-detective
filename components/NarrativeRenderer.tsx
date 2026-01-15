'use client';

/**
 * 叙事文本渲染器
 *
 * 功能：
 * 1. 解析 Markdown 格式（粗体、斜体、代码等）
 * 2. 为幻觉内容应用特殊样式
 * 3. 支持自定义样式和类名
 */

import React from 'react';

interface NarrativeRendererProps {
  text: string;
  className?: string;
  isTyping?: boolean;
  sanity?: number;
}

/**
 * Markdown 解析规则
 *
 * 支持的语法：
 * - **粗体**: **text** 或 __text__
 * - *斜体*: *text* 或 _text_
 * - ***粗斜体***: ***text***
 * - `代码`: `text`
 * - [幻觉]标签: [幻觉]text[/幻觉]
 * - 对话: "text" 或 「text」
 */
const MARKDOWN_RULES = [
  // 幻觉内容（最高优先级）
  {
    pattern: /\[幻觉\]([^\[]+?)(?=\[|$)/g,
    render: (match: string, content: string) => {
      return (
        <span key={match} className="text-red-500 italic font-bold glitch-text">
          {content}
        </span>
      );
    },
  },
  // 对话 "text" 或 「text」
  {
    pattern: /"([^"]+)"|「([^」]+)」/g,
    render: (match: string, content: string) => {
      const quotedText = content.replace(/["「」]/g, '');
      return (
        <span key={match} className="text-white font-semibold border-l-2 border-cyber-purple pl-3 my-2 block">
          "{quotedText}"
        </span>
      );
    },
  },
  // 粗斜体 ***text***
  {
    pattern: /\*\*\*([^*]+?)\*\*\*/g,
    render: (match: string, content: string) => (
      <span key={match} className="font-bold italic text-cyber-pink">
        {content}
      </span>
    ),
  },
  // 粗体 **text** 或 __text__
  {
    pattern: /\*\*([^*]+?)\*\*|__([^_]+?)__/g,
    render: (match: string, content: string) => (
      <span key={match} className="font-bold text-cyber-pink">
        {content.replace(/\*\*|__/g, '')}
      </span>
    ),
  },
  // 斜体 *text* 或 _text_
  {
    pattern: /\*([^*]+?)\*|_([^_]+?)_/g,
    render: (match: string, content: string) => (
      <span key={match} className="italic text-gray-300">
        {content.replace(/\*|_/g, '')}
      </span>
    ),
  },
  // 代码 `text`
  {
    pattern: /`([^`]+?)`/g,
    render: (match: string, content: string) => (
      <code key={match} className="px-2 py-1 bg-gray-800/80 rounded text-cyber-green font-mono text-sm border border-cyber-green/30">
        {content}
      </code>
    ),
  },
];

/**
 * 解析 Markdown 文本
 *
 * 算法：
 * 1. 简化版：直接应用正则规则
 * 2. 将换行符转换为 <br>
 * 3. 保留未匹配的纯文本
 */
function parseMarkdown(text: string): (string | React.ReactNode)[] {
  if (!text) {
    return [];
  }

  try {
    // 第一步：先处理所有 Markdown 格式（对话、粗体、斜体、代码）
    let processedText = text;

    // 处理对话 "text" 或 「text」
    processedText = processedText.replace(/"([^"]+)"|「([^」]+)」/g, '<<DIALOGUE>>$1$2<<END_DIALOGUE>>');

    // 处理粗斜体 ***text***
    processedText = processedText.replace(/\*\*\*([^*]+?)\*\*\*/g, '<<BOLD_ITALIC>>$1<<END_BOLD_ITALIC>>');

    // 处理粗体 **text**
    processedText = processedText.replace(/\*\*([^*]+?)\*\*/g, '<<BOLD>>$1<<END_BOLD>>');

    // 处理斜体 *text*
    processedText = processedText.replace(/\*([^*]+?)\*/g, '<<ITALIC>>$1<<END_ITALIC>>');

    // 处理代码 `text`
    processedText = processedText.replace(/`([^`]+?)`/g, '<<CODE>>$1<<END_CODE>>');

    // 第二步：将换行符转换为段落标记
    processedText = processedText.replace(/\n\n/g, '<<PARAGRAPH_BREAK>>');
    processedText = processedText.replace(/\n/g, '<<LINE_BREAK>>');

    // 第三步：按段落分割
    const paragraphs = processedText.split('<<PARAGRAPH_BREAK>>');

    const result: (string | React.ReactNode)[] = [];

    paragraphs.forEach((paragraph, pIndex) => {
      if (!paragraph.trim()) return;

      // 将段落包装在 <p> 标签中
      const paragraphChildren: (string | React.ReactNode)[] = [];

      // 按换行符分割
      const lines = paragraph.split('<<LINE_BREAK>>');

      lines.forEach((line, lIndex) => {
        if (line.trim()) {
          // 处理这一行中的 Markdown 标记
          const processedLine = processMarkdownTags(line);
          paragraphChildren.push(...processedLine);
        }

        // 不是最后一行，添加换行
        if (lIndex < lines.length - 1) {
          paragraphChildren.push(<br key={`br-${pIndex}-${lIndex}`} />);
        }
      });

      // 添加段落
      result.push(
        <p key={`paragraph-${pIndex}`} className="mb-4 last:mb-0">
          {paragraphChildren}
        </p>
      );
    });

    return result;
  } catch (error) {
    console.error('❌ parseMarkdown 错误:', error);
    // 出错时返回原始文本（直接渲染）
    return [<span key="fallback" dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }} />];
  }
}

/**
 * 处理 Markdown 标签
 */
function processMarkdownTags(text: string): (string | React.ReactNode)[] {
  const result: (string | React.ReactNode)[] = [];

  let remaining = text;

  while (remaining.length > 0) {
    // 查找下一个标签的开始位置
    const nextTagMatch = remaining.match(/<<(\w+)(>>)/);

    if (!nextTagMatch) {
      // 没有更多标签，添加剩余文本
      result.push(<span key={result.length}>{remaining}</span>);
      break;
    }

    const tagStart = nextTagMatch.index ?? 0;
    const tagName = nextTagMatch[1];
    const tagFull = nextTagMatch[0];

    // 添加标签前的文本
    if (tagStart > 0) {
      result.push(<span key={result.length}>{remaining.slice(0, tagStart)}</span>);
    }

    // 查找对应的结束标签
    const endTag = `<<END_${tagName}>>`;
    const endTagIndex = remaining.indexOf(endTag, tagStart);

    if (endTagIndex === -1) {
      // 没有找到结束标签，把标签当作普通文本
      result.push(<span key={result.length}>{remaining}</span>);
      break;
    }

    // 提取标签内容
    const content = remaining.slice(tagStart + tagFull.length, endTagIndex);

    // 根据标签类型渲染
    switch (tagName) {
      case 'DIALOGUE':
        result.push(
          <span key={result.length}
                className="text-white font-semibold border-l-2 border-cyber-purple pl-3 my-2 block">
            "{content}"
          </span>
        );
        break;
      case 'BOLD_ITALIC':
        result.push(
          <span key={result.length} className="font-bold italic text-cyber-pink">
            {content}
          </span>
        );
        break;
      case 'BOLD':
        result.push(
          <span key={result.length} className="font-bold text-cyber-pink">
            {content}
          </span>
        );
        break;
      case 'ITALIC':
        result.push(
          <span key={result.length} className="italic text-gray-300">
            {content}
          </span>
        );
        break;
      case 'CODE':
        result.push(
          <code key={result.length}
                className="px-2 py-1 bg-gray-800/80 rounded text-cyber-green
                       font-mono text-sm border border-cyber-green/30">
            {content}
          </code>
        );
        break;
      default:
        // 未知标签，当作普通文本
        result.push(<span key={result.length}>{remaining.slice(tagStart, endTagIndex + endTag.length)}</span>);
    }

    // 移动到结束标签之后
    remaining = remaining.slice(endTagIndex + endTag.length);
  }

  return result;
}

/**
 * 叙事渲染器组件
 */
export function NarrativeRenderer({
  text,
  className = '',
  isTyping = false,
  sanity = 100,
}: NarrativeRendererProps) {
  // 解析 Markdown
  const parsedContent = parseMarkdown(text);

  return (
    <div className={`narrative-renderer ${className}`}>
      {parsedContent.length > 0 ? (
        parsedContent.map((token, index) => {
          // 纯字符串
          if (typeof token === 'string') {
            return <span key={index}>{token}</span>;
          }

          // React 元素
          return token;
        })
      ) : (
        <div className="text-gray-500 italic">暂无内容</div>
      )}

      {/* 打字机光标 */}
      {isTyping && (
        <span className="inline-block w-2 h-6 bg-cyber-green ml-1 animate-blink shadow-[0_0_10px_#10B981]" />
      )}
    </div>
  );
}

/**
 * 简化版本：只解析特定标签
 */
export function SimpleNarrativeRenderer({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return <NarrativeRenderer text={text} className={className} isTyping={false} />;
}

/**
 * 带幻觉效果的版本
 */
export function HallucinationNarrativeRenderer({
  text,
  sanity,
  className = '',
}: {
  text: string;
  sanity: number;
  className?: string;
}) {
  const hasGlitch = sanity < 30;

  return (
    <NarrativeRenderer
      text={text}
      className={hasGlitch ? `${className} glitch-container` : className}
      isTyping={false}
      sanity={sanity}
    />
  );
}
