/**
 * Zod Schema 定义
 * 用于验证 LLM 返回的数据结构
 */

import { z } from 'zod';

/**
 * 玩家选项
 */
export const PlayerOptionSchema = z.object({
  id: z.string().describe('选项唯一标识'),
  text: z.string().describe('选项显示的文本'),
  type: z.enum(['investigate', 'talk', 'fight', 'hack', 'move']).describe('动作类型'),
  risk_level: z.enum(['low', 'medium', 'high']).optional().describe('风险等级'),
});

/**
 * 玩家状态更新
 */
export const PlayerStateSchema = z.object({
  hp: z.number().min(0).max(100).describe('生命值 (0-100)'),
  sanity: z.number().min(0).max(100).describe('理智值 (0-100)'),
  inventory: z.array(z.string()).describe('物品栏列表'),
  clues: z.array(z.string()).describe('已发现的线索'),
  location: z.string().describe('当前地点名称'),
  suspicion_level: z.number().min(0).max(100).describe('嫌疑/被通缉程度 (0-100)'),
});

/**
 * 游戏场景响应（完整版）
 */
export const GameSceneSchema = z.object({
  scene_id: z.string().describe('场景唯一标识'),
  narrative: z.string().describe('剧情文本，支持简单的 Markdown 粗体/斜体'),

  // 视觉与氛围控制
  atmosphere: z.enum([
    'neon_rain',        // 霓虹雨夜
    'cyber_slums',      // 赛博贫民窟
    'high_tech_lab',    // 高科技实验室
    'noir_bar',         // 黑色电影酒吧
    'danger_alley',     // 危险暗巷
    'matrix_digital',   // 数字空间
  ]).describe('当前氛围'),

  visual_cues: z.array(z.string()).describe('具体的视觉提示'),

  // 游戏逻辑
  options: z.array(PlayerOptionSchema).describe('玩家可用的选项（2-5个）'),
  player_state_update: PlayerStateSchema.describe('更新后的玩家状态'),

  // 系统反馈
  is_game_over: z.boolean().describe('是否游戏结束'),
  game_over_reason: z.string().optional().describe('游戏结束原因'),
});

/**
 * 游戏场景响应（带 tension）
 */
export const GameSceneWithTensionSchema = GameSceneSchema.extend({
  tension: z.number().min(0).max(100).describe('紧张度 (0-100) - 用于控制视觉特效'),
});

/**
 * API 请求体
 */
export const GameRequestSchema = z.object({
  context: z.object({
    currentLocation: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      area: z.string(),
    }),
    cluesSummary: z.array(z.string()),
    inventory: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      type: z.enum(['evidence', 'tool', 'weapon', 'key-item', 'consumable']),
      usable: z.boolean(),
    })),
    activeQuests: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      currentObjective: z.string(),
      progress: z.number(),
      isMainQuest: z.boolean(),
    })),
    currentScene: z.string(),
    gameProgress: z.object({
      chapter: z.number(),
      sceneNumber: z.number(),
      totalScenes: z.number(),
    }),
  }).describe('当前游戏上下文'),

  playerAction: z.object({
    type: z.enum(['investigate', 'talk', 'fight', 'hack', 'move']),
    choiceId: z.string().optional(),
    customInput: z.string().optional(),
    usedItemId: z.string().optional(),
  }).describe('玩家的行动'),
});

/**
 * API 响应体
 */
export const GameResponseSchema = z.object({
  success: z.boolean(),
  data: GameSceneWithTensionSchema.optional(),
  error: z.string().optional(),
});

// ==================== Zod Schema 导出 ====================

export const GAME_PLAYER_OPTION_SCHEMA = PlayerOptionSchema;
export const GAME_PLAYER_STATE_SCHEMA = PlayerStateSchema;
export const GAME_SCENE_SCHEMA = GameSceneSchema;
export const GAME_SCENE_WITH_TENSION_SCHEMA = GameSceneWithTensionSchema;
export const GAME_REQUEST_SCHEMA = GameRequestSchema;
export const GAME_RESPONSE_SCHEMA = GameResponseSchema;

// ==================== TypeScript 类型导出 ====================

export type PlayerOption = z.infer<typeof PlayerOptionSchema>;
export type PlayerState = z.infer<typeof PlayerStateSchema>;
export type GameScene = z.infer<typeof GameSceneSchema>;
export type GameSceneWithTension = z.infer<typeof GameSceneWithTensionSchema>;
export type GameRequest = z.infer<typeof GameRequestSchema>;
export type GameResponse = z.infer<typeof GameResponseSchema>;

// ==================== 重新导出以保持兼容性 ====================

/**
 * 向后兼容：重新导出 types/game.ts 中的类型
 *
 * 注意：我们保持 types/game.ts 作为主要的类型定义，
 * 这里只提供 Zod schema 用于验证。
 */

// 从 types/game.ts 导入 Atmosphere 类型
export type { Atmosphere } from '../types/game';
