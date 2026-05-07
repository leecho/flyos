<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import { computed } from 'vue'
import { XIcon, InfoIcon, CheckCircle2Icon, AlertCircleIcon, TriangleAlertIcon } from 'lucide-vue-next';

const { notifications, hideToast } = useNotification();

const toastNotifications = computed(() => {
  return notifications.value.filter(item => item.isToast);
});

const getStatusColor = (type: string) => {
  switch (type) {
    case 'success': return 'bg-emerald-500';
    case 'error': return 'bg-rose-500';
    case 'warning': return 'bg-amber-500';
    default: return 'bg-blue-500';
  }
};

const getStatusIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle2Icon;
    case 'error': return AlertCircleIcon;
    case 'warning': return TriangleAlertIcon;
    default: return InfoIcon;
  }
};
</script>

<template>
  <div class="fixed top-4 left-0 right-0 z-[2000000] flex flex-col items-center pointer-events-none px-4 gap-3">
    <TransitionGroup name="notif-mobile">
      <div 
        v-for="notif in toastNotifications" 
        :key="notif.id"
        class="w-full max-w-sm pointer-events-auto"
      >
        <div 
          class="relative flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-900/80 backdrop-blur-2xl rounded-xl border border-white/20 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden group transition-all duration-500"
          @click="hideToast(notif.id)"
        >
          <!-- 状态色块 (指示条) -->
          <div 
            class="absolute left-0 top-0 bottom-0 w-1.5"
            :class="getStatusColor(notif.type || 'info')"
          ></div>

          <!-- 图标容器 -->
          <div class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/5">
            <component 
              :is="getStatusIcon(notif.type || 'info')" 
              class="w-5 h-5" 
              :class="notif.type === 'info' ? 'text-blue-500' : 'text-current'"
              :style="{ color: notif.type !== 'info' ? 'inherit' : '' }"
            />
          </div>

          <!-- 内容区域 -->
          <div class="flex-1 min-w-0 pr-2">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-[10px] font-black uppercase tracking-widest text-blue-500/80">
                {{ notif.appName || '系统通知' }}
              </span>
            </div>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">
              {{ notif.title }}
            </h4>
            <p v-if="notif.content" class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {{ notif.content }}
            </p>
          </div>

          <!-- 关闭按钮 (移动端通常点击整体，但保留视觉指引) -->
          <div class="shrink-0 opacity-20">
            <XIcon :size="16" />
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notif-mobile-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.notif-mobile-leave-active {
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.notif-mobile-enter-from {
  opacity: 0;
  transform: translateY(-40px) scale(0.9);
  filter: blur(10px);
}
.notif-mobile-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
  filter: blur(5px);
}

/* 堆叠感模拟 (当有多个通知时) */
.notif-mobile-move {
  transition: transform 0.4s ease;
}
</style>
