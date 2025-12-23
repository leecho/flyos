<template>
  <div v-for="box in messageBoxStore.queue" :key="box.message + box.type">
    <!-- 遮罩 -->
    <div
        class="fixed inset-0 bg-black/0 z-[999]"
        v-if="!box.targetWindowId"
    ></div>

    <!-- 局部遮罩 -->
    <div
        class="absolute bg-black/30 z-[999]"
        v-if="box.targetWindowId"
        :style="getWindowMaskStyle(box.targetWindowId)"
    ></div>

    <!-- 对话框 -->
    <div
        class="fixed z-[1000] w-80 p-4 bg-white dark:bg-gray-900 rounded border border-gray-300/40 dark:border-gray-700/40 shadow-xl"
        :style="getWindowPosition(box.targetWindowId)"
    >
      <div class="mb-4 text-gray-900 dark:text-gray-100">{{ box.message }}</div>

      <input
          v-if="box.type === 'prompt'"
          v-model="promptValue"
          class="w-full p-1 border border-gray-300 border-gray-300/40 dark:border-gray-700/40 rounded mb-3"
      />

      <div class="flex justify-end gap-2">
        <button
            v-if="box.type !== 'alert'"
            @click="cancel(box)"
            class="px-3 py-1 rounded border border-gray-300/40 dark:border-gray-700/40 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          取消
        </button>
        <button
            @click="confirm(box)"
            class="px-3 py-1 rounded border border-gray-300/40 dark:border-gray-700/80 bg-blue-500 text-white hover:bg-blue-600"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { messageBoxStore, closeMessageBox } from '../stores/messageBoxStore'
import { getWindow } from '../stores/windowStore'

const promptValue = ref('')

function confirm(box) {
  if (box.type === 'prompt') {
    closeMessageBox(box, promptValue.value)
    promptValue.value = ''
  } else {
    closeMessageBox(box, true)
  }
}

function cancel(box) {
  closeMessageBox(box, false)
}

function getWindowMaskStyle(windowId: string) {
  const win = getWindow(windowId)
  if (!win) return {}
  return {
    top: win.position.y + 'px',
    left: win.position.x + 'px',
    width: win.position.width + 'px',
    height: win.position.height + 'px'
  }
}

function getWindowPosition(windowId?: string) {
  if (!windowId) {
    return { top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
  const win = getWindow(windowId)
  if (!win) return { top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }
  return {
    position: 'absolute',
    top: win.position.y + win.position.height / 2 + 'px',
    left: win.position.x + win.position.width / 2 + 'px',
    transform: 'translate(-50%, -50%)'
  }
}
</script>
