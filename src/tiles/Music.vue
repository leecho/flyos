<template>
  <div class="w-full h-full relative group">
    <!-- 核心音频元素 -->
    <audio ref="audioRef" :src="currentTrack.url" @ended="handleEnded"></audio>

    <LiveTile :items="trackList" :interval="8000" :paused="isPlaying" animationType="fade">
      <template #default="{ item, index }">
        <!-- 页面：音乐封面与播放状态 -->
        <div class="w-full h-full relative">
          <!-- 背景封面 -->
          <div
            class="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear"
            :class="{ 'scale-125': isPlaying && currentTrackIndex === index }"
            :style="{ backgroundImage: `url(${item.cover})` }"
          >
            <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          </div>

          <!-- 内容层 -->
          <div class="absolute inset-0 p-3 flex flex-col justify-between z-10 text-left">
            <div class="flex justify-between items-start">
              <div class="bg-white/10 p-1.5 rounded-full">
                <Music :size="14" :class="{ 'animate-pulse': isPlaying && currentTrackIndex === index }" />
              </div>
              <!-- 播放状态动画指示器 -->
              <div v-if="isPlaying && currentTrackIndex === index" class="flex items-end gap-[2px] h-3">
                <div class="w-[2px] bg-white animate-music-bar-1"></div>
                <div class="w-[2px] bg-white animate-music-bar-2"></div>
                <div class="w-[2px] bg-white animate-music-bar-3"></div>
              </div>
            </div>

            <div class="pb-4">
              <h4 class="text-xs font-bold text-white truncate">{{ item.title }}</h4>
              <p class="text-[10px] text-white/70 truncate">{{ item.artist }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- 叠加层：控制按钮 -->
      <template #overlay>
        <div class="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <button
            @click.stop="togglePlay"
            class="p-3 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md transition-all active:scale-90"
          >
            <Play v-if="!isPlaying" :size="24" fill="currentColor" />
            <Pause v-else :size="24" fill="currentColor" />
          </button>
        </div>
      </template>
    </LiveTile>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Music, Play, Pause } from 'lucide-vue-next';
import LiveTile from '../components/LiveTile.vue';

interface Track {
  title: string;
  artist: string;
  cover: string;
  url: string;
}

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTrackIndex = ref(0);

// 预设公开歌曲列表 (示例：来自公开免版权资源)
const trackList = ref<Track[]>([
  {
    title: 'Lofi Study',
    artist: 'FASSounds',
    cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    title: 'Dreamy Vibe',
    artist: 'ChillHop',
    cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=400',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  }
]);

const currentTrack = computed(() => trackList.value[currentTrackIndex.value]);

function togglePlay() {
  if (!audioRef.value) return;

  if (isPlaying.value) {
    audioRef.value.pause();
    isPlaying.value = false;
  } else {
    audioRef.value.play();
    isPlaying.value = true;
  }
}

function handleEnded() {
  isPlaying.value = false;
  // 自动下一首
  currentTrackIndex.value = (currentTrackIndex.value + 1) % trackList.value.length;
  // 延迟播放
  setTimeout(() => {
    togglePlay();
  }, 500);
}
</script>

<style scoped>
/* 音乐律动条动画 */
@keyframes music-bar {
  0%, 100% { height: 4px; }
  50% { height: 12px; }
}

.animate-music-bar-1 { animation: music-bar 0.6s infinite ease-in-out; }
.animate-music-bar-2 { animation: music-bar 0.6s infinite ease-in-out 0.2s; }
.animate-music-bar-3 { animation: music-bar 0.6s infinite ease-in-out 0.4s; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
