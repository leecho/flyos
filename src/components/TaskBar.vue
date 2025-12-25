<template>
  <div class="taskbar-container fixed bottom-0 left-0 w-full h-12 z-[99999] flex items-center px-2 select-none">

    <!-- 左侧：开始按钮 -->
    <div class="flex items-center">
      <div
        class="start-button w-10 h-10 rounded-lg flex items-center justify-center
               bg-blue-500/20 hover:bg-blue-500/40 border border-white/10
               text-blue-400 text-xl transition-all duration-300 cursor-pointer group"
        @click="startMenuRef.toggleOpen()"
      >
        <span class="group-hover:scale-110 group-active:scale-90 transition-transform">⊞</span>
      </div>
    </div>

    <!-- 中间：运行中的任务 -->
    <div class="flex-1 flex justify-center items-center gap-1.5 overflow-x-auto no-scrollbar px-4">
      <TaskBarItem
        v-for="win in windowStore.windows"
        :key="win.id"
        :window="win"
        @contextmenu="openWindowContextMenu($event, win)"
        @click="toggleActive(win.id)"
      />
    </div>

    <!-- 右侧：系统托盘 (时间、通知等) -->
    <div @click='notificationCenterRef.toggleOpen()' class="flex items-center gap-2 px-2 h-10 rounded-lg hover:bg-white/10 transition-colors cursor-default text-xs font-medium">
      <div class="flex flex-col items-end leading-tight text-gray-700 dark:text-gray-300">
        <span>{{ currentTime }}</span>
        <span>{{ currentDate }}</span>
      </div>
      <div class="w-4 h-4 text-gray-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <ContextMenu ref="menuRef" />
    <StartMenu ref="startMenuRef" />
    <NotificationCenter ref="notificationCenterRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { toggleActive, toggleMaximize, toggleMinimize, WindowItem, windowStore } from '../stores/windowStore'
import TaskBarItem from "./TaskBarItem.vue"
import ContextMenu from './ContextMenu.vue'
import StartMenu from './StartMenu.vue'
import { stopTask } from '../stores/taskStore.ts'
import NotificationCenter from './NotificationCenter.vue'

const menuRef = ref()
const startMenuRef = ref()
const currentTime = ref('')
const currentDate = ref('')
const notificationCenterRef = ref()

// 更新时间逻辑
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' })
}

let timer: any
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(() => clearInterval(timer))

const openWindowContextMenu = ($event: MouseEvent, win: WindowItem) => {
  $event.stopPropagation()
  const options = [
    { label: '最大化', action: () => toggleMaximize(win.id) },
    { label: '最小化', action: () => toggleMinimize(win.id) },
    { label: '恢复', action: () => toggleMaximize(win.id) },
    { label: '关闭', action: () => stopTask(win.appId) }
  ]
  menuRef.value.open($event, options)
}
</script>

<style scoped>
.taskbar-container {
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.7);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

.dark .taskbar-container {
  background: rgba(20, 20, 20, 0.75);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
