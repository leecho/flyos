<template>
  <div class="flex h-full w-full bg-white dark:bg-gray-950 overflow-hidden text-gray-900 dark:text-gray-100 font-sans selection:bg-accent/30">
    <!-- 左侧侧边栏 -->
    <aside class="w-56 border-r border-gray-100 dark:border-gray-800/50 flex flex-col bg-gray-50/50 dark:bg-gray-900/20 backdrop-blur-md">
      <div class="p-6">
        <h2 class="text-xl font-bold flex items-center gap-2 tracking-tight text-accent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          FlyMusic
        </h2>
      </div>

      <nav class="flex-1 px-3 space-y-1">
        <div class="mb-4">
          <p class="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">发现</p>
          <button v-for="item in navMain" :key="item.name"
                  class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all"
                  :class="activeNav === item.name ? 'bg-accent text-white shadow-lg' : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50'">
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.name }}
          </button>
        </div>

        <div>
          <p class="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">我的音乐</p>
          <button v-for="item in navMy" :key="item.name"
                  class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-all text-gray-600 dark:text-gray-400">
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.name }}
          </button>
        </div>
      </nav>

      <!-- 当前播放简略信息 -->
      <div v-if="currentTrack" class="p-4 border-t border-gray-100 dark:border-gray-800/50">
        <div class="flex items-center gap-3">
          <div class="relative w-10 h-10 rounded-lg overflow-hidden group shadow-md">
            <img :src="currentTrack.cover" class="w-full h-full object-cover" :class="{'animate-spin-slow': isPlaying}">
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold truncate">{{ currentTrack.title }}</p>
            <p class="text-[10px] opacity-60 truncate">{{ currentTrack.artist }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-accent/5 to-white dark:from-accent/10 dark:to-gray-950">
      <!-- 搜索栏 -->
      <header class="h-16 flex items-center justify-between px-8 z-10">
        <div class="flex gap-4">
          <button class="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
          <button class="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-50"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
        </div>
        <div class="relative w-64 group">
          <input type="text" placeholder="搜索歌曲、专辑..."
                 class="w-full bg-gray-100/50 dark:bg-gray-800/50 border-none rounded-full py-1.5 pl-9 pr-4 text-xs focus:ring-2 focus:ring-accent/50 transition-all outline-none">
          <svg class="absolute left-3 top-2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto px-8 pb-32 custom-scrollbar">
        <!-- 推荐 Banner -->
        <div class="relative h-48 rounded-2xl overflow-hidden mb-8 group cursor-pointer shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-r from-accent to-indigo-800 mix-blend-multiply"></div>
          <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80" class="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700">
          <div class="absolute inset-0 p-8 flex flex-col justify-end">
            <span class="text-xs font-bold uppercase tracking-widest text-accent/70 mb-2">热门推荐</span>
            <h1 class="text-3xl font-black text-white mb-1">感性电子乐辑</h1>
            <p class="text-white/70 text-sm max-w-sm">发现属于你的深夜频率，聆听数字时代的温柔回响。</p>
          </div>
        </div>

        <!-- 歌曲列表 -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold">我的曲库</h3>
            <button class="text-xs text-accent font-bold hover:underline">播放全部</button>
          </div>

          <table class="w-full text-left text-sm">
            <thead>
            <tr class="text-gray-400 border-b border-gray-100 dark:border-gray-800/50">
              <th class="py-3 font-medium w-12 text-center">#</th>
              <th class="py-3 font-medium">标题</th>
              <th class="py-3 font-medium">专辑</th>
              <th class="py-3 font-medium text-right pr-4"><svg class="inline" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(track, index) in tracks" :key="track.id"
                @dblclick="playTrack(track)"
                class="group hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors rounded-lg cursor-default"
                :class="{'text-accent': currentTrack?.id === track.id}">
              <td class="py-3 text-center opacity-50 group-hover:hidden">{{ index + 1 }}</td>
              <td class="py-3 text-center hidden group-hover:table-cell">
                <button @click="playTrack(track)"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg></button>
              </td>
              <td class="py-3">
                <div class="flex items-center gap-3">
                  <img :src="track.cover" class="w-8 h-8 rounded object-cover shadow-sm">
                  <div>
                    <p class="font-bold truncate max-w-[200px]">{{ track.title }}</p>
                    <p class="text-[10px] opacity-60">{{ track.artist }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 text-gray-500 italic">{{ track.album }}</td>
              <td class="py-3 text-right pr-4 text-xs tabular-nums opacity-60">{{ track.duration }}</td>
            </tr>
            </tbody>
          </table>
        </section>
      </div>

      <!-- 播放控制台 -->
      <footer class="absolute bottom-0 inset-x-0 h-24 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800/50 flex items-center px-8 gap-8">
        <!-- 当前播放信息 (Mobile Hidden) -->
        <div class="w-1/4 flex items-center gap-4">
          <div v-if="currentTrack" class="flex items-center gap-3">
            <img :src="currentTrack.cover" class="w-12 h-12 rounded-lg shadow-lg" :class="{'animate-pulse': isPlaying}">
            <div class="overflow-hidden">
              <h4 class="text-sm font-bold truncate">{{ currentTrack.title }}</h4>
              <p class="text-xs opacity-60 truncate">{{ currentTrack.artist }}</p>
            </div>
          </div>
        </div>

        <!-- 核心控制 -->
        <div class="flex-1 flex flex-col items-center gap-2">
          <div class="flex items-center gap-6">
            <button class="text-gray-400 hover:text-accent transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 20-4-4 4-4"/><path d="m5 4 4 4-4 4"/><path d="M21 12H9"/><path d="M3 12h12"/></svg></button>
            <button @click="prev" class="hover:scale-110 transition-transform"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="m11 19-9-7 9-7v14zm11-14v14l-9-7 9-7z"/></svg></button>
            <button @click="togglePlay" class="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg transition-all">
              <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <button @click="next" class="hover:scale-110 transition-transform"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="m13 19 9-7-9-7v14zM2 5v14l9-7-9-7z"/></svg></button>
            <button class="text-gray-400 hover:text-accent transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m17 2 3 3-3 3"/><path d="M20 5H9a2 2 0 0 0-2 2v7"/><path d="m7 22-3-3 3-3"/><path d="M4 19h11a2 2 0 0 0 2-2v-7"/></svg></button>
          </div>

          <div class="w-full flex items-center gap-3 px-4">
            <span class="text-[10px] opacity-50 tabular-nums">02:14</span>
            <div class="flex-1 h-1 bg-gray-200 dark:bg-gray-800 rounded-full relative group cursor-pointer overflow-hidden">
              <div class="absolute inset-y-0 left-0 bg-accent w-[45%]"></div>
            </div>
            <span class="text-[10px] opacity-50 tabular-nums">{{ currentTrack?.duration || '00:00' }}</span>
          </div>
        </div>

        <!-- 音量与辅助功能 -->
        <div class="w-1/4 flex items-center justify-end gap-4 text-gray-400">
          <button class="hover:text-accent"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
          <div class="flex items-center gap-2 group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <div class="w-20 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div class="h-full bg-accent w-[70%]"></div>
            </div>
          </div>
          <button class="hover:text-accent"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg></button>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'

// 图标组件 (Mock)
const HomeIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' }
const SearchIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' }
const LibraryIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>' }
const HeartIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.046 3 5.5L12 21l7-7z"/></svg>' }
const ListIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' }

const navMain = [
  { name: '发现音乐', icon: HomeIcon },
  { name: '排行榜', icon: SearchIcon },
  { name: '新曲首发', icon: LibraryIcon },
]

const navMy = [
  { name: '我的收藏', icon: HeartIcon },
  { name: '播放历史', icon: ListIcon },
]

const activeNav = ref('发现音乐')
const isPlaying = ref(false)

// 歌曲数据
const tracks = ref([
  { id: 1, title: 'Lost in the City', artist: 'Urban Soundscape', album: 'Neon Lights', duration: '04:20', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=100&q=80' },
  { id: 2, title: 'Midnight Dream', artist: 'Luna Ray', album: 'Starlight', duration: '03:45', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=100&q=80' },
  { id: 3, title: 'Wild Heart', artist: 'The Wanderers', album: 'Horizons', duration: '05:12', cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&w=100&q=80' },
  { id: 4, title: 'Digital Echo', artist: 'Synth Wave', album: 'Retro Future', duration: '03:10', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80' },
  { id: 5, title: 'Acoustic Soul', artist: 'Ben Harper', album: 'Wooden Strings', duration: '04:02', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=100&q=80' },
])

const currentTrack = ref(tracks.value[0])

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const playTrack = (track: any) => {
  currentTrack.value = track
  isPlaying.value = true
}

const next = () => {
  const index = tracks.value.findIndex(t => t.id === currentTrack.value.id)
  currentTrack.value = tracks.value[(index + 1) % tracks.value.length]
}

const prev = () => {
  const index = tracks.value.findIndex(t => t.id === currentTrack.value.id)
  currentTrack.value = tracks.value[(index - 1 + tracks.value.length) % tracks.value.length]
}
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 12s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(155, 155, 155, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(155, 155, 155, 0.4);
}

/* 毛玻璃增强 */
.backdrop-blur-xl {
  backdrop-filter: blur(24px) saturate(180%);
}
</style>
