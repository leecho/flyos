<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import { computed } from 'vue';

const { notifications, hideToast } = useNotification();

/**
 * 过滤出当前需要在桌面上弹出的通知
 * 只有 isToast 为 true 的项才会在这个组件中渲染
 */
const toastNotifications = computed(() => {
  return notifications.value.filter(item => item.isToast);
});

const getIconClass = (type: string) => {
  switch (type) {
    case 'success': return 'text-emerald-500';
    case 'error': return 'text-rose-500';
    case 'warning': return 'text-amber-500';
    default: return 'text-blue-500';
  }
};

const icons = {
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 9 4 4-4 4"/><path d="M8 12h8"/><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/></svg>`
};
</script>

<template>
  <div class="fixed bottom-14 right-4 z-[9999] flex flex-col items-end gap-3 w-[350px] pointer-events-none">
    <TransitionGroup
      name="notification-list"
      tag="div"
      class="w-full flex flex-col gap-3"
    >
      <!-- 只显示 isToast 为真的通知 -->
      <div
        v-for="item in toastNotifications"
        :key="item.id"
        class="pointer-events-auto w-full group"
      >
        <!-- Windows 11 风格容器 -->
        <div class="relative overflow-hidden rounded-xl border border-white/10 dark:border-white/5
                    bg-white/70 dark:bg-[#1c1c1c]/80 backdrop-blur-2xl shadow-xl shadow-black/20">

          <!-- 顶部 -->
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
              <!-- 点击关闭仅隐藏桌面悬浮，不删除数据 -->
              <button
                @click="hideToast(item.id)"
                class="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50 hover:opacity-100 dark:text-white">
                  <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- 内容 -->
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
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.8);
}

.notification-list-move {
  transition: transform 0.4s ease;
}
</style>
