<template>
  <div 
    class="mobile-nav fixed bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 z-[999999] flex items-center justify-center cursor-pointer group"
    @click.stop="handleHome"
    @mousedown="startLongPress"
    @mouseup="clearLongPress"
    @mouseleave="clearLongPress"
    @touchstart.passive="startLongPress"
    @touchend.passive="clearLongPress"
  >
    <div class="w-full h-full bg-black/20 dark:bg-white/20 rounded-full group-hover:bg-black/40 dark:group-hover:bg-white/40 transition-all duration-300 group-active:scale-x-125 group-active:h-1.5 shadow-sm"></div>
  </div>
</template>

<script setup lang="ts">
import { minimizeAll, toggleSwitcher } from '../stores/windowStore'
import { ref } from 'vue'

const longPressTimer = ref<any>(null)
const isLongPressTriggered = ref(false)

const handleHome = () => {
  if (isLongPressTriggered.value) {
    isLongPressTriggered.value = false
    return
  }
  minimizeAll()
}

const startLongPress = () => {
  isLongPressTriggered.value = false
  longPressTimer.value = setTimeout(() => {
    isLongPressTriggered.value = true
    toggleSwitcher()
  }, 500)
}

const clearLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}
</script>

<style scoped>
.mobile-nav {
  padding: 10px 0; /* 增大触控区域 */
}
</style>
