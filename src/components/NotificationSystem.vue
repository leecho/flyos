<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';

const { notifications, remove } = useNotification();

/**
 * 图标颜色映射
 * 修复了之前可能导致编译错误的语法结构
 */
const getIconClass = (type: string) => {
  switch (type) {
    case 'success': return 'text-emerald-500';
    case 'error': return 'text-rose-500';
    case 'warning': return 'text-amber-500';
    case 'info':
    default: return 'text-blue-500';
  }
};

/**
 * 预设 SVG 图标
 */
const icons = {
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 8 4 4-4 4"/><path d="M8 12h8"/><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/></svg>`
};
</script>

<template>
  <div class="fixed bottom-14 right-4 z-[9999] flex flex-col items-end gap-3 w-[350px] pointer-events-none">
    <TransitionGroup
      name="notification-list"
      tag="div"
      class="w-full flex flex-col gap-3"
    >
      <div
        v-for="item in notifications"
        :key="item.id"
        class="pointer-events-auto w-full group"
      >
        <!-- Windows 11 亚克力风格容器 -->
        <div class="relative overflow-hidden rounded-xl border border-white/10 dark:border-white/5
                    bg-white/70 dark:bg-[#1c1c1c]/80 backdrop-blur-2xl shadow-xl shadow-black/20">

          <!-- 顶部状态栏 -->
          <div class="flex items-center justify-between px-4 pt-3 pb-1">
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-3.5 text-blue-500 opacity-80">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </span>
              <span class="text-[11px] font-medium opacity-60 dark:text-white">{{ item.appName }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] opacity-40 dark:text-white">{{ item.time }}</span>
              <button
                @click="remove(item.id)"
                class="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50 hover:opacity-100 dark:text-white">
                  <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- 通知主体 -->
          <div class="px-4 pb-4 pt-2 flex gap-3">
            <div
              v-if="item.type"
              :class="getIconClass(item.type)"
              class="shrink-0 mt-0.5"
              v-html="icons[item.type as keyof typeof icons] || icons.info"
            ></div>
            <div class="flex-1 min-w-0">
              <h4 class="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight truncate">
                {{ item.title }}
              </h4>
              <p class="text-[12px] text-gray-600 dark:text-gray-400 leading-normal mt-1 line-clamp-2">
                {{ item.content }}
              </p>
            </div>
          </div>

          <!-- 交互操作按钮 -->
          <div class="px-3 pb-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button class="flex-1 py-1 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-[11px] font-medium transition-colors dark:text-gray-300">
              忽略
            </button>
            <button class="flex-1 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition-all shadow-md">
              处理
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* 进场与出场动画 */
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.notification-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 列表移动动画（当中间一个被删除时，下方的通知平滑滑上来） */
.notification-list-move {
  transition: transform 0.4s ease;
}
</style>
