
<template>
  <transition name="fade">
    <div
        :key="themeStore.wallpaper.value"
        class="absolute top-0 left-0 z-[-10] w-full h-full bg-cover bg-center"
        :style="{ backgroundImage: `url(${themeStore.wallpaper.value})` }"
    >
        <div class="absolute inset-0 w-full h-full transition-colors duration-500 bg-white/10 dark:bg-black/20" ></div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { themeStore } from '@/stores/themeStore';
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .8s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
