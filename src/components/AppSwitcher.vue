<template>
  <Transition name="fade">
    <div 
      v-if="uiStore.switcherVisible" 
      class="app-switcher fixed inset-0 z-[999998] flex flex-col items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-3xl px-6 transition-colors duration-500"
      @click="toggleSwitcher"
    >
      <div 
        class="switcher-header w-full max-w-4xl flex justify-between items-center mb-8 px-2"
        @click.stop
      >
        <h2 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">最近任务</h2>
        <button 
          @click="minimizeAll"
          class="px-4 py-1.5 bg-gray-900/5 dark:bg-white/10 hover:bg-gray-900/10 dark:hover:bg-white/20 rounded-full text-xs font-bold text-gray-900 dark:text-white transition-all active:scale-95"
        >
          全部清除
        </button>
      </div>

      <div 
        class="switcher-content w-full flex gap-6 overflow-x-auto pb-12 pt-4 no-scrollbar items-center px-4"
        @click.stop
      >
        <div v-for="win in windowStore.windows" :key="win.id" class="task-card-wrapper shrink-0 group perspective-1000">
          <div 
            class="task-card w-48 sm:w-64 aspect-[3/4] bg-white/40 dark:bg-gray-800/50 rounded-[28px] border border-gray-900/5 dark:border-white/20 shadow-2xl relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 active:scale-95 cursor-pointer"
            @click="activateTask(win.id)"
          >
            <!-- 窗口预览图 -->
            <div class="flex-1 w-full bg-gray-100 dark:bg-gray-900 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
               <!-- 真实快照 -->
               <img 
                 v-if="win.preview" 
                 :src="win.preview" 
                 class="w-full h-full object-cover animate-in fade-in duration-500"
               />
               <!-- 占位模糊 (无快照时) -->
               <div v-else class="w-full h-full bg-gradient-to-br from-gray-900/5 to-transparent dark:from-white/5 dark:to-transparent flex items-center justify-center">
                 <AppIcon :id="win.appId" size="xl" rounded="lg" class="shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
               </div>
            </div>
            
            <!-- 卡片底部页脚 -->
            <div class="h-16 w-full px-5 flex items-center gap-3 bg-white/30 dark:bg-black/20 backdrop-blur-md">
              <AppIcon :id="win.appId" size="mini" rounded="sm" />
              <p class="text-sm font-bold truncate text-gray-900 dark:text-white/90">{{ win.title }}</p>
              
              <!-- 关闭按钮 -->
              <button 
                @click.stop="closeTask(win.appId)"
                class="ml-auto p-2 bg-gray-900/5 dark:bg-white/5 hover:bg-red-500/80 rounded-full transition-all group-hover:scale-110"
              >
                <X :size="14" class="text-gray-900 dark:text-white" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="windowStore.windows.length === 0" class="w-full text-center py-20 text-gray-400 dark:text-white/40 italic font-bold">
          暂无运行中的任务
        </div>
      </div>

      <!-- 提示文字 -->
      <div class="mt-4 text-gray-900/30 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
        选择应用切换或上划关闭
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { uiStore, toggleSwitcher } from '../stores/uiStore'
import { windowStore, toggleActive, minimizeAll } from '../stores/windowStore'
import { stopTask } from '../stores/taskStore'
import AppIcon from './AppIcon.vue'
import { X } from 'lucide-vue-next'

const activateTask = (id: string) => {
  toggleActive(id)
  toggleSwitcher()
}

const closeTask = (appId: string) => {
  stopTask(appId)
}
</script>

<style scoped>
.app-switcher {
  user-select: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.perspective-1000 {
  perspective: 1000px;
}

.task-card-wrapper:nth-child(1) { transition-delay: 0.05s; }
.task-card-wrapper:nth-child(2) { transition-delay: 0.1s; }
.task-card-wrapper:nth-child(3) { transition-delay: 0.15s; }

.task-card {
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.35);
}
</style>
