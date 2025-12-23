<template>
  <teleport to="body">
    <!-- 背景遮罩：点击关闭 -->
    <div
      v-if="visible"
      class="fixed inset-0 z-[99999] pointer-events-auto"
      @click="close"
      @contextmenu.prevent="close"
    ></div>

    <!-- 开始菜单面板 -->
    <Transition name="start-menu-slide">
      <div
        v-if="visible"
        ref="menuRef"
        class="start-menu-panel fixed bottom-14 left-2 w-[600px] h-[720px] max-h-[85vh]
               rounded-xl border border-white/20 shadow-2xl overflow-hidden
               flex flex-col text-white z-[100000]"
        @click.stop
      >
        <!-- 顶部用户状态栏 -->
        <div class="p-6 flex items-center justify-between bg-white/5 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <img :src="userStore.user.avatar" class="w-full h-full object-cover" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-semibold">{{ userStore.user.name || 'FlyOS User' }}</span>
              <span class="text-[10px] opacity-60">在线</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="lockUser" class="p-2 hover:bg-white/10 rounded-lg transition-colors" title="锁定">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </button>
            <button @click="logout" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400" title="关机">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"></path><path d="M18.48 4.61a8 8 0 1 1-12.96 0"></path></svg>
            </button>
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="px-6 py-4">
          <div class="relative group">
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索应用、设置和文档..."
              class="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4
                     text-sm outline-none focus:border-blue-500/50 focus:bg-black/40
                     transition-all duration-300"
            />
            <svg class="absolute left-3 top-3 text-white/40 group-focus-within:text-blue-400 transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          </div>
        </div>

        <!-- 应用网格区域 -->
        <div class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-xs font-bold text-white/60 uppercase tracking-wider">已固定的应用</span>
            <button class="text-[11px] text-blue-400 hover:underline">所有应用 ></button>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="app in filteredApps"
              :key="app.id"
              class="flex flex-col items-center p-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
              @click="handleStartTask(app)"
            >
              <div class="w-12 h-12 mb-2 flex items-center justify-center relative">
                <!-- 这里的 AppIcon/LogoIcon 可以根据你的实际组件名替换 -->
                <div class="w-full h-full bg-white/5 rounded-2xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
                  <AppIcon :id='app.id' size='md' />
                </div>
              </div>
              <span class="text-xs text-center w-full truncate opacity-90 group-hover:opacity-100">{{ app.name }}</span>
            </div>
          </div>

          <!-- 最近使用的项目 (装饰性) -->
          <div class="mt-8">
            <span class="text-xs font-bold text-white/60 uppercase tracking-wider block mb-4">推荐</span>
            <div class="grid grid-cols-1 gap-2">
              <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs">最近的文档 {{ i }}.docx</span>
                  <span class="text-[10px] opacity-40">2小时前打开过</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { startTask } from '../stores/taskStore'
import { appStore } from '../stores/appStore'
import { userStore } from '../stores/userStore'
import AppIcon from './AppIcon.vue'

const visible = ref(false)
const keyword = ref('')

const filteredApps = computed(() => {
  if (!keyword.value) return appStore.apps
  return appStore.apps.filter(app =>
    app.name.toLowerCase().includes(keyword.value.toLowerCase())
  )
})

const toggleOpen = () => {
  visible.value = !visible.value
  if (visible.value) keyword.value = ''
}

const close = () => {
  visible.value = false
}

const handleStartTask = (app: any) => {
  startTask(app)
  close()
}

const lockUser = () => {
  console.log('Locking...')
  close()
}

const logout = () => {
  console.log('Shutting down...')
  close()
}

// 暴露给父组件（TaskBar）调用
defineExpose({
  toggleOpen,
  close
})
</script>

<style scoped>
.start-menu-panel {
  background: rgba(25, 25, 25, 0.75);
  backdrop-filter: blur(40px) saturate(150%);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* 进场和出场动画 */
.start-menu-slide-enter-active,
.start-menu-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.start-menu-slide-enter-from,
.start-menu-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transform-origin: bottom left;
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
