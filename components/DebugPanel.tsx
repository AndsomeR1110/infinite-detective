'use client';

/**
 * 调试面板组件
 *
 * 功能：
 * 1. 实时调整理智值 (0-100)
 * 2. 实时调整 Tension (0-100)
 * 3. 强制切换 Atmosphere
 * 4. 一键切换预设模式（正常/压力/崩溃/疯狂/地狱）
 * 5. 显示当前状态信息
 */

import React, { useState, useCallback } from 'react';

type AtmosphereType =
  | 'neon_rain'
  | 'cyber_slums'
  | 'high_tech_lab'
  | 'noir_bar'
  | 'danger_alley'
  | 'matrix_digital';

interface DebugPanelProps {
  /** 当前理智值 */
  sanity: number;
  /** 当前 Tension */
  tension: number;
  /** 当前 Atmosphere */
  atmosphere: AtmosphereType;
  /** 当理智值变化时调用 */
  onSanityChange: (sanity: number) => void;
  /** 当 Tension 变化时调用 */
  onTensionChange: (tension: number) => void;
  /** 当 Atmosphere 变化时调用 */
  onAtmosphereChange: (atmosphere: AtmosphereType) => void;
  /** 是否显示 */
  visible?: boolean;
  /** 切换可见性 */
  onToggleVisibility?: () => void;
}

/**
 * 预设模式
 */
const PRESETS = [
  {
    name: '正常',
    emoji: '😊',
    sanity: 85,
    tension: 30,
    atmosphere: 'neon_rain' as AtmosphereType,
    description: '高理智，低紧张，霓虹雨夜',
  },
  {
    name: '压力',
    emoji: '😰',
    sanity: 55,
    tension: 50,
    atmosphere: 'noir_bar' as AtmosphereType,
    description: '中等理智，中等紧张，黑色酒吧',
  },
  {
    name: '崩溃边缘',
    emoji: '😱',
    sanity: 30,
    tension: 70,
    atmosphere: 'danger_alley' as AtmosphereType,
    description: '低理智，高紧张，危险暗巷',
  },
  {
    name: '疯狂',
    emoji: '🤯',
    sanity: 15,
    tension: 85,
    atmosphere: 'matrix_digital' as AtmosphereType,
    description: '极低理智，极高紧张，数字空间',
  },
  {
    name: '🔥 地狱模式',
    emoji: '💀',
    sanity: 5,
    tension: 100,
    atmosphere: 'danger_alley' as AtmosphereType,
    description: '理智崩溃，极限紧张，红屏+抖动+Glitch',
  },
];

/**
 * 氛围选项
 */
const ATMOSPHERE_OPTIONS: { value: AtmosphereType; label: string; emoji: string }[] = [
  { value: 'neon_rain', label: '霓虹雨夜', emoji: '🌧️' },
  { value: 'cyber_slums', label: '赛博贫民窟', emoji: '🏚️' },
  { value: 'high_tech_lab', label: '高科技实验室', emoji: '🔬️' },
  { value: 'noir_bar', label: '黑色电影酒吧', emoji: '🍺' },
  { value: 'danger_alley', label: '危险暗巷', emoji: '⚠️' },
  { value: 'matrix_digital', label: '数字空间', emoji: '💊' },
];

/**
 * 获取理智值状态文本
 */
function getSanityStatus(sanity: number): { text: string; color: string } {
  if (sanity >= 70) return { text: '清醒', color: 'text-cyber-green' };
  if (sanity >= 40) return { text: '压力', color: 'text-cyber-yellow' };
  if (sanity >= 20) return { text: '崩溃边缘', color: 'text-cyber-red' };
  return { text: '精神崩溃', color: 'text-cyber-red animate-pulse' };
}

/**
 * 获取 Tension 状态文本
 */
function getTensionStatus(tension: number): { text: string; color: string } {
  if (tension < 40) return { text: '平静', color: 'text-green-400' };
  if (tension < 70) return { text: '紧张', color: 'text-yellow-400' };
  if (tension < 90) return { text: '极度紧张', color: 'text-orange-400' };
  return { text: '崩溃级', color: 'text-red-400 animate-pulse' };
}

/**
 * DebugPanel 组件
 */
export function DebugPanel({
  sanity,
  tension,
  atmosphere,
  onSanityChange,
  onTensionChange,
  onAtmosphereChange,
  visible = true,
  onToggleVisibility,
}: DebugPanelProps) {
  const [localSanity, setLocalSanity] = useState(sanity);
  const [localTension, setLocalTension] = useState(tension);

  // 🔥 关键：使用 onChange 而不是 onChangeEnd，确保实时更新
  const handleSanityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value);
      setLocalSanity(newValue);
      onSanityChange(newValue); // 立即触发回调
    },
    [onSanityChange]
  );

  const handleTensionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value);
      setLocalTension(newValue);
      onTensionChange(newValue); // 立即触发回调
    },
    [onTensionChange]
  );

  // 应用预设
  const applyPreset = useCallback(
    (preset: typeof PRESETS[0]) => {
      setLocalSanity(preset.sanity);
      setLocalTension(preset.tension);
      onSanityChange(preset.sanity);
      onTensionChange(preset.tension);
      onAtmosphereChange(preset.atmosphere);
    },
    [onSanityChange, onTensionChange, onAtmosphereChange]
  );

  const sanityStatus = getSanityStatus(localSanity);
  const tensionStatus = getTensionStatus(localTension);

  if (!visible) {
    // 折叠状态：显示一个小按钮
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed bottom-4 right-4 z-[100] px-4 py-2 bg-cyber-purple hover:bg-cyber-pink
                   rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
        title="打开调试面板"
      >
        🐛 调试
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-[100] w-96 bg-gray-900/95 backdrop-blur-md
                  rounded-xl border-2 border-cyber-purple/50 shadow-2xl overflow-hidden">
      {/* 标题栏 */}
      <div className="bg-gradient-to-r from-cyber-purple to-cyber-pink px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">🐛 调试面板</h2>
        <button
          onClick={onToggleVisibility}
          className="text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* ==================== 预设模式 ==================== */}
        <div>
          <h3 className="text-sm font-bold text-gray-300 mb-2">⚡ 预设模式</h3>
          <div className="grid grid-cols-1 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`
                  px-3 py-2 rounded-lg border-2 transition-all duration-200
                  hover:scale-[1.02] hover:shadow-lg text-left
                  ${
                    preset.name === '🔥 地狱模式'
                      ? 'bg-red-900/30 border-red-500 hover:bg-red-900/50'
                      : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{preset.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-400">{preset.description}</div>
                  </div>
                  <div className="text-xs">
                    <div>理智: {preset.sanity}</div>
                    <div>Tension: {preset.tension}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== 理智值滑块 ==================== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-300">🧠 理智值</h3>
            <span className={`text-lg font-bold ${sanityStatus.color}`}>
              {localSanity} ({sanityStatus.text})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={localSanity}
            onChange={handleSanityChange} // 🔥 实时更新
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-cyber-green [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 (疯狂)</span>
            <span>50</span>
            <span>100 (清醒)</span>
          </div>
        </div>

        {/* ==================== Tension 滑块 ==================== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-300">⚡ Tension</h3>
            <span className={`text-lg font-bold ${tensionStatus.color}`}>
              {localTension} ({tensionStatus.text})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={localTension}
            onChange={handleTensionChange} // 🔥 实时更新
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-cyber-red [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 (平静)</span>
            <span>50</span>
            <span>100 (极限)</span>
          </div>

          {/* Tension > 80 警告 */}
          {localTension > 80 && (
            <div className="mt-2 p-2 bg-red-900/30 border border-red-500 rounded-lg">
              <p className="text-xs text-red-400 animate-pulse">
                ⚠️ Tension &gt; 80: 屏幕将显示红屏 + 抖动效果
              </p>
            </div>
          )}
        </div>

        {/* ==================== Atmosphere 切换 ==================== */}
        <div>
          <h3 className="text-sm font-bold text-gray-300 mb-2">🎨 氛围</h3>
          <div className="grid grid-cols-2 gap-2">
            {ATMOSPHERE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onAtmosphereChange(option.value)}
                className={`
                  px-3 py-2 rounded-lg border-2 transition-all duration-200
                  ${
                    atmosphere === option.value
                      ? 'bg-cyber-purple/50 border-cyber-purple'
                      : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                  }
                `}
              >
                <div className="text-xl">{option.emoji}</div>
                <div className="text-xs mt-1">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== 状态信息 ==================== */}
        <div className="bg-black/50 rounded-lg p-3 space-y-1">
          <div className="text-xs text-gray-400">当前状态：</div>
          <div className="text-sm font-mono">
            <div>Sanity: <span className={sanityStatus.color}>{localSanity}</span></div>
            <div>Tension: <span className={tensionStatus.color}>{localTension}</span></div>
            <div>Atmosphere: <span className="text-cyber-blue">{atmosphere}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 快速预设按钮（用于嵌入其他地方）
 */
export function QuickPresetButtons({
  onApplyPreset,
}: {
  onApplyPreset: (preset: typeof PRESETS[0]) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PRESETS.map((preset) => (
        <button
          key={preset.name}
          onClick={() => onApplyPreset(preset)}
          className={`
            px-3 py-1 rounded-lg text-sm transition-all duration-200
            ${
              preset.name === '🔥 地狱模式'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }
          `}
        >
          {preset.emoji} {preset.name}
        </button>
      ))}
    </div>
  );
}
