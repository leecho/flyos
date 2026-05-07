<template>
  <div ref='containerRef' class='h-full w-full flex flex-col bg-transparent relative overflow-hidden'
       v-show='!userStore.user.locked'
       @contextmenu.prevent='openContextMenu'>

    <!-- 桌面层级切换动画 -->
      <Transition name='desktop-fade'>
        <div v-if="desktopStore.mode == 'desktop'" class="absolute">
          <Desktop />
        </div>
      </Transition>

      <Transition name='metro-fade'>
        <div v-if="desktopStore.mode == 'metro'" class="absolute">
          <Metro />
        </div>
      </Transition>

    <TaskBar v-if="!desktopStore.isMobile" />
    <HomeBar v-else />
    <AppSwitcher />
    <ControlCenter />
    <NotificationSystem v-if="!desktopStore.isMobile" />
    <MobileNotificationSystem v-else />
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
import HomeBar from './HomeBar.vue'
import AppSwitcher from './AppSwitcher.vue'
import ControlCenter from './ControlCenter.vue'
import NotificationSystem from './NotificationSystem.vue'
import MobileNotificationSystem from './MobileNotificationSystem.vue'
import { themeStore } from '../stores/themeStore.ts'
import { ref, onMounted, onUnmounted } from 'vue'
import { CheckIcon,LockIcon, SettingsIcon, PaletteIcon, LayoutDashboardIcon, ExpandIcon, ShrinkIcon } from 'lucide-vue-next'
import { startTask } from '../stores/taskStore.ts'
import { getAppById } from '../stores/appStore.ts'
import { useFullscreen } from '../composables/useFullscreen'

const { isFullscreen, toggleFullscreen } = useFullscreen()

const containerRef = ref<HTMLElement | null>(null)
const menuRef = ref()

// 移动端监测
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect
        desktopStore.isMobile = width < 768
      }
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

const openContextMenu = ($event: any) => {
  const desktopMenu = [
    {
      label: '风格',
      icon: PaletteIcon,
      children: [
        { label: '浅色', icon: themeStore.mode.value == 'light' ? CheckIcon : null, action: () => themeStore.setTheme('light') },
        { label: '深色', icon: themeStore.mode.value == 'dark' ? CheckIcon : null, action: () => themeStore.setTheme('dark') },
        { label: '系统', icon: themeStore.mode.value == 'system' ? CheckIcon : null, action: () => themeStore.setTheme('system') }
      ]
    },
    {
      label: '布局',
      icon: LayoutDashboardIcon,
      children: [
        { label: '图标', icon: desktopStore.mode == 'desktop' ? CheckIcon : null, action: () => setMode('desktop') },
        { label: '磁贴', icon: desktopStore.mode == 'metro' ? CheckIcon : null, action: () => setMode('metro') }
      ]
    },
    { type: 'divider' },
    { label: isFullscreen.value ? '退出全屏' : '全屏显示', icon: isFullscreen.value ? ShrinkIcon : ExpandIcon, action: async () => await toggleFullscreen()},
    { label: '锁定屏幕', icon: LockIcon, action: () => userStore.user.locked = true },
    { label: '个性化设置', icon: SettingsIcon, action: () => startTask(getAppById('settings')) },
  ]
  $event?.stopPropagation()
  menuRef.value.open($event, desktopMenu)

}


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
