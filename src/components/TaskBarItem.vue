<template>
  <div
    :id="'taskbar-item-' + window.id"
    class="relative group flex flex-col items-center justify-center w-10 h-10 transition-all duration-300 cursor-pointer"
    @click="emits('click')"
    @contextmenu.prevent="onContextmenu"
  >
    <!-- 悬停背景背景 -->
    <div
      class="absolute inset-0 rounded-lg transition-colors duration-200"
      :class="[window.active ? 'bg-white/20 dark:bg-white/10' : 'group-hover:bg-white/15 dark:group-hover:bg-white/5']"
    ></div>

    <!-- 图标容器 -->
    <div class="relative z-10 transform transition-transform duration-300 group-active:scale-90 group-hover:-translate-y-1">
      <!-- 这里复用之前的 AppIcon 组件 -->
      <AppIcon :id="window.appId" size="sm" rounded="sm" />
    </div>

    <!-- 底部状态指示灯 -->
    <div
      class="absolute bottom-0.5 h-1 rounded-full transition-all duration-300 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
      :class="[window.active ? 'w-4' : 'w-1 opacity-60 group-hover:w-2']"
    ></div>

    <!-- Tooltip (可选实现) -->
    <div class="absolute -top-10 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 shadow-xl">
      {{ window.title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "./AppIcon.vue" // 假设之前的图标组件已引入

const props = defineProps({
  window: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['click', 'contextmenu'])

const onContextmenu = ($event: MouseEvent) => {
  emits('contextmenu', $event)
}
</script>
