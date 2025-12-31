<template>
  <div class="window-root">
    <div
      v-if="snapState"
      class="absolute z-10 pointer-events-none bg-blue-400/30 dark:bg-blue-300/20"
      :style="snapPreviewStyle"
    ></div>

    <div
      v-show="visible"
      ref="windowRef"
      class="@container absolute shadow-2xl rounded-md flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur border border-gray-300/50 dark:border-gray-700/50 overflow-hidden"
      :class="{ 'snap-animate': !isDragging && !isResizing }"
      :style="windowStyle"
      @mousedown="bringToFront"
    >
      <div
        class="flex items-center justify-between select-none px-3 h-10 bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-xl border-b border-gray-300/50 dark:border-gray-700/50"
        @mousedown.prevent="startDrag"
        @dblclick="handleDblClick"
        @contextmenu.prevent="onContextmenu"
      >
        <div class="flex items-center gap-2 min-w-0">
          <slot name="icon">
            <AppIcon :id="appId" size="mini" rounded="sm" />
          </slot>
          <span class="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">
            {{ title }}
          </span>
        </div>

        <div class="flex items-center gap-1" @mousedown.stop>
          <!-- 最小化按钮 -->
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-white"
            @click="$emit('minimize')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>

          <!-- 最大化 / 恢复 按钮 -->
          <button
            v-if="canMaximize"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-white"
            @click="toggleMaximize"
          >
            <!-- 最大化图标 (单框) -->
            <svg v-if="!isMaximized" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" />
            </svg>

            <!-- 恢复图标 (重叠双框风格) -->
            <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M8 3H19C20.1046 3 21 3.89543 21 5V16C21 17.1046 20.1046 18 19 18"
                stroke-width="2"
                stroke-linecap="round"
              />
              <rect
                x="3" y="8" width="13" height="13" rx="1.5"
                stroke-width="2"
                fill="transparent"
              />
            </svg>
          </button>

          <!-- 关闭按钮 -->
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500 hover:text-white transition-all text-gray-500"
            @click="$emit('close')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto relative bg-white/80 dark:bg-gray-950/80">
        <Suspense>
          <template #default>
            <component :is="subComponent" v-if="subComponent" />
            <slot v-else></slot>
          </template>
          <template #fallback>
            <div class="w-full h-full flex items-center justify-center">
              <div class="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          </template>
        </Suspense>
      </div>

      <div
        v-if="!isMaximized && !snapState && canMaximize"
        class="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize z-20"
        @mousedown.prevent="startResize"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  defineAsyncComponent,
  watch,
  nextTick
} from 'vue'
import { useWindowAnimator } from "@/composables/useWindowAnimator.ts"
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{
  id: string
  title: string
  zIndex: number
  minimized?: boolean
  component?: string
  maximized?: boolean
  maximizable?: boolean
  width?: number
  height?: number
  appId: string
}>(), {
  maximizable: true,
  maximized: false,
  width: 800,
  height: 600
})

const emit = defineEmits(['close', 'minimize', 'active', 'contextmenu', 'update:maximized'])

const windowRef = ref<HTMLElement>()
const visible = ref(!props.minimized)
const animator = useWindowAnimator({ id: props.id, windowRef })

const subComponent = props.component
  ? defineAsyncComponent(() => import(`@/apps/${props.component}.vue`))
  : null

const isDragging = ref(false)
const isResizing = ref(false)
const isMaximized = ref(props.maximized)
const snapState = ref<'left' | 'right' | null>(null)

const canMaximize = computed(() => {
  return props.maximizable
})

const position = reactive({
  x: (window.innerWidth - props.width) / 2,
  y: (window.innerHeight - props.height) / 2,
  width: props.width,
  height: props.height
})

const prevRect = reactive({ ...position })

const windowStyle = computed(() => {
  const base = { zIndex: props.zIndex }

  if (isMaximized.value) {
    return {
      ...base,
      top: '0px',
      left: '0px',
      width: '100vw',
      height: 'calc(100vh - 42px)',
      borderRadius: '0px'
    }
  }

  if (snapState.value === 'left') {
    return { ...base, top: '0', left: '0', width: '50vw', height: 'calc(100vh - 42px)', borderRadius: '0px' }
  }

  if (snapState.value === 'right') {
    return { ...base, top: '0', left: '50vw', width: '50vw', height: 'calc(100vh - 42px)', borderRadius: '0px' }
  }

  return {
    ...base,
    top: `${position.y}px`,
    left: `${position.x}px`,
    width: `${position.width}px`,
    height: `${position.height}px`
  }
})

const snapPreviewStyle = computed(() => {
  if (!snapState.value) return {}
  return {
    top: '0',
    left: snapState.value === 'left' ? '0' : '50vw',
    width: '50vw',
    height: 'calc(100vh - 42px)'
  }
})

watch(() => props.maximized, (val) => {
  const target = val
  if (target !== isMaximized.value) {
    target ? applyMaximize() : applyRestore()
  }
})

watch(() => props.minimized, async (val, oldVal) => {
  if (val === oldVal) return
  if (val) {
    await animator.playMinimize()
    visible.value = false
  } else {
    visible.value = true
    await nextTick()
    animator.prepareRestore()
    requestAnimationFrame(() => animator.playRestore())
  }
}, { flush: 'post' })

function bringToFront() {
  emit('active')
}

function onContextmenu(e: MouseEvent) {
  emit('contextmenu', e)
}

function handleDblClick() {
  if (canMaximize.value) {
    toggleMaximize()
  }
}

let dragOffsetX = 0, dragOffsetY = 0

function startDrag(e: MouseEvent) {
  if (isMaximized.value) return
  bringToFront()
  isDragging.value = true
  dragOffsetX = e.clientX - position.x
  dragOffsetY = e.clientY - position.y
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  position.x = e.clientX - dragOffsetX
  position.y = e.clientY - dragOffsetY
}

function stopDrag(e: MouseEvent) {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)

  if (e.clientY < 5 && canMaximize.value) {
    applyMaximize()
  } else if (e.clientX < 10) {
    snapState.value = 'left'
  } else if (e.clientX > window.innerWidth - 10) {
    snapState.value = 'right'
  } else {
    snapState.value = null
  }
}

let resizeStartX = 0, resizeStartY = 0, resizeW = 0, resizeH = 0

function startResize(e: MouseEvent) {
  if (isMaximized.value) return
  isResizing.value = true
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  resizeW = position.width
  resizeH = position.height
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  position.width = Math.max(300, resizeW + (e.clientX - resizeStartX))
  position.height = Math.max(200, resizeH + (e.clientY - resizeStartY))
}

function stopResize() {
  isResizing.value = false
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
}

function toggleMaximize() {
  if (!canMaximize.value) return
  isMaximized.value ? applyRestore() : applyMaximize()
}

function applyMaximize() {
  Object.assign(prevRect, position)
  snapState.value = null
  isMaximized.value = true
  emit('update:maximized', true)
}

function applyRestore() {
  Object.assign(position, prevRect)
  isMaximized.value = false
  emit('update:maximized', false)
}
</script>

<style scoped>
.snap-animate {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
</style>
