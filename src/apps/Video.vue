<template>
  <div class="w-full h-full bg-gray-900 text-white flex flex-col md:flex-row overflow-hidden font-sans">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col bg-black">
      <!-- Video Player -->
      <div class="relative w-full flex-grow aspect-video bg-black group">
        <video v-if="currentVideo" :key="currentVideo.src" :src="currentVideo.src" controls autoplay class="w-full h-full object-contain">
          Your browser does not support the video tag.
        </video>
        <div v-else class="w-full h-full flex items-center justify-center flex-col text-gray-500">
          <i class="icofont-ui-play text-7xl"></i>
          <p class="mt-4 text-lg">Select a video to play</p>
        </div>
        <div class="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h2 v-if="currentVideo" class="text-2xl font-bold text-white">{{ currentVideo.title }}</h2>
        </div>
      </div>
      <!-- Video Info -->
      <transition name="fade">
        <div v-if="currentVideo" class="p-5 border-t border-gray-800 bg-gray-900/50">
          <div class="flex items-center flex-wrap gap-x-6 gap-y-2 text-gray-400 text-sm">
            <span class="flex items-center"><i class="icofont-user-alt-7 mr-2 text-base"></i>{{ currentVideo.creator }}</span>
            <span class="flex items-center"><i class="icofont-eye-alt mr-2 text-base"></i>{{ currentVideo.views }} views</span>
            <span class="flex items-center"><i class="icofont-clock-time mr-2 text-base"></i>{{ currentVideo.uploadDate }}</span>
          </div>
          <p class="text-gray-300 mt-4 text-sm leading-relaxed max-w-4xl">{{ currentVideo.description }}</p>
        </div>
      </transition>
    </div>

    <!-- Playlist Sidebar -->
    <aside class="w-full md:w-96 h-full bg-gray-900/80 backdrop-blur-sm flex-shrink-0 overflow-y-auto">
      <div class="p-4 border-b border-gray-700 sticky top-0 bg-gray-900/70 backdrop-blur-md z-10">
        <h3 class="text-xl font-semibold text-white">Playlist</h3>
      </div>
      <ul class="divide-y divide-gray-800">
        <li
          v-for="video in videoList"
          :key="video.id"
          @click="playVideo(video)"
          class="flex p-3 cursor-pointer transition-all duration-300 ease-in-out"
          :class="currentVideo?.id === video.id ? 'bg-accent/20 border-l-4 border-accent' : 'hover:bg-gray-800/60'"
        >
          <div class="relative flex-shrink-0 mr-4">
            <img :src="video.thumbnail" alt="thumbnail" class="w-32 h-20 object-cover rounded-lg bg-gray-700 shadow-lg">
            <span class="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full font-mono text-[10px]">{{ video.duration }}</span>
          </div>
          <div class="flex-grow overflow-hidden">
            <h4 class="font-semibold text-white leading-tight truncate-2-lines text-sm mb-1">{{ video.title }}</h4>
            <p class="text-sm text-gray-400">{{ video.creator }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ video.views }} views</p>
          </div>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Video {
  id: number;
  title: string;
  creator: string;
  description: string;
  thumbnail: string;
  src: string;
  duration: string;
  views: string;
  uploadDate: string;
}

const videoList = ref<Video[]>([
  {
    id: 1,
    title: 'FlyOS System Demo - Explore the Next-Gen Desktop Experience',
    creator: 'FlyOS Dev Team',
    description: 'A short video showcasing the main features and design philosophy of FlyOS, including the Metro UI, window management, and multitasking. See how we are redefining the desktop OS.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d1469c9b?w=200&q=80',
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '0:10',
    views: '12K',
    uploadDate: '2 weeks ago'
  },
  {
    id: 2,
    title: 'Sunset at the Beach',
    creator: 'Nature Photographer',
    description: 'A stunning sunset captured at a tranquil beach, with waves gently lapping the shore. A perfect video to relax and unwind.',
    thumbnail: 'https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&dpr=2&h=100',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-of-a-beach-at-sunset-22124-large.mp4',
    duration: '0:15',
    views: '87K',
    uploadDate: '1 month ago'
  },
  {
    id: 3,
    title: 'City Night Timelapse',
    creator: 'Urban Explorer',
    description: 'A timelapse of a bustling metropolis, showing the dynamic flow of traffic and lights at night.',
    thumbnail: 'https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=100',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-city-at-night-42211-large.mp4',
    duration: '0:20',
    views: '150K',
    uploadDate: '3 months ago'
  },
  {
    id: 4,
    title: 'Creek in the Forest',
    creator: 'Scenery Documentarian',
    description: 'Clear water flowing over mossy rocks in a forest, with sunlight filtering through the leaves.',
    thumbnail: 'https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&dpr=2&h=100',
    src: 'https://assets.mixkit.co/videos/preview/mixkit-creek-running-over-rocks-in-the-woods-33823-large.mp4',
    duration: '0:29',
    views: '290K',
    uploadDate: '5 months ago'
  },
]);

const currentVideo = ref<Video | null>(videoList.value[0]);

const playVideo = (video: Video) => {
  currentVideo.value = video;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.truncate-2-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Custom scrollbar for a better look */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #4a5568; /* gray-600 */
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #718096; /* gray-500 */
}

/* For Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #4a5568 transparent;
}
</style>
