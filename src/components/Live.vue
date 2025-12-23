<template>
  <div class="relative w-full h-full overflow-hidden">
    <transition :name="animation" mode="out-in">
      <div
        :key="index"
        class="absolute inset-0 flex items-center justify-center"
      >
        <slot :item="current" :index="index" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  items: any[]
  interval?: number
  animation?: 'fade' | 'slide'
}>()

const index = ref(0)
let timer: number | null = null

const current = computed(() => props.items[index.value])

function next() {
  index.value = (index.value + 1) % props.items.length
}

onMounted(() => {
  if (props.items.length <= 1) return
  timer = window.setInterval(next, props.interval ?? 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all .4s ease;
}
.slide-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
