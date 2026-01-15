// types/game.ts

// 场景氛围标签，用于驱动前端视觉（颜色、光影、音效）
export type Atmosphere =
  | 'neon_rain'        // 霓虹雨夜 (紫/蓝，潮湿感)
  | 'cyber_slums'      // 赛博贫民窟 (脏灰/暗红，拥挤感)
  | 'high_tech_lab'    // 高科技实验室 (冷白/青色，无菌感)
  | 'noir_bar'         // 黑色电影酒吧 (黑白/烟雾，爵士感)
  | 'danger_alley'     // 危险暗巷 (深红/黑色，压迫感)
  | 'matrix_digital';  // 数字空间 (绿色代码流，虚拟感)

// 玩家当前的状态，需要 LLM 维护并返回
export interface PlayerState {
  hp: number;              // 生命值 (0-100)
  sanity: number;          // 理智值 (0-100) - 黑色电影特色
  inventory: string[];     // 物品栏
  clues: string[];         // 已发现的线索
  location: string;        // 当前地点名称
  suspicion_level: number; // 嫌疑/被通缉程度
}

// 玩家可进行的选项
export interface Option {
  id: string;
  text: string;            // 选项显示的文本
  type: 'investigate' | 'talk' | 'fight' | 'hack' | 'move'; // 动作类型，可用于显示不同图标
  risk_level?: 'low' | 'medium' | 'high'; // 风险提示
}
