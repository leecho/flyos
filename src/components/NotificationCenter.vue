<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotification } from '@/composables/useNotification';

// 初始化通知中心逻辑
const { notifications, push, remove, clearAll } = useNotification();

// 2. 侧边栏显示状态
const isOpen = ref(false);
const toggleOpen = () => (isOpen.value = !isOpen.value);

// 3. 模拟系统控制状态 (本地状态)
const dndMode = ref(false); // 勿扰模式
const brightness = ref(85);
const volume = ref(50);

// 4. 点击外部关闭逻辑
const centerRef = ref<HTMLElement | null>(null);
const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && centerRef.value && !centerRef.value.contains(event.target as Node)) {
    // isOpen.value = false
  }else{

  }
};

onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside);
});
onUnmounted(() => {
  window.removeEventListener('mousedown', handleClickOutside);
});

// 暴露接口给 TaskBar
defineExpose({ toggleOpen, isOpen });
</script>

<template>
  <teleport to='body'>
  <!-- 容器：动态平移进入 -->
  <aside
    ref="centerRef"
    class="fixed top-1 right-1 bottom-[50px] w-[380px] z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform pointer-events-none"
    :class="isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0'"
  >
    <!-- 毛玻璃本体 -->
    <div class="h-full w-full bg-white/70 dark:bg-slate-900/80 backdrop-blur-3xl shadow-2xl border border-white/40 dark:border-white/10 rounded-xl overflow-hidden flex flex-col pointer-events-auto">

      <!-- 头部：标题与清空 -->
      <header class="pt-8 px-8 pb-4 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-black tracking-tighter text-slate-800 dark:text-white">通知中心</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {{ notifications.length }} 条未读消息
          </p>
        </div>
        <button
          v-if="notifications.length > 0"
          @click="clearAll"
          class="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
        >
          全部清除
        </button>
      </header>

      <!-- 快捷功能区 (Control Center Tiles) -->
      <section class="px-8 py-4 grid grid-cols-2 gap-3">
        <!-- 勿扰模式 -->
        <button
          @click="dndMode = !dndMode"
          class="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group"
          :class="dndMode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'"
        >
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
          <div class="text-left">
            <div class="text-[11px] font-black uppercase tracking-tight leading-none mb-1">勿扰模式</div>
            <div class="text-[9px] font-bold opacity-60">{{ dndMode ? '已开启' : '已关闭' }}</div>
          </div>
        </button>

        <!-- Wi-Fi 状态模拟 -->
        <button class="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 group">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8.111 16.404a5.5 5.5 0 117.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <div class="text-left">
            <div class="text-[11px] font-black uppercase tracking-tight leading-none mb-1">Wi-Fi</div>
            <div class="text-[9px] font-bold opacity-60">FlyOS_5G</div>
          </div>
        </button>

        <!-- 亮度与音量调节 -->
        <div class="col-span-2 bg-slate-100 dark:bg-white/5 p-5 rounded-xl space-y-5">
          <div class="flex items-center gap-4">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <input type="range" v-model="brightness" class="system-slider" />
          </div>
          <div class="flex items-center gap-4">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
            <input type="range" v-model="volume" class="system-slider" />
          </div>
        </div>
      </section>

      <!-- 动态通知列表 (来自 useNotification) -->
      <div class="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
        <div class="space-y-3">
          <TransitionGroup name="list">
            <div
              v-for="notif in notifications"
              :key="notif.id"
              class="group relative bg-white/40 dark:bg-white/5 p-5 select-none rounded-xl border border-white dark:border-white/5 hover:border-indigo-500/50 transition-all duration-300"
            >
              <div class="flex justify-between items-start mb-2 ">
                <div class="flex items-center gap-2 ">
                  <span class="w-2 h-2 rounded-full ring-4  ring-opacity-20 shadow-[0_0_10px_rgba(0,0,0,0.1)]" :class="{
                    'bg-blue-500 ring-blue-500': notif.type === 'info',
                    'bg-emerald-500 ring-emerald-500': notif.type === 'success',
                    'bg-amber-500 ring-amber-500': notif.type === 'warning',
                    'bg-rose-500 ring-rose-500': notif.type === 'error'
                  }"></span>
                  <span class="text-[10px] font-black uppercase tracking-tighter text-slate-400">{{ notif.appName }}</span>
                </div>
                <span class="text-[10px] font-bold text-slate-300">{{ notif.time }}</span>
              </div>
              <h4 class="text-sm font-black text-slate-800 dark:text-white leading-none mb-2">{{ notif.title }}</h4>
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{{ notif.content }}</p>

              <!-- 删除按钮 -->
              <button
                @click="remove(notif.id)"
                class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-rose-500 hover:text-white"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </TransitionGroup>

          <!-- 空状态 -->
          <div v-if="notifications.length === 0" class="flex flex-col items-center justify-center py-20 grayscale opacity-20 select-none">
            <div class="w-20 h-20 bg-slate-400 rounded-full flex items-center justify-center mb-4">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 4-8-4" /></svg>
            </div>
            <span class="text-xs font-black uppercase tracking-[0.3em] text-slate-600">已处理所有通知</span>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
<!--      <footer class="p-8 grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-white/5">-->
<!--        <button class="flex flex-col items-center gap-2 group">-->
<!--          <div class="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">-->
<!--            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>-->
<!--          </div>-->
<!--          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">设置</span>-->
<!--        </button>-->
<!--        <button class="flex flex-col items-center gap-2 group">-->
<!--          <div class="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">-->
<!--            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>-->
<!--          </div>-->
<!--          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">锁定</span>-->
<!--        </button>-->
<!--        <button class="flex flex-col items-center gap-2 group">-->
<!--          <div class="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all text-rose-500">-->
<!--            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>-->
<!--          </div>-->
<!--          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">注销</span>-->
<!--        </button>-->
<!--      </footer>-->
    </div>
  </aside>
  </teleport>
</template>

<style scoped>
/* 滑块自定义 */
.system-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  outline: none;
  overflow: hidden;
}

.dark .system-slider {
  background: rgba(255, 255, 255, 0.05);
}

.system-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 0px;
  box-shadow: -100vw 0 0 100vw #6366f1;
}

/* 列表动画 */
.list-enter-active, .list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

/* 滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
