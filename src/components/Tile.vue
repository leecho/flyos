<template>
  <div
    class="relative overflow-hidden transition-all duration-200 active:scale-95 shadow-lg shadow-black/30 group rounded-sm"
    :class="[app.bgColor, sizeClasses]"
  >
    <!-- 1. 默认图标展示 (当没有动态磁贴时) -->
    <div
      v-if="!subComponent"
      class="w-full h-full flex flex-col items-center justify-center p-2"
    >
      <AppIcon :id='app.id' />
      <!-- 小磁贴通常不显示名称 -->
<!--      <div v-if="app.tile.size !== 'small'" class="text-[11px] font-medium truncate w-full px-2 text-center opacity-90">-->
<!--        {{ app.name }}-->
<!--      </div>-->
      <!-- 3. 左下角文本标签 (符合 Windows 规范：仅在中/宽/大尺寸显示) -->
      <div
           class="absolute bottom-1.5 left-2 z-20 pointer-events-none text-[10px] font-medium opacity-90 truncate max-w-[85%] drop-shadow-sm"
      >
        {{ app.name }}
      </div>
    </div>

    <!-- 2. 动态 Live Tile 渲染 -->
    <div v-else class="w-full h-full overflow-hidden">
      <Suspense>
        <component :is="subComponent" />
        <template #fallback>
          <div class="w-full h-full flex items-center justify-center bg-white/5 animate-pulse">
            <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        </template>
      </Suspense>
    </div>



    <!-- 悬停提亮遮罩 -->
    <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
import defaultLogo from '@/assets/vue.svg'
import type { AppItem } from "@/stores/appStore.ts";
import { computed, defineAsyncComponent } from "vue";
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  app: AppItem
}>()

/**
 * 映射 Grid 跨度 (基于 4列 系统的优化比例)
 * 假设 TileGroup 的 grid-cols-4，基础单元格高度为 50-60px：
 * - small:  1x1 (单元格) -> col 1, row 1
 * - medium: 2x2 (基准) -> col 2, row 2
 * - wide:   4x2 (宽型) -> col 4, row 2
 * - large:  4x4 (巨型) -> col 4, row 4
 */
const sizeClasses = computed(() => {
  const map: Record<string, string> = {
    'small': 'col-span-1 row-span-1',
    'medium': 'col-span-2 row-span-1',
    'large': 'col-span-2 row-span-2',
  }
  return map[props.app.tile.size] || 'col-span-2 row-span-2'
})

const subComponent = computed(() => {
  if (!props.app.tile.component) return null
  return defineAsyncComponent({
    loader: () => import(`@/tiles/${props.app.tile.component}.vue`),
    delay: 100,
    timeout: 3000
  })
})
</script>

<style scoped>
/* 模拟原生磁贴点击时的 3D 缩放倾斜效果 */
.active\:scale-95:active {
  transform: scale(0.97) perspective(500px) rotateX(1deg);
}
</style>
