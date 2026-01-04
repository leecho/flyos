# FlyOS Technical Documentation

## 1. Introduction

This document provides a deep dive into the technical architecture of FlyOS, a web-based operating system simulation. The goal of this documentation is to give developers a clear understanding of the project's structure, core components, and state management patterns, enabling them to contribute effectively.

## 2. Core Architecture

FlyOS is built as a single-page application (SPA) using **Vue 3** and the **Composition API**. The architecture is heavily component-based, with a clear separation of concerns facilitated by **Pinia** for state management.

- **Component-Driven UI**: The entire user interface, from the desktop to individual windows, is composed of reusable Vue components.
- **Centralized State**: Pinia stores act as the single source of truth for the application's state, ensuring data consistency and predictability.
- **TypeScript by Default**: The codebase is written in TypeScript, providing type safety and improved developer experience.

## 3. Component Deep Dive

This section details the most critical components that form the foundation of the FlyOS user experience.

### 3.1. Desktop & Start Menu

**`Metro.vue`**
- **Purpose**: Acts as the main Start Menu screen.
- **Functionality**: It is responsible for rendering the grid of application tiles. It fetches the group data from the `appStore` and renders a list of `TileGroup.vue` components.
- **Drag & Drop**: It orchestrates the drag-and-drop functionality for reordering `TileGroup`s.

**`TileGroup.vue`**
- **Purpose**: Manages a collection of application tiles within a named group (e.g., "Productivity").
- **Functionality**: Renders a grid of `Tile.vue` components based on the `apps` array passed in its props. It uses a CSS Grid layout to accommodate tiles of different sizes.
- **Drag & Drop**: Implements drag-and-drop for tiles within the group and between different groups, using `vue-draggable-plus`.

**`Tile.vue`**
- **Purpose**: Represents a single application tile in the Start Menu.
- **Functionality**: Displays an app's icon, name, and potentially live information (e.g., `LiveTile.vue`). It can be of various sizes ('small', 'medium', 'large'). Clicking a tile launches the corresponding application.

### 3.2. Window Management

**`WindowManager.vue`**
- **Purpose**: The top-level manager for all open application windows.
- **Functionality**: It reads the list of open windows from the `windowStore` and dynamically renders `Window.vue` components for each one. It ensures that windows are rendered in the correct stacking order (z-index).

**`Window.vue`**
- **Purpose**: A highly versatile component that provides the classic window frame and behavior for all applications.
- **Functionality**:
  - **Draggable Header**: Allows the user to move the window around the desktop.
  - **Resizable Borders**: Users can resize the window from any edge or corner.
  - **Window Controls**: Contains buttons for minimizing, maximizing, and closing the window. These actions dispatch mutations to the `windowStore`.
  - **Content Slot**: It uses a default slot (`<slot></slot>`) to render the actual application content inside the window frame.

### 3.3. Core UI Elements

**`TaskBar.vue`**
- **Purpose**: The main system taskbar at the bottom of the screen.
- **Functionality**: Displays the Start button, icons for running applications (`TaskBarItem.vue`), and the system tray. It gets the list of running tasks from the `taskStore`.

## 4. State Management with Pinia

Pinia is central to FlyOS's architecture. State is normalized and stored in a modular fashion.

**`appStore.ts`**
- **State**: `groups`, `apps`
- **Purpose**: Holds the master list of all available applications and how they are organized into groups for the Start Menu.

**`desktopStore.ts`**
- **State**: `wallpaper`, `contextMenu`
- **Purpose**: Manages the state of the desktop itself, including the wallpaper and the global context menu.

**`taskStore.ts`**
- **State**: `tasks`
- **Purpose**: Keeps track of all currently running applications. When a user starts an app, it's added to the `tasks` array. Closing an app removes it.

**`windowStore.ts`**
- **State**: `windows`
- **Purpose**: Manages the complete state of every open window. Each window object in the `windows` array contains:
  - `id`: The unique ID of the window/task.
  - `title`, `icon`: Display properties.
  - `position`, `size`: The window's current coordinates and dimensions.
  - `zIndex`: The stacking order.
  - `isMinimized`, `isMaximized`: The window's state.

**`themeStore.ts`**
- **State**: `theme`
- **Purpose**: Manages the current UI theme (e.g., 'light' or 'dark').

## 5. Adding a New Application

To add a new application to FlyOS, follow these steps:

1.  **Create the App Component**:
    - Create a new `.vue` file in `src/apps/`, for example, `MyNewApp.vue`.
    - This component will be rendered inside a `Window.vue` frame.

2.  **Define the App in the Store**:
    - Open `src/stores/appStore.ts`.
    - Add a new application object to the `apps` array.
    - This object defines the `id`, `name`, `icon`, and the component to be rendered.

    ```ts
    import MyNewApp from '@/apps/MyNewApp.vue'

    // ... in the apps array
    {
      id: 'mynewapp',
      name: 'My New App',
      icon: MyNewAppIcon, // Import an icon
      component: MyNewApp,
      tile: { size: 'small' }
    }
    ```

3.  **Add to a Tile Group**:
    - In the same file (`appStore.ts`), find the `groups` array.
    - Add the `id` of your new app (`'mynewapp'`) to one of the existing groups, or create a new group for it.

## 6. Composables

Reusable logic is extracted into composables in the `src/composables/` directory.

**`useWindowAnimator.ts`**
- **Purpose**: Provides animations for window opening and closing, making the UI feel more fluid.
- **Usage**: Integrated into the `Window.vue` component.
