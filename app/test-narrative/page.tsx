'use client';

import { NarrativeRenderer } from '@/components/NarrativeRenderer';

export default function TestNarrative() {
  const testText = `你接通通讯，终端投射出一片**绿色代码流**，像瀑布一样冲刷着你的视网膜。一个经过多重加密、性别难辨的合成音响起：

"**无限侦探**。我们有个'包裹'需要你接收。地点：'**霓虹墓园**'的第三根数据柱。时间：现在。"

代码流中闪过几帧模糊的图像：一个被遗弃的服务器农场，雨水从锈蚀的管道滴落，还有……一具穿着昂贵西装、义体接口暴露在外的尸体。

"包裹很'烫'。荒坂的猎犬已经在嗅探。报酬是**记忆碎片**——足够你维持清醒一个月的量。接，还是不接？"

通讯保持静默，等待你的决定。窗外的雨声似乎更大了。`;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl mb-4 font-bold">NarrativeRenderer 测试页面</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl mb-2 font-bold">完整测试文本</h2>
          <div className="p-4 bg-gray-800 rounded text-sm">
            {testText}
          </div>
        </div>

        <div>
          <h2 className="text-xl mb-2 font-bold">NarrativeRenderer 渲染结果</h2>
          <div className="p-6 bg-black rounded border border-gray-700 min-h-[400px]">
            <NarrativeRenderer
              text={testText}
              isTyping={false}
              sanity={85}
              className="text-lg md:text-xl font-serif leading-[2] text-gray-100 whitespace-pre-wrap drop-shadow-lg tracking-wide"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl mb-2 font-bold">Markdown 格式说明</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>**粗体**: `**绿色代码流**` → 绿色代码流（粉色高亮）</li>
            <li>*斜体*: `*模糊的图像*` → 模糊的图像（灰色斜体）</li>
            <li>"对话": `"无限侦探。..."` → 独立一行，左侧紫色边框</li>
            <li>`代码`: `记忆碎片` → 记忆碎片（代码样式）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
