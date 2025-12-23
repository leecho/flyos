<template>
  <div
    class="relative flex items-center justify-center overflow-hidden transition-all duration-300 group shadow-lg"
    :class="[sizeClasses[size], roundedClasses[rounded], bgGradient]"
  >
    <!-- 玻璃光泽效果层 -->
    <div class="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
    <div class="absolute inset-x-0 top-0 h-px bg-white/30"></div>

    <!-- 图标内容 (Lucide 风格 SVG) -->
    <div class="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">

      <!-- 资源管理器 -->
      <svg v-if="id === 'explorer'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 5.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"></path></svg>

      <!-- Edge 浏览器 -->
      <svg v-else-if="id === 'edge'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>

      <!-- 终端 -->
      <svg v-else-if="id === 'terminal'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>

      <!-- 应用商店 -->
      <svg v-else-if="id === 'store'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>

      <!-- 设置 -->
      <svg v-else-if="id === 'settings'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>

      <!-- 照片 -->
      <svg v-else-if="id === 'photos'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>

      <!-- 日历 -->
      <svg v-else-if="id === 'calendar'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>

      <!-- 音乐 -->
      <svg v-else-if="id === 'music'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>

      <!-- 记事本 -->
      <svg v-else-if="id === 'notepad'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>

      <!-- 邮件 -->
      <svg v-else-if="id === 'mail' || id === 'news' || id === 'weather'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path><rect width="20" height="14" x="2" y="5" rx="2"></rect></svg>

      <!-- 默认兜底 -->
      <svg v-else :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>

    </div>

    <!-- 底部渐变高光 -->
    <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  id: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}>(), {
  size: 'md',
  rounded: 'md'
})

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

const iconSize = computed(() => {
  const map = { sm: 16, md: 24, lg: 34, xl: 48 }
  return map[props.size]
})

const roundedClasses = {
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full'
}

// 基于应用 ID 的配色方案
const bgGradient = computed(() => {
  const gradients = {
    explorer: 'bg-gradient-to-br from-amber-400 to-orange-500',
    edge: 'bg-gradient-to-br from-blue-400 to-cyan-600',
    terminal: 'bg-gradient-to-br from-gray-700 to-black',
    store: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    settings: 'bg-gradient-to-br from-slate-400 to-slate-600',
    photos: 'bg-gradient-to-br from-indigo-400 to-purple-600',
    calendar: 'bg-gradient-to-br from-rose-400 to-red-600',
    music: 'bg-gradient-to-br from-purple-500 to-pink-600',
    notepad: 'bg-gradient-to-br from-orange-400 to-yellow-600',
    mail: 'bg-gradient-to-br from-sky-400 to-blue-500',
    weather: 'bg-gradient-to-br from-sky-400 to-blue-500',
    news: 'bg-gradient-to-br from-sky-400 to-blue-500'
  }
  return gradients[props.id] || 'bg-gradient-to-br from-blue-500 to-indigo-600'
})
</script>
