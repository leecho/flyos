<template>
  <!-- 使用通用的 LiveTile 控制器 -->
  <LiveTile :items="newsData" :interval="5000" animationType="slide-up">
    <!-- 1. 定义每一张幻灯片的内容布局 -->
    <template #default="{ item }">
      <div class="w-full h-full relative group">
        <!-- 背景图（如果有） -->
        <div
          v-if="item.image"
          class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
          :style="{ backgroundImage: `url(${item.image})` }"
        >
          <!-- 渐变遮罩确保文字可读性 -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>

        <!-- 文字内容层 -->
        <div class="absolute inset-0 p-3 flex flex-col justify-end text-left pointer-events-none">
          <span class="text-[10px] uppercase tracking-widest text-white/70 mb-1">
            {{ item.source }}
          </span>
          <h3 class="text-xs font-semibold text-white leading-snug line-clamp-2">
            {{ item.title }}
          </h3>
        </div>
      </div>
    </template>

    <!-- 2. 可选：定义叠加层（如右下角的页码指示器） -->
    <template #overlay="{ currentIndex, total }">
      <div class="absolute bottom-2 right-2 flex gap-1 z-30">
        <div
          v-for="(_, i) in total"
          :key="i"
          class="w-1 h-1 rounded-full transition-all duration-300"
          :class="i === currentIndex ? 'bg-white scale-125' : 'bg-white/30'"
        ></div>
      </div>
    </template>
  </LiveTile>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LiveTile from '../components/LiveTile.vue'; // 请根据实际路径调整

interface NewsItem {
  title: string;
  source: string;
  image: string;
}

// 模拟新闻数据
const newsData = ref<NewsItem[]>([
  {
    title: 'FlyOS 开发者预览版现已开放下载',
    source: '系统发布',
    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: 'Vue 3 + Tailwind CSS 构建极致 WebOS 体验',
    source: '技术博文',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: '微软宣布下一代 Fluent Design 设计准则',
    source: '设计资讯',
    image: 'https://images.unsplash.com/photo-1541462608141-ad4d769421a1?auto=format&fit=crop&q=80&w=400'
  }
]);
</script>

<style scoped>
/* 确保文字在复杂背景下依然清晰 */
h3 {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
</style>
