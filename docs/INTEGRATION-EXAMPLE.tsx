/**
 * 集成示例：如何在 app/page.tsx 中使用 NarrativeRenderer 和 DebugPanel
 *
 * 关键改动：
 * 1. 用 <NarrativeRenderer /> 替换 <p>{displayedText}</p>
 * 2. 添加 DebugPanel 并管理其状态
 * 3. 确保调试面板的滑块实时更新游戏状态
 */

// ==================== 在 app/page.tsx 顶部添加导入 ====================

import { useTypewriter } from '@/hooks/use-typewriter';
import { NarrativeRenderer } from '@/components/NarrativeRenderer';
import { DebugPanel } from '@/components/DebugPanel';
import type { Atmosphere } from '@/types/game';

// ==================== 在主组件中添加调试状态 ====================

export default function InfiniteDetectiveGame() {
  // ... 现有的状态 ...

  // 🔥 新增：调试面板状态
  const [debugMode, setDebugMode] = useState({
    enabled: true,  // 是否显示调试面板
    overrideSanity: false,  // 是否覆盖理智值
    overrideTension: false,  // 是否覆盖 Tension
    overrideAtmosphere: false,  // 是否覆盖 Atmosphere
  });

  const [debugValues, setDebugValues] = useState({
    sanity: playerState.sanity,
    tension: 50,
    atmosphere: 'neon_rain' as Atmosphere,
  });

  // ... 现有的 useObject 和 useTypewriter ...

  // ==================== 渲染逻辑 ====================

  // 🔥 关键：根据调试模式决定使用哪个值
  const effectiveSanity = debugMode.overrideSanity
    ? debugValues.sanity
    : playerState.sanity;

  const effectiveTension = debugMode.overrideTension
    ? debugValues.tension
    : (currentScene as any)?.tension || 50;

  const effectiveAtmosphere = debugMode.overrideAtmosphere
    ? debugValues.atmosphere
    : currentScene?.atmosphere || 'neon_rain';

  // 处理幻觉内容（使用有效的理智值）
  const processedNarrative = useMemo(() => {
    return processNarrative(displayedText, effectiveSanity);
  }, [displayedText, effectiveSanity]);

  // 过滤和添加理智警告（使用有效的理智值）
  const availableOptions = useMemo(() => {
    if (!currentScene) return [];
    return filterOptionsBySanity(currentScene.options, effectiveSanity);
  }, [currentScene, effectiveSanity]);

  // 生成视觉样式（使用有效的 Atmosphere 和理智值）
  const visualStyles = useMemo(() => {
    return getAtmosphereAndSanityStyles(effectiveAtmosphere, effectiveSanity);
  }, [effectiveAtmosphere, effectiveSanity]);

  // 🔥 检查是否需要高 Tension 效果（使用有效的 Tension）
  const isHighTension = effectiveTension > 80;

  // ==================== 调试面板回调 ====================

  const handleDebugSanityChange = useCallback((sanity: number) => {
    setDebugValues(prev => ({ ...prev, sanity }));
    // 可选：同时更新真实的玩家状态（用于测试）
    // setPlayerState(prev => ({ ...prev, sanity }));
  }, []);

  const handleDebugTensionChange = useCallback((tension: number) => {
    setDebugValues(prev => ({ ...prev, tension }));
  }, []);

  const handleDebugAtmosphereChange = useCallback((atmosphere: Atmosphere) => {
    setDebugValues(prev => ({ ...prev, atmosphere }));
  }, []);

  // ==================== 渲染 ====================

  return (
    <main
      className={`
        min-h-screen transition-all duration-500
        ${visualStyles.effects.join(' ')}
        ${isHighTension ? 'animate-red-pulse' : ''}
      `}
      style={{
        background: visualStyles.background,
      }}
    >
      {/* ==================== 高 Tension 效果 ==================== */}
      {isHighTension && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 border-[20px] border-red-600/50 animate-pulse-fast" />
          <div className="absolute inset-0 bg-red-900/10 animate-shake" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* ==================== 开始游戏按钮 ==================== */}
        {shouldShowStartButton && (
          /* ... 开始游戏按钮 ... */
          <div>开始游戏按钮占位</div>
        )}

        {/* ==================== 游戏内容 ==================== */}
        {!shouldShowStartButton && (
          <>
            {/* ==================== 状态栏 ==================== */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <SanityBar sanity={effectiveSanity} />
              <HPBar hp={playerState.hp} />
              <div className="flex items-center justify-between text-sm opacity-70 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                <span>📍 {playerState.location}</span>
                {isTyping && (
                  <span className="text-cyber-blue animate-pulse">正在输入...</span>
                )}
                {/* 🔥 新增：显示调试模式状态 */}
                {debugMode.overrideSanity && (
                  <span className="text-cyber-purple">🐛 调试中</span>
                )}
              </div>
            </div>

            {/* ==================== 🔥 叙事文本（使用 NarrativeRenderer）==================== */}
            <NarrativeDisplay
              text={processedNarrative.text}
              hallucinations={processedNarrative.hallucinations}
              isTyping={isTyping}
              sanity={effectiveSanity}
              progress={progress}
              onComplete={() => complete()}
            />

            {/* ==================== 视觉提示 ==================== */}
            {currentScene?.visual_cues && (
              <VisualCues cues={currentScene.visual_cues} />
            )}

            {/* ==================== 选项按钮 ==================== */}
            {!isLoading && currentScene && (
              <div className="mt-8 grid gap-3">
                {finalOptions.map((option, index) => (
                  <ChoiceButton
                    key={option.id}
                    option={option}
                    onClick={() => handleChoiceClick(option)}
                    disabled={option.text.includes('(理智值不足)')}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* ==================== 加载状态 ==================== */}
            {isLoading && !object?.narrative && (
              <div className="mt-8 text-center">
                <div className="inline-block animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyber-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-cyber-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-cyber-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="mt-4 text-cyber-blue">正在接收响应...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== 🔥 调试面板 ==================== */}
      <DebugPanel
        sanity={debugValues.sanity}
        tension={debugValues.tension}
        atmosphere={debugValues.atmosphere}
        onSanityChange={handleDebugSanityChange}
        onTensionChange={handleDebugTensionChange}
        onAtmosphereChange={handleDebugAtmosphereChange}
        visible={debugMode.enabled}
        onToggleVisibility={() => setDebugMode(prev => ({ ...prev, enabled: !prev.enabled }))}
      />
    </main>
  );
}

// ==================== 🔥 修改 NarrativeDisplay 组件 ====================

interface NarrativeDisplayProps {
  text: string;
  hallucinations: string[];
  isTyping: boolean;
  sanity: number;
  progress: number;
  onComplete: () => void;
}

function NarrativeDisplay({
  text,
  hallucinations,
  isTyping,
  sanity,
  progress,
  onComplete,
}: NarrativeDisplayProps) {
  return (
    <div className="mb-8 p-6 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
      {/* 进度条 */}
      {isTyping && (
        <div className="mb-4 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyber-purple to-cyber-pink transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 🔥 核心改动：使用 NarrativeRenderer 替换简单的 <p> 标签 */}
      <NarrativeRenderer
        text={text}
        isTyping={isTyping}
        sanity={sanity}
        className="text-lg leading-relaxed min-h-[100px]"
      />

      {/* 幻觉内容（额外显示） */}
      {sanity < 30 && hallucinations.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-red-900/50 pt-4">
          {hallucinations.map((hallucination, index) => (
            <GlitchText key={index} text={hallucination} />
          ))}
        </div>
      )}

      {/* 跳过按钮 */}
      {isTyping && (
        <button
          onClick={onComplete}
          className="mt-4 text-sm text-cyber-blue hover:text-cyber-purple transition-colors underline"
        >
          跳过动画 →
        </button>
      )}
    </div>
  );
}

// ==================== 样式补充（添加到 globals.css）====================

/*
.glitch-text {
  animation: glitch 0.3s infinite;
}

.glitch-container {
  position: relative;
}

.NarrativeRenderer code {
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.NarrativeRenderer .glitch-text {
  text-shadow:
    -2px 0 #00ffff,
    2px 0 #ff00ff,
    0 0 10px rgba(255, 0, 0, 0.8);
}
*/
