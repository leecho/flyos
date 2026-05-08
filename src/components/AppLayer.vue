<template>
  <div
    v-show="!minimized"
    ref="layerRef"
    class="app-layer fixed top-0 left-0 w-full h-[calc(100vh-var(--mobile-nav-height))] z-50 bg-black overflow-hidden flex flex-col pointer-events-auto"
    :style="{ zIndex }"
  >
    <!-- 移动端应用内容区 (预留底部导航栏高度 64px) -->
    <div class="flex-1 relative bg-white dark:bg-gray-950 overflow-y-auto">
      <Suspense>
        <template #default>
          <component :is="subComponent" v-if="subComponent" :params="params" />
          <slot v-else></slot>
        </template>
        <template #fallback>
          <div class="w-full h-full flex items-center justify-center bg-gray-950">
            <div class="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue'
import html2canvas from 'html2canvas'
import { getWindow } from '../stores/windowStore'

const props = defineProps<{
  id: string
  appId: string
  zIndex: number
  minimized?: boolean
  component?: string
  params?: any
}>()

const layerRef = ref<HTMLElement | null>(null)
let isCapturing = false

// 监听最小化状态，在隐藏前抓取快照
watch(() => props.minimized, async (isMinimized) => {
  if (isMinimized && layerRef.value && !isCapturing) {
    isCapturing = true
    try {
      // 稍微延迟确保 DOM 状态稳定
      const canvas = await html2canvas(layerRef.value, {
        scale: 0.4, 
        logging: false,
        useCORS: true,
        backgroundColor: null,
        // 修复 Tailwind v4 oklch/oklab 导致的 html2canvas 崩溃
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            // 针对可能包含 oklch/oklab 的常见属性进行清理
            const props = ['backgroundColor', 'color', 'borderColor', 'fill', 'stroke'];
            props.forEach(prop => {
              const val = (style as any)[prop];
              if (val && (val.includes('oklch') || val.includes('oklab'))) {
                // 暂时降级为透明或继承，防止解析器报错
                (el.style as any)[prop] = 'inherit';
              }
            });
          }
        }
      })
      const win = getWindow(props.id)
      if (win) {
        win.preview = canvas.toDataURL('image/webp', 0.5)
      }
    } catch (e: any) {
      // 记录具体错误但不再中断流程
      console.warn('Snapshot failed:', e.message || e)
    } finally {
      isCapturing = false
    }
  }
})

const subComponent = props.component
  ? defineAsyncComponent(() => import(`../apps/${props.component}.vue`))
  : null
</script>

<style scoped>
.app-layer {
  /* 移动端切换动画由父组件或 Transition 处理 */
  user-select: none;
}

/* 进场动画：类似于原生应用的缩放或平移 */
.layer-fade-enter-active, .layer-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.layer-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

.layer-fade-leave-to {
  opacity: 0;
  transform: scale(1.05);
  filter: blur(10px);
}
</style>
