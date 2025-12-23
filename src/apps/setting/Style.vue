<template>
  <h2 class="text-xl font-semibold mb-3">个性化</h2>
  <div class=" p-4 setting-item flex flex-row">
    <div class="text-lg text-gray-600 dark:text-white leading-[37px]">系统风格</div>
    <div class="flex flex-wrap gap-3 flex-1 justify-end">
      <button
          v-for="t in themes"
          :key="t.value"
          @click="setTheme(t.value)"
          class="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          :class="{ 'bg-blue-500 text-white border-blue-500': theme === t.value }"
      >
        {{ t.label }}
      </button>
    </div>
  </div>
  <div class=" p-4 setting-item flex flex-row">
    <div class="text-lg text-gray-600 dark:text-white leading-[37px]">系统风格</div>
    <div class="flex flex-wrap gap-3 flex-1 justify-end">
      <button
          v-for="t in modes"
          :key="t.value"
          @click="setDesktopMode(t.value)"
          class="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          :class="{ 'bg-blue-500 text-white border-blue-500': mode === t.value }"
      >
        {{ t.label }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";
import {themeStore} from "../../stores/themeStore.ts";
import { DesktopMode, desktopStore, setMode } from '../../stores/desktopStore.ts'

const themes = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'system' }
]

const modes = [{ label: '磁贴', value: 'metro' },
  { label: '图标', value: 'desktop' }]

const theme = ref(themeStore.theme)

const mode = ref(desktopStore.mode)

function setTheme(val: 'light' | 'dark' | 'system') {
  theme.value = val
  themeStore.setTheme(val)
}

function setDesktopMode(val: DesktopMode){
  mode.value = val
  setMode(val)
}

</script>
<style>
@reference "@/styles/tailwind.css";

.setting-item{
  @apply rounded-md bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-100
}
</style>
