<template>
  <div>
    <!-- Snap 预览 -->
    <div
        v-if="snapState"
        class="absolute z-10 pointer-events-none
             bg-blue-400/30 dark:bg-blue-300/20"
        :style="snapPreviewStyle"
    ></div>

    <!-- Window -->
    <div
        v-show="visible"
        ref="windowRef"
        class="absolute shadow-2xl rounded-md flex flex-col
             bg-white/50 dark:bg-gray-900/50 backdrop-blur
             border border-gray-300/50 dark:border-gray-700/50"
        :class="{ 'snap-animate': !isDragging && !isResizing }"
        :style="windowStyle"
        @mousedown="bringToFront"
    >
      <!-- Title Bar -->
      <div
          class="flex items-center justify-between select-none rounded-t-md px-3 h-10
               bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-xl
               border-b border-gray-300/50 dark:border-gray-700/50"
          @mousedown.prevent="startDrag"
          @dblclick="toggleMaximize"
          @contextmenu.prevent="onContextmenu"
      >
        <div class="flex items-center gap-2">
          <slot name="icon">
            <div >
                <AppIcon :id="appId" size='mini' rounded='sm'/>
            </div>
          </slot>
          <span class="font-medium text-gray-800 dark:text-gray-100">
            {{ title }}
          </span>
        </div>

        <div class="flex items-center gap-1" @mousedown.stop>
          <!-- 最小化 -->
          <button
            @click="$emit('minimize')"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <!-- 最大化/还原 -->
          <button
            @click="toggleMaximize"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            <svg v-if="!isMaximized" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" />
            </svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 8H4v4m12 4h4v-4m0-8h-4v4M4 16h4v4" />
            </svg>
          </button>
          <!-- 关闭 -->
          <button
            @click="$emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500 hover:text-white transition-all text-gray-500"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto ">
        <component v-if="component" :is="subComponent" />
      </div>

      <!-- Resize -->
      <div
          class="absolute right-0 bottom-0 w-6 h-6 cursor-se-resize"
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
import { useWindowAnimator} from "@/composables/useWindowAnimator.ts";
import AppIcon from './AppIcon.vue'
/* ------------------ Props ------------------ */
const props = defineProps<{
  id: string
  title: string
  zIndex: number
  minimized?: boolean
  component?: string
  maximized?: boolean
  width?: number
  height?: number
  appId: string
}>()

const emit = defineEmits(['close', 'minimize', 'active', 'contextmenu'])

/* ------------------ DOM ------------------ */
const windowRef = ref<HTMLElement>()

/* ------------------ 可见性 ------------------ */
const visible = ref(!props.minimized)

/* ------------------ Animator ------------------ */
const animator = useWindowAnimator({
  id: props.id,
  windowRef
})

const onContextmenu = function($event){
  emit('contextmenu', $event)
}

/* ------------------ 子组件 ------------------ */
const subComponent = props.component
    ? defineAsyncComponent(() => import(`@/apps/${props.component}.vue`))
    : null

/* ------------------ 状态 ------------------ */
const isDragging = ref(false)
const isResizing = ref(false)
const isMaximized = ref(false)
const snapState = ref<'left' | 'right' | null>(null)

/* ------------------ 位置尺寸 ------------------ */
const position = reactive({
  x: 120,
  y: 120,
  width: props.width ?? 800,
  height: props.height ?? 600
})

position.x = (window.innerWidth - position.width) / 2
position.y = (window.innerHeight - position.height) / 2


const prevRect = reactive({ ...position })

/* ------------------ 样式 ------------------ */
const windowStyle = computed(() => {
  if (isMaximized.value) {
    return {
      top: '0px',
      left: '0px',
      width: '100vw',
      height: 'calc(100vh - 42px)',
      zIndex: props.zIndex
    }
  }

  if (snapState.value === 'left') {
    return { top: '0', left: '0', width: '50vw', height: '100vh', zIndex: props.zIndex }
  }

  if (snapState.value === 'right') {
    return { top: '0', left: '50vw', width: '50vw', height: '100vh', zIndex: props.zIndex }
  }

  return {
    top: position.y + 'px',
    left: position.x + 'px',
    width: position.width + 'px',
    height: position.height + 'px',
    zIndex: props.zIndex
  }
})

const snapPreviewStyle = computed(() =>
    snapState.value
        ? {
          top: '0',
          left: snapState.value === 'left' ? '0' : '50vw',
          width: '50vw',
          height: '100vh'
        }
        : {}
)

/* ------------------ Watch：最小化 / 恢复 ------------------ */
watch(
    () => props.minimized,
    async (val, oldVal) => {
      if (val === oldVal) return

      // ▶ 最小化
      if (val) {
        await animator.playMinimize()
        visible.value = false
        return
      }

      // ▶ 从任务栏恢复
      visible.value = true
      await nextTick()

      animator.prepareRestore()
      requestAnimationFrame(() => animator.playRestore())
    },
    { flush: 'post' }
)

/* ------------------ 交互 ------------------ */
function bringToFront() {
  emit('active')
}

/* Drag */
let dragOffsetX = 0
let dragOffsetY = 0

function startDrag(e: MouseEvent) {
  if (isMaximized.value) return
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

function stopDrag() {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)

  if (position.x < 8) snapState.value = 'left'
  else if (position.x + position.width > window.innerWidth - 8) snapState.value = 'right'
  else snapState.value = null
}

/* Resize */
let resizeStartX = 0
let resizeStartY = 0
let resizeW = 0
let resizeH = 0

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
  position.width = Math.max(240, resizeW + (e.clientX - resizeStartX))
  position.height = Math.max(160, resizeH + (e.clientY - resizeStartY))
}

function stopResize() {
  isResizing.value = false
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
}

/* Maximize */
function toggleMaximize() {
  if (isMaximized.value) {
    Object.assign(position, prevRect)
    isMaximized.value = false
  } else {
    Object.assign(prevRect, position)
    snapState.value = null
    isMaximized.value = true
  }
}
</script>

<style scoped>
.snap-animate {
  transition: all 0.25s cubic-bezier(.25,.8,.25,1);
}
</style>
