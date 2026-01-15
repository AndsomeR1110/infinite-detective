'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { PlayerState, Atmosphere, Option } from '@/types/game';
import { processNarrative, filterOptionsBySanity, addSanityWarnings, getAtmosphereAndSanityStyles } from '@/utils/sanity-system';
import { useTypewriter } from '@/hooks/use-typewriter';
import { extractNarrative } from '@/utils/stream-parser';
import { NarrativeRenderer } from '@/components/NarrativeRenderer';
import { DebugPanel } from '@/components/DebugPanel';

// 临时类型定义
interface GameSceneResponse {
  scene_id: string;
  narrative: string;
  atmosphere: Atmosphere;
  visual_cues: string[];
  options: Option[];
  player_state_update: PlayerState;
  tension?: number;
  is_game_over: boolean;
  game_over_reason?: string;
}

export default function InfiniteDetectiveGame() {
  // ==================== 游戏状态 ====================
  const [playerState, setPlayerState] = useState<PlayerState>({
    hp: 100,
    sanity: 85,
    inventory: ['便携式解密器'],
    clues: [],
    location: '侦探事务所',
    suspicion_level: 0,
  });

  const [currentScene, setCurrentScene] = useState<GameSceneResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentNarrative, setCurrentNarrative] = useState('');

  const [gameStarted, setGameStarted] = useState(false);

  // 🔥 调试面板状态
  const [debugValues, setDebugValues] = useState({
    sanity: playerState.sanity,
    tension: 50,
    atmosphere: 'neon_rain' as Atmosphere,
  });
  const [showDebugPanel, setShowDebugPanel] = useState(true);

  // ==================== API 调用 ====================

  /**
   * 调用游戏 API
   */
  const callGameAPI = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setCurrentNarrative('');

    try {
      console.log('🚀 调用 API:', prompt);

      const response = await fetch('/api/game/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      console.log('📡 响应状态:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${errorText}`);
      }

      const text = await response.text();

      // 清理 Markdown 代码块标记
      const cleanedText = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText);

      console.log('✅ 场景加载成功:', parsed.scene_id, '| narrative 长度:', parsed.narrative?.length || 0);

      setCurrentScene(parsed);
      setCurrentNarrative(parsed.narrative || '');
      setPlayerState(parsed.player_state_update);
      setGameStarted(true);

      // 更新调试面板
      setDebugValues({
        sanity: parsed.player_state_update.sanity,
        tension: parsed.tension || 50,
        atmosphere: parsed.atmosphere,
      });
    } catch (error) {
      console.error('❌ API 调用失败:', error);
      alert('API 调用失败: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 开始游戏
   */
  const startGame = useCallback(() => {
    console.log('🎮 开始游戏...');
    const prompt = `请生成游戏的开场剧情。设定：2084年新九龙城寨，玩家是一名私人侦探。当前位置：${playerState.location}。当前理智值：${playerState.sanity}。`;
    callGameAPI(prompt);
  }, [playerState, callGameAPI]);

  /**
   * 处理选项点击
   */
  const handleChoiceClick = useCallback(async (option: { id: string; text: string }) => {
    const prompt = `玩家选择：${option.text}。当前场景：${currentScene?.narrative}。当前理智值：${debugValues.sanity}。请返回下一个场景的 JSON 格式响应。`;
    callGameAPI(prompt);
  }, [currentScene, debugValues.sanity, callGameAPI]);

  // ==================== 打字机效果 ====================
  // 暂时禁用打字机效果，直接显示文本
  const { displayedText, isTyping, progress, complete } = useTypewriter(
    currentNarrative,
    {
      baseSpeed: 35,
      punctuationDelay: 120,
      enabled: false,  // 禁用打字机效果
      onComplete: () => {
        console.log('✨ 打字机效果完成');
      },
    }
  );

  // ==================== 渲染逻辑 ====================

  const effectiveSanity = debugValues.sanity;
  const effectiveTension = debugValues.tension;
  const effectiveAtmosphere = debugValues.atmosphere;

  const processedNarrative = useMemo(() => {
    return processNarrative(displayedText, effectiveSanity);
  }, [displayedText, effectiveSanity]);

  const availableOptions = useMemo(() => {
    if (!currentScene) return [];
    return filterOptionsBySanity(currentScene.options, effectiveSanity);
  }, [currentScene, effectiveSanity]);

  const finalOptions = useMemo(() => {
    return addSanityWarnings(availableOptions, effectiveSanity);
  }, [availableOptions, effectiveSanity]);

  const visualStyles = useMemo(() => {
    return getAtmosphereAndSanityStyles(effectiveAtmosphere, effectiveSanity);
  }, [effectiveAtmosphere, effectiveSanity]);

  const isHighTension = effectiveTension > 80;

  // ==================== 调试面板回调 ====================

  const handleDebugSanityChange = useCallback((sanity: number) => {
    setDebugValues(prev => ({ ...prev, sanity }));
  }, []);

  const handleDebugTensionChange = useCallback((tension: number) => {
    setDebugValues(prev => ({ ...prev, tension }));
  }, []);

  const handleDebugAtmosphereChange = useCallback((atmosphere: Atmosphere) => {
    setDebugValues(prev => ({ ...prev, atmosphere }));
  }, []);

  // 检查是否应该显示开始按钮
  const shouldShowStartButton = !gameStarted && !isLoading;

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
      {/* ==================== 高 Tension 效果（红屏 + 抖动）==================== */}
      {isHighTension && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 border-[20px] border-red-600/50 animate-pulse-fast" />
          <div className="absolute inset-0 bg-red-900/10 animate-shake" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10 flex flex-col md:flex-row gap-8">
        {/* ==================== 开始游戏按钮 ==================== */}
        {shouldShowStartButton && (
          <div className="w-full flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-cyber-purple to-cyber-pink bg-clip-text text-transparent tracking-tighter">
              无限侦探
            </h1>
            <p className="text-2xl text-gray-300 mb-8 text-center font-serif italic border-b border-gray-700 pb-4">
              "The Infinite Detective"
            </p>
            <p className="text-lg text-gray-400 mb-12 text-center max-w-lg">
              赛博朋克 × 黑色电影<br />
              <span className="text-sm opacity-70">由 AI 实时驱动的无尽谜团</span>
            </p>

            <button
              onClick={startGame}
              disabled={isLoading}
              className="group relative px-10 py-5 bg-cyber-purple hover:bg-cyber-pink
                         text-white font-bold text-xl tracking-widest uppercase
                         clip-path-polygon transition-all duration-300
                         hover:scale-105 hover:shadow-[0_0_20px_rgba(255,0,110,0.5)]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
            >
              {isLoading ? '加载中...' : '开始调查'}
            </button>
          </div>
        )}

        {/* ==================== 游戏内容（只在开始后显示）==================== */}
        {!shouldShowStartButton && (
          <>
            {/* ==================== 左侧边栏：状态面板 ==================== */}
            <div className="w-full md:w-1/3 flex flex-col gap-6 order-2 md:order-1">
              <div className="bg-black/60 backdrop-blur-md p-6 rounded-sm border-l-4 border-cyber-purple shadow-xl">
                <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-4 font-bold border-b border-gray-700 pb-2">
                  侦探状态
                </h3>
                <div className="space-y-6">
                  <SanityBar sanity={playerState.sanity} />
                  <HPBar hp={playerState.hp} />
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-md p-6 rounded-sm border-l-4 border-cyber-blue shadow-xl">
                 <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-4 font-bold border-b border-gray-700 pb-2">
                  当前位置
                </h3>
                <div className="text-xl font-serif text-white/90">
                  &gt; {playerState.location}
                </div>
                 {isTyping && (
                  <div className="mt-4 text-xs text-cyber-green animate-pulse font-mono">
                    &gt;&gt;&gt; 接收神经信号...
                  </div>
                )}
              </div>

              {/* 物品栏 (占位) */}
               <div className="bg-black/60 backdrop-blur-md p-6 rounded-sm border-l-4 border-gray-600 shadow-xl opacity-80">
                 <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-4 font-bold border-b border-gray-700 pb-2">
                  物品清单
                </h3>
                <ul className="text-sm text-gray-300 space-y-2 font-mono">
                  {playerState.inventory.map((item, i) => (
                    <li key={i}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ==================== 右侧主区域：叙事与交互 ==================== */}
            <div className="w-full md:w-2/3 flex flex-col gap-6 order-1 md:order-2">

              {/* 叙事文本 - 主内容区 */}
              <NarrativeDisplay
                text={processedNarrative.text}
                hallucinations={processedNarrative.hallucinations}
                isTyping={isTyping}
                sanity={playerState.sanity}
                progress={progress}
                onComplete={() => complete()}
              />

              {/* 视觉提示 - 放在叙事下方，淡化处理 */}
              {currentScene?.visual_cues && currentScene.visual_cues.length > 0 && !isTyping && (
                <div className="mt-4 p-4 border-t border-b border-gray-700/50 bg-black/30">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold">
                    视觉感知
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentScene.visual_cues.map((cue, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-sm text-gray-400 border border-gray-600/50 rounded-full
                                   hover:border-cyber-purple/50 hover:text-gray-300 transition-colors"
                      >
                        {cue}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 选项按钮 */}
              <div className="flex flex-col gap-3">
                {!isLoading && currentScene ? (
                  finalOptions.map((option, index) => (
                    <ChoiceButton
                      key={option.id}
                      option={option}
                      onClick={() => handleChoiceClick(option)}
                      disabled={option.text.includes('(理智值不足)')}
                      index={index}
                    />
                  ))
                ) : (
                   isLoading && !currentScene && (
                    <div className="p-8 text-center border-t border-b border-white/10 bg-black/20">
                      <div className="inline-flex items-center gap-3">
                        <div className="w-2 h-2 bg-cyber-blue animate-ping" />
                        <span className="text-cyber-blue font-mono text-sm tracking-widest">
                          正在构建思维殿堂...
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
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
        visible={showDebugPanel}
        onToggleVisibility={() => setShowDebugPanel(!showDebugPanel)}
      />
    </main>
  );
}

// ==================== 子组件 ====================

/**
 * 叙事显示组件
 */
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
    <div className="relative min-h-[400px]">
      {/* 进度条 (细线) */}
      {isTyping && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-800/50">
          <div
            className="h-full bg-gradient-to-r from-cyber-purple to-cyber-pink transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 文本区域 - 更大更突出 */}
      <div className="py-8 px-4">
        {text ? (
          <NarrativeRenderer
            text={text}
            isTyping={isTyping}
            sanity={sanity}
            className="text-lg md:text-xl font-serif leading-[2] text-gray-100 whitespace-pre-wrap drop-shadow-lg tracking-wide"
          />
        ) : (
          <div className="text-gray-500 text-center py-12">
            等待叙事内容...
          </div>
        )}
      </div>

      {/* 幻觉内容（额外显示） */}
      {sanity < 30 && hallucinations.length > 0 && (
        <div className="mt-6 space-y-3 border-t border-red-900/70 pt-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none" />
          {hallucinations.map((hallucination, index) => (
            <GlitchText key={index} text={hallucination} />
          ))}
        </div>
      )}

      {/* 跳过按钮（打字时显示） */}
      {isTyping && (
        <button
          onClick={onComplete}
          className="absolute bottom-0 right-0 text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest bg-black/30 px-2 py-1 rounded"
        >
          [跳过]
        </button>
      )}
    </div>
  );
}

/**
 * Glitch 文字效果组件
 */
function GlitchText({ text }: { text: string }) {
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchOffset({
        x: Math.random() * 4 - 2,
        y: Math.random() * 4 - 2,
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className="text-red-500 italic relative font-bold"
      style={{
        transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`,
        fontSize: `${0.9 + Math.random() * 0.4}em`,
        textShadow: `
          -2px 0 #00ffff,
          2px 0 #ff00ff,
          0 0 10px rgba(255, 0, 0, 0.8)
        `,
      }}
    >
      [幻觉] {text}
    </p>
  );
}

/**
 * 理智值条组件
 */
function SanityBar({ sanity }: { sanity: number }) {
  const getStatus = (s: number) => {
    if (s >= 70) return { label: 'LUCID', color: 'bg-cyber-green' };
    if (s >= 40) return { label: 'STRESSED', color: 'bg-cyber-yellow' };
    if (s >= 20) return { label: 'BREAKING', color: 'bg-cyber-red animate-pulse' };
    return { label: 'BROKEN', color: 'bg-cyber-red animate-sanity-critical' };
  };

  const status = getStatus(sanity);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Sanity</span>
        <span className={`text-xs font-mono ${sanity < 30 ? 'text-red-500' : 'text-gray-400'}`}>
          {sanity}%
        </span>
      </div>
      <div className="h-2 bg-gray-800/50 w-full relative">
         <div
          className={`h-full transition-all duration-500 ${status.color}`}
          style={{ width: `${sanity}%` }}
        />
      </div>
      <div className="mt-1 text-right">
        <span className={`text-[10px] uppercase tracking-wider ${sanity < 30 ? 'text-red-500' : 'text-gray-600'}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}

function HPBar({ hp }: { hp: number }) {
  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-1">
        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Health</span>
        <span className="text-xs font-mono text-gray-400">{hp}%</span>
      </div>
      <div className="h-2 bg-gray-800/50 w-full">
        <div
          className="h-full bg-cyber-red transition-all duration-500"
          style={{ width: `${hp}%` }}
        />
      </div>
    </div>
  );
}

/**
 * 视觉提示组件
 */
function VisualCues({ cues }: { cues: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {cues.map((cue, index) => (
        <span
          key={index}
          className="px-3 py-1 text-sm rounded-full bg-cyber-purple/20 border border-cyber-purple/50 backdrop-blur-sm"
        >
          &gt; {cue}
        </span>
      ))}
    </div>
  );
}

/**
 * 选项按钮组件
 */
interface ChoiceButtonProps {
  option: {
    id: string;
    text: string;
    type?: string;
    risk_level?: string;
  };
  onClick: () => void;
  disabled: boolean;
  index: number;
}

function ChoiceButton({ option, onClick, disabled, index }: ChoiceButtonProps) {
  const getTypeIcon = (type?: string) => {
    const icons: Record<string, string> = {
      investigate: '🔍',
      talk: '💬',
      fight: '⚔️',
      hack: '💻',
      move: '🚶',
    };
    return icons[type || ''] || '•';
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'border-red-600 text-red-100 hover:bg-red-900/50';
      case 'medium': return 'border-yellow-600 text-yellow-100 hover:bg-yellow-900/50';
      case 'low': return 'border-green-600 text-green-100 hover:bg-green-900/50';
      default: return 'border-gray-600 text-gray-300 hover:bg-white/10';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-5 border-l-2 border-y border-r transition-all duration-200
        ${getRiskColor(option.risk_level)}
        ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:pl-8'}
        bg-black/80 backdrop-blur-sm text-left
        flex items-center gap-4 animate-fade-in group relative overflow-hidden
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />

      <span className="text-xl relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
        {getTypeIcon(option.type)}
      </span>

      <div className="flex-1 relative z-10">
        <span className="font-serif text-lg tracking-wide block group-hover:translate-x-1 transition-transform">
          {option.text}
        </span>
      </div>

      {option.risk_level && option.risk_level !== 'low' && (
        <span className={`
          text-xs uppercase tracking-widest px-2 py-1 border border-current opacity-70
          ${option.risk_level === 'high' ? 'text-red-500' : 'text-yellow-500'}
        `}>
          {option.risk_level} Risk
        </span>
      )}
    </button>
  );
}
