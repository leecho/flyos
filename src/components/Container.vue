<template>
  <div class='h-full w-full flex flex-col bg-transparent relative overflow-hidden'
       v-show='!userStore.user.locked'
       @contextmenu.prevent='menuRef.open($event, desktopMenu)'>

    <!-- 桌面层级切换动画 -->
      <Transition name='desktop-fade'>
        <Desktop v-if="desktopStore.mode == 'desktop'"  />
      </Transition>

      <Transition name='metro-fade'>
        <Metro v-if="desktopStore.mode == 'metro'"  />
      </Transition>

    <TaskBar />
    <ContextMenu ref='menuRef' />
  </div>
</template>

<script setup lang='ts'>
import { userStore } from '../stores/userStore.ts'
import { desktopStore, setMode } from '../stores/desktopStore.ts'
import Metro from './Metro.vue'
import TaskBar from './TaskBar.vue'
import Desktop from './Desktop.vue'
import ContextMenu from './ContextMenu.vue'
import { themeStore } from '../stores/themeStore.ts'
import { ref } from 'vue'
import { CheckIcon } from 'lucide-vue-next'

const menuRef = ref()

const desktopMenu = [
  { label: '刷新', action: () => console.log('刷新') },
  { label: '显示设置', action: () => console.log('显示设置') },
  { type: 'divider' },
  {
    label: '风格',
    children: [
      { label: '浅色', action: () => themeStore.setTheme('light') },
      { label: '深色', action: () => themeStore.setTheme('dark') },
      { label: '系统', action: () => themeStore.setTheme('system') }
    ]
  },
  {
    label: '布局',
    children: [
      { label: '图标', icon: themeStore.mode.value == 'desktop' ? CheckIcon : null, action: () => setMode('desktop') },
      { label: '磁贴', icon: themeStore.mode.value == 'metro' ? CheckIcon : null, action: () => setMode('metro') }
    ]
  }
]
</script>

<style scoped>
/* * 1. 标准桌面 (Desktop) 的切换动画
 * 进入时：从轻微缩小状态放大并淡入
 * 离开时：缩小、模糊并淡出
 */
.desktop-fade-enter-active,
.desktop-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.3, 0, 0.2, 1);
}

.desktop-fade-enter-from {
  opacity: 0;
  transform: scale(1.05);
  filter: blur(10px);
}

.desktop-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
  filter: blur(10px);
}

/* * 2. 磁贴矩阵 (Metro) 的切换动画
 * 进入时：类似于应用抽屉从下方轻微弹起并展开
 * 离开时：向下方位移并淡出
 */
.metro-fade-enter-active,
.metro-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.metro-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.metro-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 确保两个组件切换时不发生布局跳动 */
.absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
