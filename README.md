# 智能任务分解（AI List Todo）  
[![GitHub stars](https://img.shields.io/github/stars/yourname/ai-list-todo?style=social)](https://github.com/yourname/ai-list-todo) [![GitHub issues](https://img.shields.io/github/issues/yourname/ai-list-todo)](https://github.com/yourname/ai-list-todo/issues) [![MIT License](https://img.shields.io/github/license/yourname/ai-list-todo)](./LICENSE)

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,typescript,vite,tailwind" alt="Tech Stack" />
</p>

> 基于 React + TypeScript + Vite 打造的一站式高效任务管理与激励平台，通过接入豆包大模型自动将目标拆解为 6 ~ 10 步可执行任务，并在完成后提供沉浸式庆祝与数据统计，让你事半功倍，持续保持动力。

![banner](./public/favicon.svg)

---

## 📌 项目亮点

- **AI 智能分解**：输入一句话，即可自动生成详细的任务执行步骤。
- **实时激励**：完成任务后触发全屏庆祝动画与随机鼓励语，增强成就感。
- **个性化设置**：支持自定义豆包 API Key 与模型，主题深浅色一键切换。
- **数据统计**：内置统计页面，直观展示任务数量、完成率等关键指标。
- **响应式设计**：适配桌面与移动端设备，随时随地管理待办事项。
- **技术栈现代化**：React 18 + TypeScript + Vite + Tailwind CSS + Zustand 状态管理。

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/yourname/ai-list-todo.git
cd ai-list-todo
```

### 2. 安装依赖

> 推荐使用 [pnpm](https://pnpm.io/zh/) 获得更快的安装速度

```bash
# pnpm
pnpm install
# 或者使用 npm
yarn install
npm install
```

### 3. 运行开发服务器

```bash
pnpm dev
# 默认将在 http://localhost:5173 启动
```

### 4. 构建生产环境

```bash
pnpm build
```

### 5. 预览生产包

```bash
pnpm preview
```

---

## 🛠️ 使用指南

1. **创建任务**：在首页输入目标，例如“写一篇技术博客”，点击「开始智能分解」，系统将自动生成 6~10 个可执行子任务。
2. **执行任务**：点击某个分解后的步骤进入执行页面，完成后勾选「完成」；所有子任务完成后将触发全屏庆祝动画。
3. **设置 AI 配置**：首次使用请前往「设置」页，填入豆包 **API Key** 与 **模型名称**，点击「连接测试」确保可用并保存。
4. **切换主题**：在「设置」页可一键切换亮/暗色主题，亦支持跟随系统。
5. **查看统计**：在「统计」页面查看已完成任务总数、完成率、平均用时等数据。

> 更多演示与高级用法请参考 **docs/** 目录。

---

## ⚙️ 配置指南

| 配置项          | 说明                                   | 默认值 |
| --------------- | -------------------------------------- | ------ |
| API Key         | 豆包 AI 的 API Key（在设置页输入保存） | -      |
| 模型名称        | 豆包模型名称，如 `doubao-1-5-lite-32k-250115`|
| 主题            | 亮色 / 暗色                            | 系统检测 |

> 所有设置项均保存在浏览器 `localStorage`，确保数据安全且易于迁移。

---

## 🗂️ 目录结构

```text
aiListTodo/
├── public/                  # 静态资源
├── src/
│   ├── assets/              # 静态图标与图片
│   ├── components/          # 可复用 UI 组件
│   ├── hooks/               # 自定义 Hooks（主题、本地存储等）
│   ├── pages/               # 页面级组件（Home / Settings / Statistics / TaskExecution）
│   ├── services/            # 与后端或第三方 API 交互层
│   ├── types/               # 全局 TS 类型定义
│   └── index.css            # TailwindCSS 入口
├── tailwind.config.js       # Tailwind 配置
├── vite.config.ts           # Vite 配置
└── README.md                # 项目说明文件
```

---

## 🧩 核心功能演示

### 1. 智能任务分解

![task-decompose](https://raw.githubusercontent.com/yourname/ai-list-todo/main/docs/demo-decompose.gif)

### 2. 任务完成庆祝

![task-celebrate](https://raw.githubusercontent.com/yourname/ai-list-todo/main/docs/demo-celebrate.gif)

### 3. 数据统计

![statistics](https://raw.githubusercontent.com/yourname/ai-list-todo/main/docs/demo-statistics.png)

> 更多截图与演示请访问 **docs/** 目录。

---

## 🔌 第三方服务

| 服务     | 用途           | 官网链接                                  |
| -------- | -------------- | ----------------------------------------- |
| 豆包大模型 | 任务分解 AI 能力 | https://www.baai.ac.cn/                   |
| Vite     | 前端构建工具   | https://vitejs.dev                        |
| Tailwind | 原子化 CSS 框架| https://tailwindcss.com                   |

---

## 🤝 贡献指南

欢迎任何形式的贡献！

1. Fork 仓库并创建分支：`git checkout -b feature/xxx`
2. 提交修改：`git commit -m 'feat: xxx'`
3. 推送分支：`git push origin feature/xxx`
4. 发起 Pull Request 并描述您的更改

在提交代码之前，请确保通过 `pnpm lint && pnpm test`。

---

## 📄 许可证

本项目基于 **MIT License** 开源，详细内容请查看 [LICENSE](./LICENSE)。

---

## ✨ 致谢

- 感谢 [BAAI](https://www.baai.ac.cn/) 提供强大的语言模型。
- 感谢所有开源社区的贡献者，让开发变得如此高效与有趣。

---

> **保持专注，持续进步，Let\'s get things done!**
