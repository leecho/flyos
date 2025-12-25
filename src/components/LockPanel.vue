<template>
  <teleport to='body'>
    <Transition name="fade">
      <div
        v-show='visible'
        ref="menuRef"
        class="fixed inset-0 z-[99999] w-full h-full flex flex-col items-center justify-center
               text-black dark:text-white backdrop-blur-md bg-white/20 dark:bg-black/40
               transition-all duration-500 ease-in-out"
        @click="handleOverlayClick"
      >
        <!-- 1. 待机层：显示时间和日期 -->
        <Transition name="slide-up">
          <div
            v-if="!showInput"
            class="flex flex-col items-center cursor-pointer select-none"
          >
            <div class="text-[120px] font-thin tracking-tighter leading-none mb-4">
              {{ timeStr }}
            </div>
            <div class="text-2xl font-light opacity-80">
              {{ dateStr }}
            </div>
            <div class="absolute bottom-16 animate-bounce opacity-50 flex flex-col items-center">
              <span class="text-sm">点击进入系统</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mt-2"><path d="m18 15-6-6-6 6"/></svg>
            </div>
          </div>
        </Transition>

        <!-- 2. 登录层：原来的逻辑保持不变 -->
        <Transition name="zoom">
          <div
            v-if="showInput"
            class="flex flex-col items-center gap-6 p-10 max-w-sm w-full mx-4"
            @click.stop
          >
            <!-- 用户头像：保持 userStore 绑定 -->
            <div class='rounded-full border-4 border-white/30 shadow-lg overflow-hidden w-32 h-32'>
              <img :src='userStore.user.avatar' class='w-full h-full object-cover' />
            </div>

            <div class='text-2xl font-medium text-black/80 dark:text-white/90'>
              {{ userStore.user.name || 'FlyOS User' }}
            </div>

            <!-- 输入逻辑：保持 keyword 绑定 -->
            <div class='w-full space-y-4'>
              <div class="relative">
                <input
                  v-model='keyword'
                  type='password'
                  placeholder="请输入密码"
                  autoFocus
                  @keyup.enter='unlock'
                  class="w-full text-center bg-white/40 dark:bg-white/10 border border-white/20 outline-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <button
                @click='unlock'
                class='w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer'
              >
                登录
              </button>

              <div v-if="showInput" class="text-center">
                <button @click="showInput = false" class="text-sm opacity-60 hover:opacity-100 transition-opacity">返回</button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </teleport>
</template>

<script setup lang='ts'>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { userStore } from '../stores/userStore.ts'

// 基础显示逻辑
const visible = ref(false)
const keyword = ref('')
const showInput = ref(false)

watch(() => userStore.user.locked, (newValue, oldValue) => {
  visible.value = newValue
},{ immediate: true})


// 时间显示逻辑
const timeStr = ref('')
const dateStr = ref('')

const updateDateTime = () => {
  const now = new Date()
  timeStr.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  dateStr.value = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
}

let timer: any
onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (e: KeyboardEvent) => {
  if (visible.value && !showInput.value) {
    showInput.value = true
  }
}

const handleOverlayClick = () => {
  if (!showInput.value) {
    showInput.value = true
  }
}

// 解锁逻辑：保持原有逻辑
const unlock = () => {
  // 这里保留你原来的判断逻辑，比如校验 keyword
  // 假设你之前的逻辑是直接 visible.value = false
  if (keyword.value === '123' || keyword.value === '') {
    // visible.value = false
    userStore.user.locked = false
    keyword.value = ''
    showInput.value = false
  } else {
    // 简单的反馈
    console.log('密码错误')
  }
}

const lock = () => {
  visible.value = true
  showInput.value = false
}

defineExpose({ lock })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-leave-to {
  transform: translateY(-50px);
  opacity: 0;
}

.zoom-enter-active, .zoom-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zoom-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
</style>
