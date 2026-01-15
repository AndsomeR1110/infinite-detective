'use client';

/**
 * useTypewriter Hook 测试页面
 * 展示流式数据 + 打字机效果的完美配合
 */

import { useState } from 'react';
import { useTypewriter } from '@/hooks/use-typewriter';

export default function TestTypewriterPage() {
  const [streamedText, setStreamedText] = useState('');
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);

  const {
    displayedText,
    isTyping,
    progress,
    pause,
    resume,
    reset,
    complete,
  } = useTypewriter(streamedText, {
    baseSpeed: 40,
    punctuationDelay: 100,
    enabled: !!streamedText,
    onComplete: () => {
      console.log('✅ 打字完成');
    },
  });

  /**
   * 模拟流式数据接收
   */
  const simulateStream = () => {
    setIsSimulatingStream(true);
    reset();

    const fullText = `你推开诊所的门，空气中弥漫着消毒水和廉价香烟的味道。

老鬼坐在柜台后，他的电子义眼在黑暗中发出微弱的蓝光。"好久不见，侦探。"他沙哑地说，声音像生锈的齿轮。

你注意到他的左手——不自然的颤抖，典型的赛博精神病早期症状。

"我需要知道死者的情况。"你直入主题。

老鬼停顿了一下，目光在你脸上扫过。"这是个危险的请求，侦探。有些事情，不知道反而更安全。"`;

    let currentText = '';
    let index = 0;

    // 每 50ms 添加 2-5 个字符（模拟网络流）
    const interval = setInterval(() => {
      if (index >= fullText.length) {
        clearInterval(interval);
        setIsSimulatingStream(false);
        return;
      }

      // 随机添加 2-5 个字符
      const charsToAdd = Math.floor(Math.random() * 4) + 2;
      currentText = fullText.slice(0, index + charsToAdd);
      setStreamedText(currentText);
      index += charsToAdd;
    }, 50);

    return () => clearInterval(interval);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          useTypewriter Hook 测试
        </h1>

        <p className="text-gray-400 mb-8">
          这个页面展示了如何使用 <code className="bg-gray-800 px-2 py-1 rounded">useTypewriter</code> Hook
          处理流式数据。点击下面的按钮模拟 LLM 流式返回数据。
        </p>

        {/* 控制面板 */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={simulateStream}
            disabled={isSimulatingStream}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            {isSimulatingStream ? '流式传输中...' : '模拟流式数据'}
          </button>

          <button
            onClick={pause}
            disabled={!isTyping}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            暂停
          </button>

          <button
            onClick={resume}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            恢复
          </button>

          <button
            onClick={reset}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            重置
          </button>

          <button
            onClick={complete}
            disabled={!isTyping}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            立即完成
          </button>
        </div>

        {/* 状态显示 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">打字状态</div>
            <div className="text-lg font-bold">
              {isTyping ? (
                <span className="text-green-400">● 正在打字</span>
              ) : (
                <span className="text-gray-400">○ 等待中</span>
              )}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">打字进度</div>
            <div className="text-lg font-bold text-cyber-blue">{progress.toFixed(1)}%</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">已显示 / 总长度</div>
            <div className="text-lg font-bold">
              {displayedText.length} / {streamedText.length}
            </div>
          </div>
        </div>

        {/* 进度条 */}
        {isTyping && (
          <div className="mb-8">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 流式数据预览 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 text-gray-300">原始流式数据</h2>
          <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
            {streamedText || '<等待数据...>'}
          </div>
        </div>

        {/* 打字机效果显示 */}
        <div>
          <h2 className="text-xl font-bold mb-2 text-gray-300">打字机效果</h2>
          <div className="bg-black/50 p-6 rounded-lg border border-purple-500/30 min-h-[200px]">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-5 bg-green-400 ml-1 animate-blink" />
              )}
            </p>
          </div>
        </div>

        {/* 说明 */}
        <div className="mt-8 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold mb-4">核心特性</h3>
          <ul className="space-y-2 text-gray-300">
            <li>✅ <strong>流式兼容</strong>：一边接收数据，一边打字显示</li>
            <li>✅ <strong>性能优化</strong>：使用 requestAnimationFrame，60fps 流畅动画</li>
            <li>✅ <strong>智能标点</strong>：自动识别标点符号并增加停顿</li>
            <li>✅ <strong>可控制</strong>：支持暂停、恢复、重置、立即完成</li>
            <li>✅ <strong>进度追踪</strong>：实时返回打字进度百分比</li>
            <li>✅ <strong>TypeScript</strong>：完整类型支持</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
