<template>
  <div class="cpu-tile relative w-full h-full overflow-hidden select-none">
    <!-- 背景动态层 -->
    <div
      class="absolute inset-0 transition-opacity duration-500"
      :class="live ? 'opacity-100' : 'opacity-40'"
    >
      <div class="cpu-bg" />
    </div>

    <!-- 内容层 -->
    <div class="relative z-10 flex flex-col h-full p-3">
      <!-- 标题 -->
      <div class="text-xs text-gray-500 dark:text-gray-400">
        CPU
      </div>

      <!-- 使用率 -->
      <div class="flex items-end gap-2 mt-1">
        <div class="text-3xl font-bold tabular-nums">
          {{ usage }}%
        </div>
        <div class="text-xs text-gray-500 mb-1">
          usage
        </div>
      </div>

      <!-- 核心负载 -->
      <div class="flex items-end gap-1 mt-auto">
        <div
          v-for="(core, i) in cores"
          :key="i"
          class="core-bar"
        >
          <div
            class="core-bar-inner"
            :style="{ height: core + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 是否启用 Live 效果
 * Tile 不需要知道
 */
const live = ref(true)

/**
 * mock CPU 数据
 * 后面你可以替换为真实数据源
 */
const usage = ref(18)
const cores = ref<number[]>([20, 15, 10, 25])

let timer: number | null = null

function tick() {
  usage.value = clamp(
    usage.value + rand(-5, 6),
    5,
    95
  )

  cores.value = cores.value.map(v =>
    clamp(v + rand(-10, 11), 5, 100)
  )
}

onMounted(() => {
  if (!live.value) return
  timer = window.setInterval(tick, 1200)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
</script>

<style scoped>
.cpu-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(59, 130, 246, 0.25),
    rgba(16, 185, 129, 0.25),
    rgba(59, 130, 246, 0.25)
  );
  background-size: 200% 200%;
  animation: cpu-bg-move 6s ease infinite;
  filter: blur(18px);
}

@keyframes cpu-bg-move {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.core-bar {
  width: 6px;
  height: 36px;
  background: rgba(0,0,0,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.core-bar-inner {
  width: 100%;
  background: linear-gradient(
    to top,
    #22c55e,
    #3b82f6
  );
  transition: height 0.6s cubic-bezier(.4,0,.2,1);
}
</style>
