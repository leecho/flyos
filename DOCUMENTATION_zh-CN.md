# FlyOS 技术文档

## 1. 引言

本文档深入介绍了 FlyOS (一个基于 Web 的模拟操作系统) 的技术架构。本文档旨在让开发人员清楚地了解项目的结构、核心组件和状态管理模式，从而能够有效地做出贡献。

## 2. 核心架构

FlyOS 是一个使用 **Vue 3** 和 **Composition API** 构建的单页应用程序 (SPA)。该架构是高度组件化的，通过 **Pinia** 进行状态管理，实现了清晰的关注点分离。

- **组件驱动的 UI**: 从桌面到单个窗口的整个用户界面都由可复用的 Vue 组件构成。
- **集中式状态管理**: Pinia store 作为应用程序状态的单一事实来源，确保了数据的一致性和可预测性。
- **默认使用 TypeScript**: 代码库使用 TypeScript 编写，提供了类型安全并改善了开发体验。

## 3. 核心组件详解

本节详细介绍了构成 FlyOS 用户体验基础的最关键组件。

### 3.1. 桌面与开始菜单

**`Metro.vue`**
- **用途**: 作为主“开始菜单”屏幕。
- **功能**: 负责渲染应用磁贴网格。它从 `appStore` 获取分组数据，并渲染一个 `TileGroup.vue` 组件列表。
- **拖放**: 协调用于重新排序 `TileGroup` 的拖放功能。

**`TileGroup.vue`**
- **用途**: 管理一个命名分组（例如，“生产力”）内的一组应用磁贴。
- **功能**: 根据其 props 中传入的 `apps` 数组，渲染一个 `Tile.vue` 组件网格。它使用 CSS Grid 布局来适应不同大小的磁贴。
- **拖放**: 使用 `vue-draggable-plus` 实现组内和组间磁贴的拖放功能。

**`Tile.vue`**
- **用途**: 代表开始菜单中的单个应用磁贴。
- **功能**: 显示应用的图标、名称以及可能的实时信息（例如 `LiveTile.vue`）。它可以是多种尺寸（'small'、'medium'、'large'）。点击磁贴会启动相应的应用程序。

### 3.2. 窗口管理

**`WindowManager.vue`**
- **用途**: 所有已打开应用窗口的顶层管理器。
- **功能**: 它从 `windowStore` 读取打开的窗口列表，并为每个窗口动态渲染 `Window.vue` 组件。它确保窗口以正确的堆叠顺序（z-index）渲染。

**`Window.vue`**
- **用途**: 一个功能强大的组件，为所有应用程序提供经典的窗口框架和行为。
- **功能**:
  - **可拖动的标题栏**: 允许用户在桌面上移动窗口。
  - **可调整大小的边框**: 用户可以从任何边缘或角落调整窗口大小。
  - **窗口控件**: 包含最小化、最大化和关闭窗口的按钮。这些操作会向 `windowStore` 分发 actions。
  - **内容插槽**: 它使用一个默认插槽 (`<slot></slot>`) 来在窗口框架内渲染实际的应用程序内容。

### 3.3. 核心 UI 元素

**`TaskBar.vue`**
- **用途**: 屏幕底部的主系统任务栏。
- **功能**: 显示开始按钮、运行中应用的图标 (`TaskBarItem.vue`) 和系统托盘。它从 `taskStore` 获取正在运行的任务列表。

## 4. 使用 Pinia进行状态管理

Pinia 是 FlyOS 架构的核心。状态以模块化的方式进行规范化和存储。

**`appStore.ts`**
- **状态**: `groups`, `apps`
- **用途**: 保存所有可用应用程序的主列表，以及它们在开始菜单中是如何被组织成分组的。

**`desktopStore.ts`**
- **状态**: `wallpaper`, `contextMenu`
- **用途**: 管理桌面本身的状态，包括壁纸和全局上下文菜单。

**`taskStore.ts`**
- **状态**: `tasks`
- **用途**: 跟踪所有当前正在运行的应用程序。当用户启动一个应用时，它会被添加到 `tasks` 数组中。关闭应用则会将其移除。

**`windowStore.ts`**
- **状态**: `windows`
- **用途**: 管理每个打开窗口的完整状态。`windows` 数组中的每个窗口对象包含：
  - `id`: 窗口/任务的唯一 ID。
  - `title`, `icon`: 显示属性。
  - `position`, `size`: 窗口的当前坐标和尺寸。
  - `zIndex`: 堆叠顺序。
  - `isMinimized`, `isMaximized`: 窗口的状态。

**`themeStore.ts`**
- **状态**: `theme`
- **用途**: 管理当前的 UI 主题（例如 'light' 或 'dark'）。

## 5. 添加一个新应用

要向 FlyOS 添加新应用，请按照以下步骤操作：

1.  **创建应用组件**：
    - 在 `src/apps/` 中创建一个新的 `.vue` 文件，例如 `MyNewApp.vue`。
    - 该组件将在 `Window.vue` 框架内渲染。

2.  **在 Store 中定义应用**：
    - 打开 `src/stores/appStore.ts`。
    - 向 `apps` 数组中添加一个新的应用程序对象。
    - 该对象定义了要渲染的应用的 `id`、`name`、`icon` 和 `component`。

    ```ts
    import MyNewApp from '@/apps/MyNewApp.vue'

    // ... in the apps array
    {
      id: 'mynewapp',
      name: 'My New App',
      icon: MyNewAppIcon, // 导入一个图标
      component: MyNewApp,
      tile: { size: 'small' }
    }
    ```

3.  **添加到磁贴分组**：
    - 在同一个文件 (`appStore.ts`) 中，找到 `groups` 数组。
    - 将您的新应用的 `id` (`'mynewapp'`) 添加到现有分组之一，或为其创建一个新分组。

## 6. 组合式函数 (Composables)

可复用的逻辑被提取到 `src/composables/` 目录下的组合式函数中。

**`useWindowAnimator.ts`**
- **用途**: 为窗口的打开和关闭提供动画，使 UI 感觉更流畅。
- **用法**: 集成在 `Window.vue` 组件中。
