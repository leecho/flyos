<template>
  <!-- 组件根元素，通过父级 class 自动适配内部样式 -->
  <div class="clock-tile-container w-full h-full p-3 flex flex-col items-center justify-center overflow-hidden text-white select-none">

    <!-- 1. 小尺寸布局: 仅显示简洁模拟表盘 -->
    <div class="layout-small hidden flex-col items-center gap-1">
      <div class="clock-face w-16 h-16 relative rounded-full border border-white/30">
        <div class="hand hour" :style="hourStyle"></div>
        <div class="hand min" :style="minStyle"></div>
        <div class="hand sec" :style="secStyle"></div>
        <div class="center-dot"></div>
      </div>
      <span class="text-[10px] opacity-60 font-medium">{{digitalTime}}</span>
    </div>

    <!-- 2. 中尺寸布局: 横向排列，表盘 + 数字时间 -->
    <div class="layout-medium hidden items-center justify-around w-full">
      <div class="clock-face w-20 h-20 relative rounded-full border-2 border-white/20">
        <div class="hand hour" :style="hourStyle"></div>
        <div class="hand min" :style="minStyle"></div>
        <div class="hand sec" :style="secStyle"></div>
        <div class="center-dot"></div>
      </div>
      <div class="flex flex-col ml-2">
        <span class="text-3xl font-light tracking-tighter">{{ digitalTime }}</span>
        <span class="text-[11px] opacity-70 uppercase">{{ weekString }}</span>
      </div>
    </div>

    <!-- 3. 大尺寸布局: 纵向分层，包含日期详情和进度条 -->
    <div class="layout-large hidden flex-col justify-between w-full h-full">
      <div class="flex justify-between items-start">
        <div class="flex flex-col">
          <span class="text-4xl font-extralight tracking-tighter">{{ digitalTime }}</span>
          <span class="text-sm opacity-80">{{ dateString }}</span>
        </div>
        <div class="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div class="clock-face w-24 h-24 relative rounded-full border-2 border-white/20 shadow-lg">
          <div class="hand hour" :style="hourStyle"></div>
          <div class="hand min" :style="minStyle"></div>
          <div class="hand sec" :style="secStyle"></div>
          <div class="center-dot"></div>
        </div>
        <div class="flex flex-col flex-1">
          <div class="text-lg font-bold">{{ weekString }}</div>
          <div class="text-[10px] opacity-50 mb-2">北京时间 (UTC+8)</div>
          <div class="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div class="h-full bg-white transition-all duration-1000" :style="{ width: dayProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const now = ref(new Date());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// 计算属性：指针旋转角度
const secStyle = computed(() => ({ transform: `rotate(${now.value.getSeconds() * 6}deg)` }));
const minStyle = computed(() => ({ transform: `rotate(${now.value.getMinutes() * 6 + now.value.getSeconds() * 0.1}deg)` }));
const hourStyle = computed(() => ({ transform: `rotate(${(now.value.getHours() % 12) * 30 + now.value.getMinutes() * 0.5}deg)` }));

// 计算属性：格式化时间字符串
const digitalTime = computed(() => {
  const h = String(now.value.getHours()).padStart(2, '0');
  const m = String(now.value.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
});

const dateString = computed(() => now.value.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }));
const weekString = computed(() => now.value.toLocaleDateString('zh-CN', { weekday: 'long' }));
const dayProgress = computed(() => (now.value.getHours() * 3600 + now.value.getMinutes() * 60 + now.value.getSeconds()) / 86400 * 100);
</script>

<style scoped>
/* 核心逻辑：根据父容器 class 显示对应布局 */
.tile-small .layout-small { display: flex; }
.tile-medium .layout-medium { display: flex; }
.tile-large .layout-large { display: flex; }

/* 表盘通用样式 */
.clock-face {
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
}

.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom center;
  border-radius: 99px;
  background: white;
}

.hour { width: 3px; height: 25%; z-index: 3; }
.min { width: 2px; height: 35%; background: rgba(255,255,255,0.8); z-index: 2; }
.sec { width: 1px; height: 42%; background: #f87171; z-index: 4; }

.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}
</style>
