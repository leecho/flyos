<template>
  <div class="w-full h-full relative group bg-gray-200 dark:bg-gray-800">
    <!-- 使用通用的 LiveTile 控制组件 -->
    <LiveTile :items="photoList" :interval="6000" animationType="fade">
      <template #default="{ item }">
        <div class="w-full h-full relative overflow-hidden">
          <!-- 背景图片：带缓慢缩放效果 (Ken Burns Effect) -->
          <div
            class="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-linear scale-100 group-hover:scale-110"
            :style="{ backgroundImage: `url(${item.url})` }"
          ></div>

          <!-- 底部渐变遮罩：确保左下角的标签清晰 -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          <!-- 照片信息预览 (可选) -->
          <div class="absolute inset-0 p-3 flex flex-col justify-end text-left pointer-events-none">
            <p class="text-[9px] text-white/60 font-medium uppercase tracking-tighter mb-0.5">
              {{ item.date || '精彩回忆' }}
            </p>
            <p class="text-[11px] text-white font-semibold truncate drop-shadow-sm">
              {{ item.location }}
            </p>
          </div>
        </div>
      </template>

      <!-- 叠加层：相机小图标 -->
      <template #overlay>
        <div class="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="bg-black/20 backdrop-blur-md p-1 rounded-full">
            <Camera :size="12" class="text-white" />
          </div>
        </div>
      </template>
    </LiveTile>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Camera } from 'lucide-vue-next';
import LiveTile from '../components/LiveTile.vue';

interface PhotoItem {
  url: string;
  location: string;
  date?: string;
}

// 模拟磁贴展示的照片数据
const photoList = ref<PhotoItem[]>([
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    location: '优胜美地国家公园',
    date: '2023年10月'
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80',
    location: '落基山脉',
    date: '2023年11月'
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80',
    location: '瓦纳卡湖',
    date: '2024年1月'
  },
  {
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80',
    location: '红杉林公园',
    date: '2024年2月'
  }
]);
</script>

<style scoped>
/* 针对动态磁贴的平滑缩放增强 */
.group:hover .bg-cover {
  transform: scale(1.1);
}

/* 文字阴影增强可读性 */
p {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
</style>
