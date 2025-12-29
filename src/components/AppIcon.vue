<template>
  <div
    class="relative flex items-center justify-center overflow-hidden transition-all duration-300 group shadow-lg"
    :class="[sizeClasses[size], roundedClasses[rounded], iconConfig?.bgColor || 'bg-gray-500']"
  >
    <!-- 玻璃光泽效果层 -->
    <div class="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
    <div class="absolute inset-x-0 top-0 h-px bg-white/30"></div>

    <!-- 图标内容 -->
    <div
      class="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center w-full h-full p-[15%]"
    >
      <!-- 渲染方式 1: 图片 (Image) -->
      <img
        v-if="iconConfig?.type === 'image'"
        :src="iconConfig.content"
        class="w-full h-full object-contain pointer-events-none select-none"
        @error="handleImageError"
      />

      <!-- 渲染方式 2: 内联 SVG (支持完整的 SVG 代码或 Path 数据) -->
      <svg
        v-else-if="iconConfig?.type === 'svg'"
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        v-html="iconConfig.content"
      >
      </svg>

      <!-- 兜底显示应用首字母 -->
      <span v-else class="font-bold select-none" :style="{ fontSize: (iconSize/2) + 'px' }">
        {{ fallbackChar }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getAppById } from '../stores/appStore.ts'

const props = withDefaults(defineProps<{
  id: string
  size?: 'mini' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}>(), {
  size: 'md',
  rounded: 'md'
})

// 从 Store 中动态获取应用配置
const app = computed(() => getAppById(props.id))
const iconConfig = computed(() => app.value?.icon)

const sizeClasses = {
  mini: 'w-5 h-5',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

const iconSize = computed(() => {
  const map = { mini: 12, sm: 16, md: 24, lg: 34, xl: 48 }
  return map[props.size]
})

const roundedClasses = {
  sm: 'rounded-md',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full'
}

const fallbackChar = computed(() => {
  return app.value?.name ? app.value.name.charAt(0).toUpperCase() : '?'
})

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>

<style scoped>
/* 可以根据需要添加图标悬停时的光效 */
.group:hover {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}
</style>
