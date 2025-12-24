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
               rounded-xl border border-black/10 dark:border-white/20 shadow-2xl overflow-hidden
               flex flex-col text-slate-900 dark:text-white z-[100000]
               bg-white/70 dark:bg-[#191919]/75 backdrop-blur-[40px] saturate-[150%]"
        @click.stop
      >
        <!-- 顶部用户状态栏 -->
        <div class="p-6 flex items-center justify-between bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full border border-black/10 dark:border-white/20 overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <img :src="userStore.user.avatar" class="w-full h-full object-cover" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-semibold">{{ userStore.user.name || 'FlyOS User' }}</span>
              <span class="text-xs opacity-60">在线</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button @click='lockUser' class="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </button>
            <button @click="logout" class="p-2 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-500 rounded-lg transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/></svg>
            </button>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="px-6 py-4">
          <div class="relative group">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索应用、文档..."
              class="w-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 rounded-lg py-2.5 pl-10 pr-4
                     text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-[#2a2a2a] transition-all"
            />
          </div>
        </div>

        <!-- 主内容区：固定高度滚动 -->
        <div class="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4 px-2">
              <span class="text-xs font-bold uppercase tracking-wider opacity-50">已固定</span>
              <button class="text-xs bg-black/5 dark:bg-white/10 px-2 py-1 rounded hover:bg-black/10 dark:hover:bg-white/20 transition-colors">所有应用 ></button>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div
                v-for="app in filteredApps"
                :key="app.id"
                @click="handleStartTask(app)"
                class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-all group active:scale-95"
              >
                <div class="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 shadow-sm group-hover:shadow-md transition-shadow">
                  <AppIcon :id='app.id' />
                </div>
                <span class="text-xs text-center truncate w-full">{{ app.name }}</span>
              </div>
            </div>
          </div>

          <!-- 最近使用/推荐 -->
          <div v-if="!keyword">
            <div class="mb-4 px-2 text-xs font-bold uppercase tracking-wider opacity-50">推荐</div>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="i in 4" :key="i" class="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors">
                <div class="w-8 h-8 rounded bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600 dark:text-blue-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div class="flex flex-col overflow-hidden">
                  <span class="text-xs font-medium truncate">项目计划书.docx</span>
                  <span class="text-[10px] opacity-50">2小时前打开过</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部电源栏 -->
<!--        <div class="p-4 px-8 flex items-center justify-between bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/10">-->
<!--          <div class="flex items-center gap-4">-->
<!--            <button @click="lockUser" class="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 transition-opacity">-->
<!--              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>-->
<!--              锁定-->
<!--            </button>-->
<!--          </div>-->
<!--          <button @click="logout" class="p-2 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 rounded-lg transition-all">-->
<!--            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/></svg>-->
<!--          </button>-->
<!--        </div>-->
      </div>
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { appStore } from '../stores/appStore.ts'
import { startTask } from '../stores/taskStore.ts'
import { userStore } from '../stores/userStore.ts'
import logo from '../assets/vue.svg'
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
  userStore.user.locked = true
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
/* 这里仅保留阴影和动画相关的样式，基础颜色和背景已迁移至 Tailwind Class */
.start-menu-panel {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

:global(.dark) .start-menu-panel {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}

/* 进场和出场动画 */
.start-menu-slide-enter-active,
.start-menu-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.start-menu-slide-enter-from,
.start-menu-slide-leave-to {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}
</style>
