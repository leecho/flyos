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
      <svg v-if="id === 'explorer'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 5.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>

      <!-- 浏览器 -->
      <svg v-else-if="id === 'edge'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/><path d="M12 2a14.5 14.5 0 0 0-4.5 10 14.5 14.5 0 0 0 4.5 10"/></svg>

      <!-- 终端 -->
      <svg v-else-if="id === 'terminal'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>

      <!-- 应用商店 -->
      <svg v-else-if="id === 'store'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>

      <!-- 天气 -->
      <svg v-else-if="id === 'weather'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19x.1a4.5 4.5 0 0 0 .4-8.9 5 5 0 1 0-8.9 4.4"/><circle cx="12" cy="12" r="3"/></svg>

      <!-- 设置 -->
      <svg v-else-if="id === 'settings'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>

      <!-- 邮件 -->
      <svg v-else-if="id === 'mail'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>

      <!-- 日历 -->
      <svg v-else-if="id === 'calendar'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>

      <!-- 新闻 -->
      <svg v-else-if="id === 'news'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>

      <!-- 音乐 -->
      <svg v-else-if="id === 'music'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>

      <!-- 记事本 -->
      <svg v-else-if="id === 'notepad'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>

      <!-- 默认兜底 -->
      <svg v-else :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/></svg>

    </div>

    <!-- 悬浮微光层 -->
    <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
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
  mini: 'w-5 h-5',
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

/**
 * 基于应用 ID 的配色方案
 * 采用符合应用语义的高对比度渐变色
 */
const bgGradient = computed(() => {
  const gradients: Record<string, string> = {
    explorer: 'bg-gradient-to-br from-amber-400 to-orange-500',
    edge: 'bg-gradient-to-br from-blue-400 to-cyan-600',
    terminal: 'bg-gradient-to-br from-slate-700 to-slate-900',
    store: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    weather: 'bg-gradient-to-br from-sky-400 to-blue-500',
    settings: 'bg-gradient-to-br from-gray-400 to-gray-600',
    mail: 'bg-gradient-to-br from-red-400 to-rose-600',
    calendar: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    news: 'bg-gradient-to-br from-sky-600 to-blue-800',
    music: 'bg-gradient-to-br from-purple-500 to-fuchsia-700',
    notepad: 'bg-gradient-to-br from-orange-400 to-amber-600'
  }
  return gradients[props.id] || 'bg-gradient-to-br from-blue-500 to-purple-600'
})
</script>

<style scoped>
.group:hover {
  filter: brightness(1.1);
}
</style>
