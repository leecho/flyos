<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  Bell, Inbox, ChevronRight,
  Info, CheckCircle, AlertTriangle, AlertCircle
} from 'lucide-vue-next';
import { useNotification } from '@/composables/useNotification';
import LiveTile from '@/components/LiveTile.vue';

// 接入全局通知状态
const { notifications, clearAll } = useNotification();

// 容器尺寸响应式处理
const containerRef = ref<HTMLElement | null>(null);
const width = ref(0);
const height = ref(0);

const tileSize = computed(() => {
  if (width.value < 160) return '1x1';
  if (height.value < 180) return '2x1';
  return '2x2';
});

// 尺寸监听
let observer: ResizeObserver | null = null;
onMounted(() => {
  if (containerRef.value) {
    observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      width.value = entry.contentRect.width;
      height.value = entry.contentRect.height;
    });
    observer.observe(containerRef.value);
  }
});

onUnmounted(() => observer?.disconnect());

// 辅助：获取不同类型的图标和颜色
const getTheme = (type: string = 'info') => {
  const themes = {
    success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle },
    error: { color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertCircle },
    warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
    info: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Info },
  };
  return themes[type as keyof typeof themes] || themes.info;
};
</script>

<template>
  <div
    ref="containerRef"
    class="notification-tile-root"
    :class="`size-${tileSize}`"
  >
    <!-- 背景装饰 -->
    <div class="glow-overlay"></div>

    <!-- 1x1: 极简静态模式 -->
    <div v-if="tileSize === '1x1'" class="content-1x1">
      <div class="icon-wrapper">
        <Bell :size="24" class="text-white/70" />
        <span v-if="notifications.length > 0" class="dot-badge">
          {{ notifications.length > 9 ? '9+' : notifications.length }}
        </span>
      </div>
      <span class="label">通知</span>
    </div>

    <!-- 2x1 & 2x2: 使用 LiveTile 集成轮播 -->
    <div v-else class="content-live-wrapper">
      <!-- 磁贴顶部标识 -->
      <div class="tile-header">
        <div class="brand">
          <Bell :size="12" class="text-indigo-400" />
          <span>通知中心</span>
        </div>
      </div>

      <!-- 核心轮播区域 -->
      <div class="carousel-container">
        <LiveTile
          v-if="notifications.length > 0"
          :items="notifications"
          :interval="4500"
          animation-type="slide-up"
        >
          <!-- 使用作用域插槽渲染通知项 -->
          <template #default="{ item }">
            <div class="noti-item-slide">
              <div class="noti-body">
                <div class="type-icon" :class="getTheme(item.type).bg">
                  <component
                    :is="getTheme(item.type).icon"
                    :size="14"
                    :class="getTheme(item.type).color"
                  />
                </div>
                <div class="noti-info">
                  <div class="noti-meta">
                    <span class="app-name">{{ item.appName }}</span>
                    <span class="time">{{ item.time }}</span>
                  </div>
                  <h4 class="noti-title">{{ item.title }}</h4>
                  <p class="noti-desc">{{ item.content }}</p>
                </div>
              </div>
            </div>
          </template>

          <!-- 叠加层：指示器 -->
          <template #overlay="{ currentIndex, total }">
            <div class="carousel-indicator">
              <span v-for="i in Math.min(total, 5)" :key="i"
                    :class="{ 'active': i - 1 === currentIndex }"></span>
            </div>
          </template>
        </LiveTile>

        <!-- 空状态 -->
        <div v-else class="empty-view">
          <Inbox :size="32" class="opacity-10" />
          <p>没有新通知</p>
        </div>
      </div>

      <!-- 2x2 特有底部操作栏 -->
      <div v-if="tileSize === '2x2'" class="tile-actions">
        <button @click="clearAll" class="action-btn">全部已读</button>
        <button class="action-btn">详情 <ChevronRight :size="10" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.notification-tile-root {
  @apply relative w-full h-full bg-[#0d0d0f] rounded-[inherit] overflow-hidden border border-white/5;
}

.glow-overlay {
  @apply absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08)_0%,transparent_50%)] pointer-events-none;
}

/* 1x1 样式 */
.content-1x1 {
  @apply flex flex-col items-center justify-center h-full gap-2;
}
.icon-wrapper {
  @apply relative p-3 bg-white/5 rounded-2xl border border-white/10;
}
.dot-badge {
  @apply absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-indigo-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-[#0d0d0f];
}
.label {
  @apply text-[10px] font-bold opacity-30 uppercase tracking-widest;
}

/* 轮播样式集成 */
.content-live-wrapper {
  @apply flex flex-col h-full p-3.5;
}
.tile-header {
  @apply flex justify-between items-center mb-3;
}
.brand {
  @apply flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter;
}

.carousel-container {
  @apply flex-1 relative min-h-0;
}

.noti-item-slide {
  @apply w-full h-full py-1;
}
.noti-body {
  @apply flex gap-3;
}
.type-icon {
  @apply w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner;
}
.noti-info {
  @apply min-w-0 flex-1;
}
.noti-meta {
  @apply flex justify-between items-center mb-0.5;
}
.app-name {
  @apply text-[10px] font-bold text-indigo-400/70 truncate max-w-[80px];
}
.time {
  @apply text-[10px] text-slate-600 font-mono;
}
.noti-title {
  @apply text-sm font-bold text-slate-200 truncate;
}
.noti-desc {
  @apply text-[11px] text-slate-400 leading-relaxed mt-1 line-clamp-2;
}

/* 轮播指示器 */
.carousel-indicator {
  @apply absolute bottom-0 left-0 flex gap-1;
}
.carousel-indicator span {
  @apply w-1 h-1 rounded-full bg-white/10 transition-all duration-300;
}
.carousel-indicator span.active {
  @apply w-3 bg-indigo-500/50;
}

.tile-actions {
  @apply mt-3 flex gap-2 pt-3 border-t border-white/5;
}
.action-btn {
  @apply flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold text-slate-400 flex items-center justify-center gap-1 transition-colors;
}

.empty-view {
  @apply h-full flex flex-col items-center justify-center gap-2 text-slate-700 text-[11px];
}
</style>
