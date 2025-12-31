<script setup>
import { ref } from 'vue';
import AppIcon from './AppIcon.vue';

// 修复：显式定义 props 以避免编译解析错误
const props = defineProps({
  window: {
    type: Object,
    default: () => ({})
  }
});

const emits = defineEmits(['click', 'contextmenu']);

const isHovered = ref(false);

const onContextmenu = (e) => {
  emits('contextmenu', e);
};
</script>

<template>
  <div
    :id="'taskbar-item-' + (window?.id || '')"
    class="relative group flex flex-col items-center justify-center w-10 h-10 transition-all duration-300 cursor-pointer overflow-visible"
    @click="emits('click')"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @contextmenu.prevent="onContextmenu"
  >
    <!-- 悬停/激活背景 -->
    <div
      class="absolute inset-0 rounded-lg transition-colors duration-200"
      :class="[
        window?.active
          ? 'bg-white/25 dark:bg-white/10 shadow-sm'
          : 'group-hover:bg-white/15 dark:group-hover:bg-white/5'
      ]"
    ></div>

    <!-- 图标容器 -->
    <div class="relative z-10 transform transition-transform duration-300 group-active:scale-90 group-hover:-translate-y-1">
      <AppIcon :id="window?.appId" size="sm" rounded="sm" />
    </div>

    <!-- 底部状态指示灯 (Dot) -->
    <div
      v-if="window"
      class="absolute bottom-1 h-1 rounded-full transition-all duration-300 bg-accent shadow-[0_0_8px_rgba(59,130,246,0.6)]"
      :class="[window.active ? 'w-4' : 'w-1 opacity-60 group-hover:w-2']"
    ></div>

    <!-- FlyOS Tooltip -->
    <Transition name="tooltip">
      <div
        v-if="isHovered && window?.title"
        class="absolute -top-12 px-3 py-1.5 whitespace-nowrap z-[100] pointer-events-none"
      >
        <div class="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl rounded-md px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
          {{ window.title }}
          <!-- 底部小箭头 -->
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-inherit border-r border-b border-white/20 dark:border-white/10 rotate-45"></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Tooltip 动画 */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
