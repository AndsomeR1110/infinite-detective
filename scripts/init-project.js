#!/usr/bin/env node

/**
 * 无限侦探 - 项目初始化脚本
 * 运行: node scripts/init-project.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎮 无限侦探 - 项目初始化\n');

// ==================== 1. 创建必要的目录结构 ====================
const directories = [
  'app',
  'app/api/game/action',
  'components',
  'hooks',
  'lib',
  'types',
  'utils',
  'prompts',
  'docs',
  'scripts',
  'public',
];

console.log('📁 创建目录结构...');
directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  ✅ 创建: ${dir}/`);
  } else {
    console.log(`  ⏭️  已存在: ${dir}/`);
  }
});

// ==================== 2. 创建配置文件 ====================
console.log('\n📝 创建配置文件...');

// package.json
const packageJson = {
  name: 'infinite-detective',
  version: '0.1.0',
  private: true,
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint',
  },
  dependencies: {
    'next': '^14.0.0',
    'react': '^18.0.0',
    'react-dom': '^18.0.0',
    'ai': '^3.0.0',
    '@ai-sdk/openai': '^1.0.0',
    'zod': '^3.22.0',
  },
  devDependencies: {
    '@types/node': '^20.0.0',
    '@types/react': '^18.0.0',
    '@types/react-dom': '^18.0.0',
    'typescript': '^5.0.0',
    'tailwindcss': '^3.4.0',
    'autoprefixer': '^10.0.0',
    'postcss': '^8.0.0',
    'eslint': '^8.0.0',
    'eslint-config-next': '^14.0.0',
  },
};

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('  ✅ 创建: package.json');
} else {
  console.log('  ⏭️  已存在: package.json');
}

// tsconfig.json
const tsConfig = {
  compilerOptions: {
    target: 'es5',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: true,
    plugins: [
      {
        name: 'next',
      },
    ],
    paths: {
      '@/*': ['./*'],
    },
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules'],
};

const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
if (!fs.existsSync(tsConfigPath)) {
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  console.log('  ✅ 创建: tsconfig.json');
} else {
  console.log('  ⏭️  已存在: tsconfig.json');
}

// next.config.js
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
`;

const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (!fs.existsSync(nextConfigPath)) {
  fs.writeFileSync(nextConfigPath, nextConfig);
  console.log('  ✅ 创建: next.config.js');
} else {
  console.log('  ⏭️  已存在: next.config.js');
}

// ==================== 3. 创建环境变量模板 ====================
console.log('\n🔐 创建环境变量模板...');
const envTemplate = `# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# API 配置
API_URL=/api/game/action

# 游戏配置
NEXT_PUBLIC_GAME_TITLE=无限侦探
NEXT_PUBLIC_GAME_VERSION=0.1.0
`;

const envPath = path.join(process.cwd(), '.env.example');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('  ✅ 创建: .env.example');
  console.log('  ⚠️  请复制 .env.example 到 .env 并填入你的 API Key');
} else {
  console.log('  ⏭️  已存在: .env.example');
}

// ==================== 4. 创建 .gitignore ====================
console.log('\n🚫 创建 .gitignore...');
const gitignore = `# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
`;

const gitignorePath = path.join(process.cwd(), '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(gitignorePath, gitignore);
  console.log('  ✅ 创建: .gitignore');
} else {
  console.log('  ⏭️  已存在: .gitignore');
}

// ==================== 5. 创建 README ====================
console.log('\n📚 创建 README...');
const readme = `# 无限侦探 (Infinite Detective)

一款由 LLM 实时驱动的赛博朋克+黑色电影风格文字冒险游戏。

## 🎮 核心特性

- **理智值系统**：玩家的理智值影响看到的叙事、可用选项和视觉效果
- **流式打字机**：使用 requestAnimationFrame 实现流畅的打字机效果
- **动态氛围**：根据剧情氛围自动切换视觉风格（霓虹、雨夜、危险等）
- **幻觉系统**：低理智时看到幻觉内容，带 Glitch 故障效果
- **实时 AI**：使用 Vercel AI SDK 实现流式 JSON 响应

## 🚀 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置环境变量

\`\`\`bash
cp .env.example .env
\`\`\`

编辑 \`.env\` 文件，填入你的 OpenAI API Key：

\`\`\`
OPENAI_API_KEY=sk-your-key-here
\`\`\`

### 3. 运行开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:3000 查看游戏。

访问 http://localhost:3000/test-typewriter 查看 useTypewriter Hook 测试。

## 📁 项目结构

\`\`\`
infinite-detective/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 主游戏页面
│   ├── test-typewriter/     # 打字机 Hook 测试页面
│   ├── api/game/action/     # 游戏动作 API
│   └── globals.css          # 全局样式
├── hooks/                   # 自定义 React Hooks
│   └── use-typewriter.ts    # 流式打字机 Hook
├── types/                   # TypeScript 类型定义
│   └── game.ts              # 游戏数据结构
├── utils/                   # 工具函数
│   ├── sanity-system.ts     # 理智值系统
│   └── streaming-json-parser.ts  # 流式 JSON 解析
├── prompts/                 # AI 提示词
│   └── system-prompt-v2.ts  # System Prompt
└── docs/                    # 文档
    ├── SANITY-SYSTEM.md     # 理智值系统文档
    ├── TECHNICAL-GUIDE.md   # 技术实现指南
    └── QUICK-REFERENCE.md   # 快速参考
\`\`\`

## 🎯 核心技术

- **Next.js 14**: App Router + Server Actions
- **Vercel AI SDK**: 流式 AI 响应
- **Tailwind CSS**: 实用优先的样式
- **TypeScript**: 类型安全
- **Zod**: Schema 验证

## 🧠 理智值系统

理智值 (0-100) 是游戏的核心机制：

- **70-100 (清醒)**: 正常叙述，所有选项可用
- **40-69 (压力)**: 偶尔幻觉，移除 20% 高级选项
- **20-39 (崩溃)**: 明显幻觉，只有基础选项
- **0-19 (疯狂)**: 大部分幻觉，只有生存本能

详见 [docs/SANITY-SYSTEM.md](./docs/SANITY-SYSTEM.md)

## 🎨 视觉效果

- 高 tension (>80): 红屏 + 抖动
- 低 sanity (<30): 幻觉内容的 Glitch 效果
- 动态氛围: 霓虹雨夜、黑色电影酒吧、数字空间等

## 📝 开发进度

- [x] 数据结构设计
- [x] System Prompt 设计
- [x] 理智值系统
- [x] 流式打字机 Hook
- [x] 前端页面框架
- [ ] API 路由实现
- [ ] 实际游戏内容
- [ ] 音效系统
- [ ] 存档系统

## 📄 许可证

MIT
`;

const readmePath = path.join(process.cwd(), 'README.md');
if (!fs.existsSync(readmePath)) {
  fs.writeFileSync(readmePath, readme);
  console.log('  ✅ 创建: README.md');
} else {
  console.log('  ⏭️  已存在: README.md');
}

// ==================== 完成 ====================
console.log('\n✨ 初始化完成！\n');
console.log('下一步：');
console.log('  1. 运行 npm install 安装依赖');
console.log('  2. 复制 .env.example 到 .env 并配置 API Key');
console.log('  3. 运行 npm run dev 启动开发服务器\n');
console.log('祝你开发愉快！🎮');
