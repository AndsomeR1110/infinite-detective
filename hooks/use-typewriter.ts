/**
 * 高级打字机效果 Hook
 * 特性：
 * 1. 使用 requestAnimationFrame 实现流畅动画
 * 2. 支持流式数据（一边接收一边显示）
 * 3. 自动适应不同的打字速度
 * 4. 支持暂停/恢复/重置
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  /** 基础打字速度（每秒字符数） */
  baseSpeed?: number;
  /** 标点符号后的额外延迟（毫秒） */
  punctuationDelay?: number;
  /** 是否启用打字机效果 */
  enabled?: boolean;
  /** 打字完成后的回调 */
  onComplete?: () => void;
  /** 每个字符显示后的回调 */
  onCharTyped?: (char: string, index: number) => void;
}

interface UseTypewriterReturn {
  /** 当前已显示的文本 */
  displayedText: string;
  /** 是否正在打字 */
  isTyping: boolean;
  /** 打字进度百分比 */
  progress: number;
  /** 暂停打字 */
  pause: () => void;
  /** 恢复打字 */
  resume: () => void;
  /** 重置打字机 */
  reset: () => void;
  /** 立即完成打字 */
  complete: () => void;
}

export function useTypewriter(
  streamedText: string,
  options: UseTypewriterOptions = {}
): UseTypewriterReturn {
  const {
    baseSpeed = 30, // 每秒 30 个字符
    punctuationDelay = 150,
    enabled = true,
    onComplete,
    onCharTyped,
  } = options;

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 使用 ref 存储状态，避免闭包问题
  const stateRef = useRef({
    currentIndex: 0,
    lastFrameTime: 0,
    accumulatedTime: 0,
    targetText: '',
  });

  const rafIdRef = useRef<number | null>(null);

  // 计算打字进度
  const progress = streamedText.length > 0
    ? (displayedText.length / streamedText.length) * 100
    : 0;

  /**
   * 核心打字逻辑：使用 requestAnimationFrame
   *
   * 关键优化：
   * 1. 基于时间累积，不受帧率影响
   * 2. 支持流式数据（targetText 可以动态增长）
   * 3. 标点符号自动停顿
   */
  const typeNextFrame = useCallback((timestamp: number) => {
    if (!stateRef.current.lastFrameTime) {
      stateRef.current.lastFrameTime = timestamp;
    }

    const deltaTime = timestamp - stateRef.current.lastFrameTime;
    stateRef.current.lastFrameTime = timestamp;
    stateRef.current.accumulatedTime += deltaTime;

    const { currentIndex, targetText } = stateRef.current;

    // 如果已完成
    if (currentIndex >= targetText.length) {
      setIsTyping(false);
      onComplete?.();
      return;
    }

    // 计算应该打多少个字符
    // 基础速度：每个字符需要的时间
    const charTime = 1000 / baseSpeed; // 毫秒
    const shouldTypeIndex = Math.min(
      currentIndex + Math.floor(stateRef.current.accumulatedTime / charTime),
      targetText.length
    );

    // 逐个检查是否需要显示
    let newDisplayedText = displayedText;
    let actualTypedIndex = currentIndex;

    for (let i = currentIndex; i < shouldTypeIndex; i++) {
      const char = targetText[i];

      // 标点符号后增加额外延迟
      const isPunctuation = ['。', '！', '？', '\n', '.', '!', '?'].includes(char);
      const delay = isPunctuation ? punctuationDelay : 0;

      // 如果累积时间不够显示这个字符，就停止
      if (stateRef.current.accumulatedTime < charTime + delay) {
        break;
      }

      stateRef.current.accumulatedTime -= (charTime + delay);
      newDisplayedText += char;
      actualTypedIndex = i + 1;
      onCharTyped?.(char, actualTypedIndex);
    }

    setDisplayedText(newDisplayedText);
    stateRef.current.currentIndex = actualTypedIndex;

    // 继续下一帧
    if (actualTypedIndex < targetText.length && !isPaused) {
      rafIdRef.current = requestAnimationFrame(typeNextFrame);
    } else if (actualTypedIndex >= targetText.length) {
      setIsTyping(false);
      onComplete?.();
    }
  }, [displayedText, baseSpeed, punctuationDelay, isPaused, onComplete, onCharTyped]);

  /**
   * 启动打字机
   */
  const startTyping = useCallback(() => {
    if (!enabled || rafIdRef.current !== null) {
      return;
    }

    setIsTyping(true);
    stateRef.current.lastFrameTime = 0;
    stateRef.current.accumulatedTime = 0;

    rafIdRef.current = requestAnimationFrame(typeNextFrame);
  }, [enabled, typeNextFrame]);

  /**
   * 监听 streamedText 变化
   *
   * 核心逻辑：
   * 1. 如果新文本比已显示的长，继续打字
   * 2. 如果新文本比已显示的短，重置并重新开始
   */
  useEffect(() => {
    if (!enabled) {
      setDisplayedText(streamedText);
      setIsTyping(false);
      return;
    }

    const { currentIndex } = stateRef.current;

    // 情况 1: 流式数据增长（正常情况）
    if (streamedText.length > displayedText.length) {
      stateRef.current.targetText = streamedText;

      // 如果当前没有在打字，启动打字机
      if (rafIdRef.current === null) {
        startTyping();
      }
      // 如果已经在打字，不需要做任何事（会自动继续）
    }
    // 情况 2: 文本被完全替换（场景切换）
    else if (streamedText !== stateRef.current.targetText) {
      // 重置并重新开始
      reset();
      stateRef.current.targetText = streamedText;
      startTyping();
    }
  }, [streamedText, enabled, displayedText.length, startTyping]);

  /**
   * 暂停打字
   */
  const pause = useCallback(() => {
    setIsPaused(true);
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  /**
   * 恢复打字
   */
  const resume = useCallback(() => {
    setIsPaused(false);
    if (
!isTyping && stateRef.current.currentIndex < stateRef.current.targetText.length) {
      startTyping();
    }
  }, [isTyping, startTyping]);

  /**
   * 重置打字机
   */
  const reset = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setDisplayedText('');
    setIsTyping(false);
    stateRef.current.currentIndex = 0;
    stateRef.current.lastFrameTime = 0;
    stateRef.current.accumulatedTime = 0;
    stateRef.current.targetText = '';
  }, []);

  /**
   * 立即完成打字
   */
  const complete = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setDisplayedText(stateRef.current.targetText || streamedText);
    setIsTyping(false);
    stateRef.current.currentIndex = stateRef.current.targetText.length || streamedText.length;
  }, [streamedText]);

  /**
   * 清理
   */
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    isTyping,
    progress,
    pause,
    resume,
    reset,
    complete,
  };
}

/**
 * 简化版本：只返回文本和状态
 */
export function useTypewriterText(
  streamedText: string,
  options?: Omit<UseTypewriterOptions, 'onCharTyped'>
): string {
  const { displayedText } = useTypewriter(streamedText, options);
  return displayedText;
}
