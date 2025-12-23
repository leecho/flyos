<template>
  <div class="w-full h-full relative overflow-hidden">
    <!-- 垂直滑动动画容器 -->
    <div
      v-if="animationType === 'slide-up'"
      class="w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
      :style="{ transform: `translateY(-${currentIndex * 100}%)` }"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="w-full h-full select-none"
      >
        <!-- 将 item 和 index 暴露给插槽 -->
        <slot :item="item" :index="index"></slot>
      </div>
    </div>

    <!-- 淡入淡出动画容器 -->
    <div v-else-if="animationType === 'fade'" class="w-full h-full relative">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
        :class="index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'"
      >
        <slot :item="item" :index="index"></slot>
      </div>
    </div>

    <!-- 默认插槽：用于放置底部的指示器或其他浮层 -->
    <slot name="overlay" :currentIndex="currentIndex" :total="items.length"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  items: any[];
  interval?: number;
  animationType?: 'slide-up' | 'fade';
  paused?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  interval: 4000,
  animationType: 'slide-up',
  paused: false
});

const currentIndex = ref(0);
let timer: number | null = null;

const startRotation = () => {
  if (props.items.length <= 1 || props.paused) return;
  stopRotation();
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % props.items.length;
  }, props.interval);
}

const stopRotation = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

// 监听暂停状态和数据长度变化
watch(() => [props.paused, props.items.length], () => {
  if (props.paused || props.items.length <= 1) {
    stopRotation();
  } else {
    startRotation();
  }
}, { immediate: true });

onMounted(startRotation);
onUnmounted(stopRotation);

// 暴露 API 供父组件手动控制
defineExpose({
  next: () => (currentIndex.value = (currentIndex.value + 1) % props.items.length),
  prev: () => (currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length),
  goTo: (index: number) => (currentIndex.value = index)
});
</script>
