# VibeKid

> 让孩子通过和 AI 对话，把想法变成可以玩的作品。

VibeKid 是一个 Web 平台，让孩子可以通过自然语言与 AI 协作，创造游戏、动画、音乐等有趣的作品——完全不需要看到或理解任何代码。

## 核心理念

- **创作优先**：孩子只关注"做什么"，AI 处理"怎么做"
- **增量可见**：每一步都能看到、能玩
- **主权在孩子**：所有产品决策由孩子做
- **零技术暴露**：代码、编译等一切技术细节对孩子不可见

## 文档

- [产品设计文档](docs/DESIGN.md) — 完整的第一性原理分析、架构设计、用户旅程

## 技术栈

- **前端**: Next.js + TypeScript + Tailwind CSS
- **运行时**: Sandboxed iframe (HTML/CSS/JS + p5.js, Tone.js, matter.js)
- **AI**: OpenAI / Anthropic API（服务端）
- **数据库**: PostgreSQL + Prisma
- **部署**: Vercel

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

## 目录结构

```
VibeKid/
├── docs/               # 产品文档
│   └── DESIGN.md       # 产品设计文档
├── src/
│   ├── app/            # Next.js App Router 页面
│   ├── components/     # React 组件
│   │   ├── chat/       # 对话区域组件
│   │   ├── preview/    # 预览区域组件
│   │   ├── plan/       # 计划面板组件
│   │   └── layout/     # 布局组件
│   ├── lib/            # 工具库
│   │   ├── ai/         # AI Engine（Prompt、对话管理）
│   │   ├── runtime/    # iframe 运行时管理
│   │   └── db/         # 数据库访问
│   ├── stores/         # Zustand 状态管理
│   └── types/          # TypeScript 类型定义
├── prisma/             # Prisma schema
└── public/             # 静态资源
```

## License

MIT
