<template>
  <div
      class="absolute top-0 left-0 z-[-10] w-full h-full bg-cover bg-center"
      :style="{ backgroundImage: `url(${wallpaper})` }"
  ></div>
</template>

<script setup lang="ts">
import wallpaper from '@/assets/wallpaper.jpg'
</script>
