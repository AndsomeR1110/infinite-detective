/**
 * 理智值系统
 * 处理理智值对游戏内容和 UI 的影响
 */

import type { Atmosphere, Option } from '../types/game';

/**
 * 根据理智值返回状态
 */
export type SanityStatus = 'lucid' | 'stressed' | 'breaking' | 'broken';

export function getSanityStatus(sanity: number): SanityStatus {
  if (sanity >= 70) return 'lucid';
  if (sanity >= 40) return 'stressed';
  if (sanity >= 20) return 'breaking';
  return 'broken';
}

/**
 * 处理 narrative 中的幻觉内容
 */
export interface ProcessedNarrative {
  text: string;
  hallucinations: string[];
  isCompletelyHallucination: boolean;
}

export function processNarrative(narrative: string, sanity: number): ProcessedNarrative {
  const hallucinations: string[] = [];
  let processedText = narrative;

  // 提取 [幻觉] 标记的内容
  const hallucinationRegex = /\[幻觉\]([^\[]*?)(?=\[|$)/g;
  let match;

  while ((match = hallucinationRegex.exec(narrative)) !== null) {
    hallucinations.push(match[1].trim());
  }

  // 移除 [幻觉] 标签，保留文本
  processedText = processedText.replace(/\[幻觉\]/g, '');

  const isCompletelyHallucination = sanity < 20 && Math.random() < 0.5;

  return {
    text: processedText,
    hallucinations,
    isCompletelyHallucination,
  };
}

/**
 * 过滤理智值不足的选项
 */
export function filterOptionsBySanity(options: Option[], sanity: number): Option[] {
  const status = getSanityStatus(sanity);

  if (status === 'lucid') {
    return options;
  }

  if (status === 'stressed') {
    return options.filter(opt => {
      if (opt.risk_level === 'low') return true;
      return Math.random() < 0.8;
    });
  }

  if (status === 'breaking') {
    return options.filter(opt => {
      if (opt.risk_level === 'low') return true;
      return Math.random() < 0.3;
    });
  }

  if (status === 'broken') {
    return options.filter(opt => {
      return opt.type === 'fight' || opt.type === 'move';
    });
  }

  return options;
}

/**
 * 为选项添加理智值警告
 */
export function addSanityWarnings(options: Option[], sanity: number): Option[] {
  const status = getSanityStatus(sanity);

  if (status === 'lucid') {
    return options;
  }

  return options.map(opt => {
    const isComplexOption = opt.type === 'hack' || opt.type === 'investigate';

    if (isComplexOption) {
      return {
        ...opt,
        text: status === 'broken'
          ? `${opt.text} (无法集中注意力)`
          : `${opt.text} (理智值不足)`,
      };
    }

    return opt;
  });
}

/**
 * 根据理智值和氛围生成 UI 样式
 */
export function getAtmosphereAndSanityStyles(
  atmosphere: Atmosphere,
  sanity: number
): {
  background: string;
  textColor: string;
  effects: string[];
} {
  const status = getSanityStatus(sanity);

  const atmosphereStyles: Record<Atmosphere, { background: string; textColor: string }> = {
    neon_rain: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      textColor: 'text-purple-100',
    },
    cyber_slums: {
      background: 'linear-gradient(135deg, #2d2d2d 0%, #4a1919 100%)',
      textColor: 'text-gray-200',
    },
    high_tech_lab: {
      background: 'linear-gradient(135deg, #e0e0e0 0%, #a8dadc 100%)',
      textColor: 'text-gray-900',
    },
    noir_bar: {
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%)',
      textColor: 'text-gray-100',
    },
    danger_alley: {
      background: 'linear-gradient(135deg, #1a0000 0%, #4a0000 100%)',
      textColor: 'text-red-100',
    },
    matrix_digital: {
      background: 'linear-gradient(135deg, #000000 0%, #001a00 100%)',
      textColor: 'text-green-400',
    },
  };

  const baseStyle = atmosphereStyles[atmosphere];
  const effects: string[] = [];

  if (status === 'stressed') {
    effects.push('animate-pulse-slow');
  } else if (status === 'breaking') {
    effects.push('animate-shake', 'filter-blur-sm');
  } else if (status === 'broken') {
    effects.push('animate-glitch', 'filter-blur-md', 'animate-pulse-fast');
  }

  return {
    ...baseStyle,
    effects,
  };
}
