<template>
  <div
    class="relative flex items-center justify-center overflow-hidden transition-all duration-300 group select-none"
    :class="[
      sizeClasses[size],
      roundedClasses[rounded],
      !icon ? bgGradient : ''
    ]"
  >
    <!-- 背景层：如果提供了图片图标，则显示图片背景或透明背景 -->
    <div
      v-if="icon && isImageUrl"
      class="absolute inset-0 w-full h-full p-[10%]"
    >
      <img
        :src="icon"
        class="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
        @error="handleImageError"
      />
    </div>

    <!-- 玻璃光泽效果层 (仅在内置渐变背景下显著) -->
    <div
      v-if="!icon || !isImageUrl"
      class="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"
    ></div>
    <div v-if="!icon" class="absolute inset-x-0 top-0 h-px bg-white/30"></div>

    <!-- 图标内容 (组件或内联代码模式) -->
    <div
      v-if="!isImageUrl"
      class="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center"
    >
      <!-- 渲染传入的图标组件或本地内置 SVG -->
      <component
        v-if="iconComponent"
        :is="iconComponent"
        :width="iconSize"
        :height="iconSize"
      />

      <!-- 如果没有任何图标提供，则根据 ID 降级显示内置图标 -->
      <template v-else>
        <!-- 资源管理器 -->
        <svg v-if="id === 'explorer'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 5.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/></svg>
        <!-- 浏览器 -->
        <svg v-else-if="id === 'edge'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <!-- 终端 -->
        <svg v-else-if="id === 'terminal'" :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
        <!-- 默认兜底图标 -->
        <svg v-else :width="iconSize" :height="iconSize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
      </template>
    </div>

    <!-- 运行状态指示器 (Windows 11 任务栏风格的小横杠) -->
    <div
      v-if="running"
      class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-white rounded-full transition-all duration-300"
      :class="active ? 'w-4 opacity-100' : 'w-1.5 opacity-60'"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  id: string
  icon?: any              // 可以是 URL 字符串，也可以是 Vue 组件对象
  size?: 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  running?: boolean       // 是否正在运行
  active?: boolean        // 是否是当前焦点窗口
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  rounded: 'md',
  running: false,
  active: false
})

const imageError = ref(false)

/** 判断是否为图片 URL */
const isImageUrl = computed(() => {
  if (typeof props.icon !== 'string') return false
  if (imageError.value) return false
  // 匹配常见图片后缀、base64 或 http 协议
  return props.icon.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) != null ||
    props.icon.startsWith('data:image') ||
    props.icon.startsWith('http')
})

/** 获取图标组件 */
const iconComponent = computed(() => {
  if (props.icon && typeof props.icon === 'object') return props.icon
  return null
})

const handleImageError = () => {
  imageError.value = true
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

const iconSize = computed(() => {
  const map = { sm: 16, md: 24, lg: 32, xl: 48 }
  return map[props.size]
})

const roundedClasses = {
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full'
}

/** 基于应用 ID 的兜底渐变配色方案 */
const bgGradient = computed(() => {
  const gradients: Record<string, string> = {
    explorer: 'bg-gradient-to-br from-amber-400 to-orange-500',
    edge: 'bg-gradient-to-br from-blue-400 to-cyan-600',
    terminal: 'bg-gradient-to-br from-slate-700 to-slate-900',
    store: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    settings: 'bg-gradient-to-br from-gray-400 to-slate-500',
  }
  return gradients[props.id] || 'bg-gradient-to-br from-blue-500 to-indigo-600'
})
</script>

<style scoped>
/* 阴影效果优化 */
.group {
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.08);
}
</style>
