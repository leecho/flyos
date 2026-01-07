# FlyOS - 一个基于 Web 的操作系统模拟

<p align="center">
  <img src="public/logo.svg" alt="FlyOS Logo" width="150"/>
</p>

<h3 align="center">
  一个使用 Vue.js 和 Tailwind CSS 构建的现代开源 Windows 11 克隆。
</h3>

<p align="center">
  <a href="https://flyos-one.vercel.app/"><strong>在线演示 »</strong></a>
</p>

<p align="center">
  <a href="DOCUMENTATION.md"><strong>技术文档 (英文) »</strong></a> ·
  <a href="DOCUMENTATION_zh-CN.md"><strong>技术文档 (中文) »</strong></a>
</p>

---

## 关于项目

FlyOS 是一个雄心勃勃的项目，旨在在 Web 浏览器中复制 Windows 11 美观直观的用户界面。它利用现代 Web 技术创造了快速、响应迅速且功能丰富的桌面体验。

该项目使用 `Vite` 进行了初始化，并基于组件化架构构建，使其模块化且易于维护。

### 特性

- **Windows 11 风格的用户界面**：对 Windows 11 桌面、开始菜单、任务栏和小部件的忠实再现。
- **基于组件的架构**：使用 Vue 3 组件构建，以实现模块化和可重用性。
- **状态管理**：使用 Pinia 进行集中式状态管理，以实现可预测的状态转换。
- **可拖动和可调整大小的窗口**：功能齐全的窗口管理器，带来逼真的桌面感觉。
- **可自定义的开始菜单**：固定和排列您喜欢的应用程序。
- **内置应用程序套件**：包括浏览器、记事本、终端等基本应用程序。
- **主题化**：支持浅色和深色模式。

## 技术栈

- **[Vue 3](https://vuejs.org/)**：核心的渐进式 JavaScript 框架。
- **[Vite](https://vitejs.dev/)**：下一代前端工具，提供快速的开发体验。
- **[TypeScript](https://www.typescriptlang.org/)**：用于健壮的、静态类型的代码。
- **[Tailwind CSS](https://tailwindcss.com/)**：一个实用程序优先的 CSS 框架，用于快速的 UI 开发。
- **[Pinia](https://pinia.vuejs.org/)**：Vue 的官方状态管理库。
- **[vue-draggable-plus](https://github.com/Alfred-Skyblue/vue-draggable-plus)**：用于拖放功能。

## 入门指南

要获取本地副本并运行，请按照以下简单步骤操作。

### 先决条件

- [Node.js](https://nodejs.org/) (v18.x 或更高版本)
- [pnpm](https://pnpm.io/) (或 npm/yarn)

### 安装

1. **克隆仓库**
   ```sh
   git clone https://github.com/your-username/flyos.git
   cd flyos
   ```

2. **安装依赖项**
   ```sh
   pnpm install
   ```

3. **运行开发服务器**
   ```sh
   pnpm dev
   ```
   您的应用程序将在 `http://localhost:5173` 上可用。

### 构建生产版本

要创建生产就绪的构建：
```sh
pnpm build
```
输出将在 `dist` 文件夹中，可以部署到任何静态托管服务。

## 项目结构

项目遵循标准的 Vue 3 结构：

```
flyos/
├── public/              # 静态资源
├── src/
│   ├── apps/            # 每个内置应用程序的 Vue 组件
│   ├── assets/          # 图像、字体等
│   ├── components/      # 可重用的 UI 组件（窗口、磁贴、任务栏等）
│   ├── composables/     # 可重用的 Vue 组合式函数
│   ├── stores/          # 用于状态管理的 Pinia 存储
│   ├── styles/          # 全局样式和字体
│   ├── tiles/           # 开始菜单中动态磁贴的组件
│   ├── types/           # TypeScript 类型定义
│   ├── App.vue          # 主应用程序组件
│   └── main.ts          # 应用程序入口点
├── package.json
└── vite.config.ts
```

## 截图

<p align="center">
  <img src="screenshots/image.png" alt="FlyOS Screenshot"/>
</p>

<p align="center">
  <img src="screenshots/image2.png" alt="FlyOS Screenshot"/>
</p>
<p align="center">
  <img src="screenshots/image3.png" alt="FlyOS Screenshot"/>
</p>
<p align="center">
  <img src="screenshots/image4.png" alt="FlyOS Screenshot"/>
</p>


## 贡献

贡献使开源社区成为一个学习、启发和创造的绝佳场所。我们**非常感谢**您所做的任何贡献。

如果您有任何可以改进此项目的建议，请 fork 该仓库并创建拉取请求。您也可以简单地打开一个带有“enhancement”标签的 issue。

## 许可证

根据 Apache 许可证分发。有关更多信息，请参阅 `LICENSE`。
