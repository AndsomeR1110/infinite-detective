/**
 * 完整的游戏循环示例
 * 展示理智值系统如何影响游戏流程
 */

import type { PlayerState, GameSceneResponse, Atmosphere, Option } from '../types/game';
import { StreamingJSONParser } from '../utils/streaming-json-parser';
import {
  getSanityStatus,
  processNarrative,
  filterOptionsBySanity,
  addSanityWarnings,
  getAtmosphereAndSanityStyles,
  checkGameOver,
  calculateSanityChange,
  SANITY_CONFIG,
} from '../utils/sanity-system';
import { buildUserPrompt, SYSTEM_PROMPT } from '../prompts/system-prompt-v2';

// ========================================
// 游戏管理器
// ========================================

export class GameManager {
  private currentState: PlayerState;
  private parser: StreamingJSONParser;
  private sceneHistory: GameSceneResponse[] = [];

  constructor(initialState?: PlayerState) {
    this.currentState = initialState || {
      hp: 100,
      sanity: 85,
      inventory: ['便携式解密器'],
      clues: [],
      location: '侦探事务所',
      suspicion_level: 0,
    };
    this.parser = new StreamingJSONParser();
  }

  /**
   * 处理玩家选择
   */
  async handlePlayerChoice(choiceId: string, choiceText: string): Promise<void> {
    console.log(`\n🎮 玩家选择: ${choiceText} (${choiceId})`);

    // 1. 构建请求
    const request = buildUserPrompt(this.currentState, choiceText, choiceId);

    // 2. 调用 LLM（这里模拟）
    const response = await this.mockLLMCall(request);

    // 3. 处理流式响应
    await this.processStreamResponse(response);

    // 4. 应用理智值系统
    this.applySanitySystem();

    // 5. 检查游戏结束
    const gameOverCheck = checkGameOver(this.currentState);
    if (gameOverCheck.isOver) {
      console.log(`\n💀 游戏结束: ${gameOverCheck.reason}`);
    }
  }

  /**
   * 模拟 LLM 调用
   */
  private async mockLLMCall(request: string): Promise<string> {
    // 在实际应用中，这里会调用 OpenAI/Claude API
    // 现在我们返回模拟的流式响应

    const currentSanity = this.currentState.sanity;
    const scene = this.generateMockScene(currentSanity);

    return JSON.stringify(scene);
  }

  /**
   * 生成模拟场景
   */
  private generateMockScene(sanity: number): GameSceneResponse {
    // 根据理智值返回不同的场景
    if (sanity >= 70) {
      // 高理智：正常场景
      return {
        scene_id: 'scene_002',
        narrative:
          '你走进昏暗的酒吧，爵士乐在空气中流淌。吧台后的酒保擦着杯子，他的电子眼在你身上扫过。"要点什么，侦探？"他问，声音沙哑但友善。你注意到角落里坐着一个神秘的女子，她一直在观察你。',
        atmosphere: 'noir_bar',
        visual_cues: ['昏暗的灯光', '旋转的爵士唱片', '女子的红色霓虹纹身'],
        options: [
          {
            id: 'opt_talk_bartender',
            text: '向酒保打听消息',
            type: 'talk',
            risk_level: 'low',
          },
          {
            id: 'opt_approach_woman',
            text: '走向那个神秘女子',
            type: 'talk',
            risk_level: 'medium',
          },
          {
            id: 'opt_hack_terminal',
            text: '入侵酒吧的安全终端',
            type: 'hack',
            risk_level: 'high',
          },
        ],
        player_state_update: {
          hp: 90,
          sanity: 85,
          inventory: ['便携式解密器'],
          clues: ['酒吧有安全终端'],
          location: '爵士酒吧',
          suspicion_level: 5,
        },
        is_game_over: false,
      };
    } else if (sanity >= 40) {
      // 中理智：开始出现不可靠叙述
      return {
        scene_id: 'scene_002',
        narrative:
          '你走进酒吧——或者那是酒吧吗？灯光在闪烁，让你头晕。酒保的脸...你看不太清。他说了什么，但你听不真切。角落里有个影子，它是不是在动？',
        atmosphere: 'neon_rain',
        visual_cues: ['闪烁的灯光', '模糊的酒保脸', '移动的影子'],
        options: [
          {
            id: 'opt_talk_bartender',
            text: '尝试和酒保交谈',
            type: 'talk',
            risk_level: 'low',
          },
          {
            id: 'opt_approach_woman',
            text: '走向那个影子',
            type: 'talk',
            risk_level: 'medium',
          },
          {
            id: 'opt_flee',
            text: '离开这里',
            type: 'move',
            risk_level: 'low',
          },
        ],
        player_state_update: {
          hp: 80,
          sanity: 55,
          inventory: ['便携式解密器'],
          clues: [],
          location: '爵士酒吧',
          suspicion_level: 10,
        },
        is_game_over: false,
      };
    } else if (sanity >= 20) {
      // 低理智：明显幻觉
      return {
        scene_id: 'scene_002',
        narrative:
          "[幻觉]酒吧的门在尖叫。你跌跌撞撞地进去，世界在旋转。[幻觉]酒保没有脸，只有一团数据流。他说的话不是声音，是直接在你脑内响起的二进制代码。角落里的那个东西——那不是人，那是一团蠕动的霓虹灯。[幻觉]你的神经接口在发烫。它在看着你。",
        atmosphere: 'matrix_digital',
        visual_cues: ['没有脸的酒保 [幻觉]', '蠕动的霓虹灯 [幻觉]', '发烫的神经接口'],
        options: [
          {
            id: 'opt_scream',
            text: '尖叫',
            type: 'fight',
            risk_level: 'high',
          },
          {
            id: 'opt_flee',
            text: '逃跑',
            type: 'move',
            risk_level: 'low',
          },
          {
            id: 'opt_hack_terminal',
            text: '砸烂终端 (理智值不足)',
            type: 'hack',
            risk_level: 'high',
          },
        ],
        player_state_update: {
          hp: 70,
          sanity: 30,
          inventory: ['便携式解密器'],
          clues: [],
          location: '？？？',
          suspicion_level: 20,
        },
        is_game_over: false,
      };
    } else {
      // 极低理智：几乎全是幻觉
      return {
        scene_id: 'scene_002',
        narrative:
          "[幻觉]墙壁在呼吸。[幻觉]地板变成了数据流，你在下坠。[幻觉]酒保是一串绿色的代码，他在对你笑——不，那不是笑，那是错误日志。[幻觉]角落里的东西站起来了，它有你的脸。它说：'该醒醒了。'你听到了吗？那是真相。你是数据。你是在虚拟世界里。",
        atmosphere: 'matrix_digital',
        visual_cues: ['呼吸的墙壁 [幻觉]', '代码化的酒保 [幻觉]', '有你的脸的东西 [幻觉]'],
        options: [
          {
            id: 'opt_scream',
            text: '崩溃地尖叫',
            type: 'fight',
            risk_level: 'high',
          },
          {
            id: 'opt_accept',
            text: '接受真相',
            type: 'move',
            risk_level: 'high',
          },
        ],
        player_state_update: {
          hp: 50,
          sanity: 15,
          inventory: ['便携式解密器'],
          clues: ['现实可能是虚拟的？'],
          location: '数据深渊',
          suspicion_level: 50,
        },
        is_game_over: false,
      };
    }
  }

  /**
   * 处理流式响应
   */
  private async processStreamResponse(response: string): Promise<void> {
    console.log('\n📡 接收流式响应...');

    // 模拟流式接收（每次接收 50 字符）
    const chunkSize = 50;
    for (let i = 0; i < response.length; i += chunkSize) {
      const chunk = response.slice(i, i + chunkSize);
      const result = this.parser.addChunk(chunk);

      if (result.complete && result.data) {
        console.log('✅ 完整场景接收完成');
        this.sceneHistory.push(result.data);

        // 更新玩家状态
        this.currentState = result.data.player_state_update;
        console.log(`\n📊 状态更新:`);
        console.log(`   HP: ${this.currentState.hp}`);
        console.log(`   理智: ${this.currentState.sanity}`);
        console.log(`   位置: ${this.currentState.location}`);

        return;
      }
    }
  }

  /**
   * 应用理智值系统
   */
  private applySanitySystem(): void {
    const latestScene = this.sceneHistory[this.sceneHistory.length - 1];
    if (!latestScene) return;

    const sanity = this.currentState.sanity;
    const status = getSanityStatus(sanity);

    console.log(`\n🧠 理智值系统应用:`);
    console.log(`   当前状态: ${SANITY_CONFIG[status].label} (${sanity}/100)`);

    // 处理叙事文本
    const processed = processNarrative(latestScene.narrative, sanity);
    console.log(`   幻觉内容: ${processed.hallucinations.length} 处`);

    // 过滤选项
    const filteredOptions = filterOptionsBySanity(latestScene.options, sanity);
    console.log(`   可用选项: ${filteredOptions.length}/${latestScene.options.length}`);

    // 添加警告
    const optionsWithWarnings = addSanityWarnings(latestScene.options, sanity);
    console.log(`   带警告的选项: ${optionsWithWarnings.filter((o) => o.text.includes('(')).length} 个`);

    // 生成 UI 样式
    const styles = getAtmosphereAndSanityStyles(latestScene.atmosphere, sanity);
    console.log(`   视觉效果: ${styles.effects.length > 0 ? styles.effects.join(', ') : '无'}`);
  }

  /**
   * 渲染当前场景（前端示例）
   */
  renderScene(): void {
    const latestScene = this.sceneHistory[this.sceneHistory.length - 1];
    if (!latestScene) {
      console.log('还没有场景数据');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎬 场景: ${latestScene.scene_id}`);
    console.log('='.repeat(60));

    // 渲染叙事文本
    const processed = processNarrative(latestScene.narrative, this.currentState.sanity);
    console.log(`\n📖 叙事:\n${processed.text}`);

    if (processed.hallucinations.length > 0) {
      console.log(`\n👁️  幻觉内容:`);
      processed.hallucinations.forEach((h, i) => {
        console.log(`   ${i + 1}. ${h}`);
      });
    }

    // 渲染氛围
    console.log(`\n🎨 氛围: ${latestScene.atmosphere}`);
    console.log(`👁️  视觉提示:`);
    latestScene.visual_cues.forEach((cue, i) => {
      console.log(`   ${i + 1}. ${cue}`);
    });

    // 渲染理智值状态
    const status = getSanityStatus(this.currentState.sanity);
    console.log(`\n🧠 理智: ${this.currentState.sanity}/100 [${SANITY_CONFIG[status].label}]`);

    // 渲染选项
    const options = filterOptionsBySanity(latestScene.options, this.currentState.sanity);
    const optionsWithWarnings = addSanityWarnings(options, this.currentState.sanity);

    console.log(`\n⚡ 可用选项:`);
    optionsWithWarnings.forEach((opt, i) => {
      const riskIcon = opt.risk_level === 'high' ? '🔴' : opt.risk_level === 'medium' ? '🟡' : '🟢';
      const typeIcon = this.getTypeIcon(opt.type);
      console.log(`   ${i + 1}. ${riskIcon} ${typeIcon} ${opt.text}`);
    });

    console.log('\n' + '='.repeat(60));
  }

  private getTypeIcon(type: Option['type']): string {
    const icons = {
      investigate: '🔍',
      talk: '💬',
      fight: '⚔️',
      hack: '💻',
      move: '🚶',
    };
    return icons[type] || '•';
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): PlayerState {
    return this.currentState;
  }

  /**
   * 获取场景历史
   */
  getSceneHistory(): GameSceneResponse[] {
    return this.sceneHistory;
  }
}

// ========================================
// 使用示例
// ========================================

export async function runGameExample(): Promise<void> {
  console.log('🎮 无限侦探 - 游戏循环示例\n');

  // 创建游戏管理器
  const game = new GameManager();

  // 显示初始状态
  console.log('📊 初始状态:');
  console.log(`   HP: ${game.getCurrentState().hp}`);
  console.log(`   理智: ${game.getCurrentState().sanity}`);
  console.log(`   位置: ${game.getCurrentState().location}`);

  // 模拟几个游戏回合
  await game.handlePlayerChoice('opt_talk_bartender', '向酒保打听消息');
  game.renderScene();

  // 模拟理智值下降
  console.log('\n💥 模拟：目睹恐怖场景，理智值 -20');
  const currentState = game.getCurrentState();
  currentState.sanity = Math.max(0, currentState.sanity - 20);

  await game.handlePlayerChoice('opt_approach_woman', '走向那个神秘女子');
  game.renderScene();

  // 再次下降理智
  console.log('\n💥 模拟：黑客入侵失败，理智值 -15');
  currentState.sanity = Math.max(0, currentState.sanity - 15);

  await game.handlePlayerChoice('opt_hack_terminal', '尝试入侵终端');
  game.renderScene();

  // 继续下降到危险水平
  console.log('\n💥 模拟：发现真相，理智值 -25');
  currentState.sanity = Math.max(0, currentState.sanity - 25);

  await game.handlePlayerChoice('opt_scream', '尖叫');
  game.renderScene();

  console.log('\n✨ 游戏循环示例完成');
}

// ========================================
// 理智值影响测试
// ========================================

export function testSanityImpact(): void {
  console.log('\n🧪 理智值影响测试\n');

  const testCases = [
    { sanity: 100, label: '完全清醒' },
    { sanity: 75, label: '清醒' },
    { sanity: 50, label: '压力' },
    { sanity: 35, label: '崩溃边缘' },
    { sanity: 15, label: '精神崩溃' },
  ];

  const sampleOptions: Option[] = [
    { id: '1', text: '仔细调查', type: 'investigate', risk_level: 'low' },
    { id: '2', text: '与 NPC 对话', type: 'talk', risk_level: 'medium' },
    { id: '3', text: '黑客入侵', type: 'hack', risk_level: 'high' },
    { id: '4', text: '战斗', type: 'fight', risk_level: 'high' },
  ];

  testCases.forEach(({ sanity, label }) => {
    console.log(`\n📊 理智值: ${sanity} [${label}]`);

    const status = getSanityStatus(sanity);
    console.log(`   状态: ${SANITY_CONFIG[status].label}`);

    const filtered = filterOptionsBySanity(sampleOptions, sanity);
    console.log(`   可用选项: ${filtered.length}/${sampleOptions.length}`);

    const withWarnings = addSanityWarnings(sampleOptions, sanity);
    withWarnings.forEach((opt) => {
      console.log(`   - ${opt.text}`);
    });

    const styles = getAtmosphereAndSanityStyles('neon_rain', sanity);
    console.log(`   视觉效果: ${styles.effects.join(', ') || '无'}`);
  });

  console.log('\n✨ 测试完成');
}

// 运行示例
if (require.main === module) {
  (async () => {
    await runGameExample();
    testSanityImpact();
  })();
}
