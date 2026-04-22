# FlyOS UI 设计标准 (v1.1)

本文件定义了 FlyOS 的视觉语言与交互规范。设计初衷是打造一个**如空气般轻盈 (Airy)**、**如水般流动 (Fluid)** 的操作系统。

---

## 1. 核心设计哲学

*   **Airy (空明)**: 充足的留白，通过光影而非粗线条来区分层级。
*   **Translucent (通透)**: 大规模使用毛玻璃，模糊现实与数字系统的边界。
*   **Precision (精准)**: 每一个像素的对齐与每一个圆角的平滑度都经过严谨考量。

---

## 2. 基础视觉原子 (Visual Tokens)

### 2.1 色彩系统 (Color Hierarchy)

FlyOS 采用基于功能的语义化色彩体系，确保深浅色切换的一致性。

| 类别 | Token | 浅色模式 | 深色模式 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **背景** | `--fly-bg-primary` | `#FFFFFF` | `#020617` (Slate-950) | 主应用背景 |
| | `--fly-bg-secondary` | `#F8FAF8` | `#0F172A` (Slate-900) | 侧边栏/底部栏 |
| | `--fly-bg-glass` | `rgba(255,255,255,0.7)` | `rgba(15,23,42,0.7)` | 毛玻璃容器底色 |
| **文字** | `--fly-text-primary` | `#0F172A` | `#F8FAFC` | 正文标题 |
| | `--fly-text-secondary`| `#64748B` | `#94A3B8` | 副标题/辅助说明 |
| **边框** | `--fly-border-system`| `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.1)` | 分割线 |
| | `--fly-border-glass` | `rgba(255,255,255,0.4)` | `rgba(255,255,255,0.05)` | 玻璃容器边框 |
| **强调** | `--fly-accent` | `#3B82F6` (可配置) | `#60A5FA` | 系统主色调 |

### 2.2 圆角体系 (Corner Radii)

圆角应保持整体的柔和感。

*   **窗口 (Window)**: `16px` (`--fly-radius-lg`)
*   **应用图标 (App Icon)**: `12px` (`--fly-radius-md`)
*   **按钮/输入框 (UI Elements)**: `8px` (`--fly-radius-sm`)

### 2.3 效果规范 (Effects)

*   **模糊 (Blur)**: 通用模糊值为 `16px`。
*   **阴影 (Shadow)**: 
    *   **Level 1 (静止)**: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
    *   **Level 2 (活动)**: `0 20px 25px -5px rgb(0 0 0 / 0.1)`

---

## 3. 布局与组件 (Layouts)

### 3.1 窗口 (Windows)
*   **标题栏**: 固定高度 `40px`。
*   **圆角边界**: 窗口必须具有 `overflow: hidden` 以裁切子元素。
*   **玻璃比例**: 建议侧边栏使用高度模糊（`16px+`），主内容区使用低透明度背景。

### 3.2 响应式 (Responsiveness)
*   窗口宽度 `< 600px` 时，侧边栏应自动隐藏或转化为 Overlay 抽屉模式。

---

## 4. 实施代码建议 (CSS Implementation)

```css
:root {
  /* 定义变量... */
  --fly-bg-primary: #ffffff;
  --fly-radius-lg: 16px;
}

.dark {
  --fly-bg-primary: #020617;
}

/* 使用示例 */
.window {
  background: var(--fly-bg-glass);
  backdrop-filter: blur(var(--fly-glass-blur));
  border-radius: var(--fly-radius-lg);
  border: 1px solid var(--fly-border-glass);
}
```
