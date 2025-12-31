<template>
  <Transition name="fade">
    <div v-if="state.isOpen"
         class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4"
         v-on:mousedown.self="messageBox.handleCancel">

      <div class="w-full max-w-[400px] bg-[#f3f3f3] dark:bg-[#2c2c2c] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                  border border-white/20 dark:border-white/5 overflow-hidden flex flex-col animate-scale-in backdrop-blur-lg">

        <!-- 头部栏 -->
        <div class="flex items-center justify-between px-4 py-3 select-none">
          <div class="flex items-center gap-2">
            <div class="">
              <svg v-if="state.type === 'alert'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <svg v-if="state.type === 'confirm'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <svg v-if="state.type === 'prompt'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            </div>
            <span class="text-md font-medium text-gray-600 dark:text-gray-300">{{ state.title }}</span>
          </div>
          <button v-on:click="messageBox.handleCancel" class="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="px-6 py-4 flex-1">
          <p class="text-[14px] text-gray-800 dark:text-gray-200 leading-normal whitespace-pre-wrap">
            {{ state.message }}
          </p>

          <div v-if="state.type === 'prompt'" class="mt-4">
            <input
              v-model="state.inputValue"
              ref="inputRef"
              type="text"
              class="w-full rounded px-3 py-2 bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10
                     focus:outline-none text-sm transition-all dark:text-white"
              v-on:keydown.enter="messageBox.handleConfirm"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="px-6 py-4  flex flex-row-reverse gap-3">
          <button
            v-on:click="messageBox.handleConfirm"
            :style="{ backgroundColor: 'var(--accent-color)' }"
            class="min-w-[80px] px-4 py-1.5 text-white text-[13px] rounded-md transition-all active:scale-95 shadow-sm hover:brightness-90"
          >
            {{ state.type === 'confirm' ? '确认' : '好' }}
          </button>

          <button
            v-if="state.type !== 'alert'"
            v-on:click="messageBox.handleCancel"
            class="min-w-[80px] px-4 py-1.5 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10
                   text-gray-800 dark:text-gray-200 text-[13px] rounded-md transition-all active:scale-95"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch, ref, nextTick } from 'vue';
import { messageBox } from '../composables/useMessage.ts';

const state = messageBox.state;
const inputRef = ref<HTMLInputElement | null>(null);

// 自动聚焦 Prompt 输入框
watch(() => state.isOpen, (newVal) => {
  if (newVal && state.type === 'prompt') {
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus();
        inputRef.value.select();
      }
    });
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-scale-in {
  animation: scaleIn 0.2s cubic-bezier(0.1, 0.9, 0.2, 1);
}

input:focus {
  border-color: var(--accent-color);
}
</style>
