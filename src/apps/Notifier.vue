<script setup lang="ts">
import { computed } from 'vue';
import { messageBox } from '@/composables/useMessage';
import { useNotification } from '@/composables/useNotification';

/**
 * 核心逻辑初始化
 */
const { notifications, push, remove, clearAll } = useNotification();

// 操作函数
const handleAlert = () => {
  messageBox.alert('当前系统环境运行良好，未检测到异常。', '状态自检');
};

const handleConfirm = async () => {
  const ok = await messageBox.confirm('是否初始化系统配置？此操作将重置所有个性化设置。', '初始化确认');
  if (ok) {
    push({
      title: '系统重置',
      content: '个性化设置已恢复至出厂默认值。',
      type: 'warning',
      appName: '系统设置'
    });
  }
};

const handlePrompt = async () => {
  const result = await messageBox.prompt('请输入新的网络 SSID：', 'FlyOS-Router', '网络管理');
  if (result) {
    push({
      title: 'SSID 已变更',
      content: `无线网络名称已更新为 "${result}"。`,
      type: 'success',
      appName: '网络中心'
    });
  }
};

const quickNotify = (type: 'info' | 'success' | 'warning' | 'error') => {
  const types = {
    info: { title: '系统更新', content: '发现新版本 v2.4.0，包含多项性能优化。' },
    success: { title: '同步成功', content: '云端数据已同步至本地存储。' },
    warning: { title: '存储不足', content: '系统盘空间剩余不足 10%，请清理。' },
    error: { title: '连接失败', content: '远程服务器响应超时，请检查网络。' }
  };
  push({ ...types[type], type, appName: '核心系统' });
};

// 图标资源
const icons = {
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.35 13.5a2.4 2.4 0 0 0 4.3 0"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z\"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`
};
</script>

<template>
  <div class="flex h-screen w-full bg-[#f1f3f9] dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 transition-colors duration-500 overflow-hidden font-sans">

    <!-- 左侧导航控制台 (Sidebar) -->
    <aside class="w-80 h-full p-6 flex flex-col gap-6 bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 shrink-0">
      <div class="flex items-center gap-3 px-2">
        <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <div class="w-6 h-6" v-html="icons.shield"></div>
        </div>
        <div>
          <h2 class="font-black text-lg leading-none tracking-tight">控制中心</h2>
          <span class="text-[10px] uppercase tracking-widest opacity-40 font-bold">FlyOS Management</span>
        </div>
      </div>

      <!-- 快捷操作区 -->
      <nav class="flex-1 space-y-2 py-4">
        <p class="text-[10px] font-bold uppercase text-slate-400 px-2 mb-4 tracking-widest">交互调试</p>
        <button @click="handleAlert" class="nav-item">
          <div class="icon-box bg-blue-500/10 text-blue-600"><div class="w-4 h-4" v-html="icons.info"></div></div>
          <span>普通弹窗</span>
        </button>
        <button @click="handleConfirm" class="nav-item">
          <div class="icon-box bg-rose-500/10 text-rose-600"><div class="w-4 h-4" v-html="icons.shield"></div></div>
          <span>确认操作</span>
        </button>
        <button @click="handlePrompt" class="nav-item">
          <div class="icon-box bg-amber-500/10 text-amber-600"><div class="w-4 h-4" v-html="icons.settings"></div></div>
          <span>数据录入</span>
        </button>

        <p class="text-[10px] font-bold uppercase text-slate-400 px-2 mt-8 mb-4 tracking-widest">快速推送</p>
        <div class="grid grid-cols-2 gap-2">
          <button @click="quickNotify('success')" class="quick-notif-btn hover:bg-emerald-500 hover:text-white">成功</button>
          <button @click="quickNotify('error')" class="quick-notif-btn hover:bg-rose-500 hover:text-white">错误</button>
          <button @click="quickNotify('warning')" class="quick-notif-btn hover:bg-amber-500 hover:text-white">警报</button>
          <button @click="quickNotify('info')" class="quick-notif-btn hover:bg-blue-500 hover:text-white">信息</button>
        </div>
      </nav>

      <!-- 底部统计 -->
<!--      <div class="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-500/20">-->
<!--        <div class="flex items-center justify-between mb-2">-->
<!--          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center" v-html="icons.bell"></div>-->
<!--          <span class="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">ACTIVE</span>-->
<!--        </div>-->
<!--        <p class="text-xs opacity-70">积压通知</p>-->
<!--        <p class="text-3xl font-black tabular-nums">{{ notifications.length }}</p>-->
<!--      </div>-->
    </aside>

    <!-- 右侧内容区 (Content Stream) -->
    <main class="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-black/20">
      <!-- 顶部条 -->
      <header class="h-20 flex items-center justify-between px-10 shrink-0">
        <h3 class="font-bold text-xl">实时通知流水<span class="bg-indigo-600 font-bold tabular-nums ml-1  shadow-xl shadow-indigo-500/20 text-white px-2 py-0.5 rounded-full">{{notifications.length}}</span></h3>
        <button @click="clearAll" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold">
          <div class="w-4 h-4" v-html="icons.trash"></div>
          清空队列
        </button>
      </header>

      <!-- 滚动区域 -->
      <div class="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
        <div v-if="notifications.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div class="w-16 h-16 opacity-10" v-html="icons.bell"></div>
          <p class="text-sm font-medium">暂无系统消息，一切运行正常</p>
        </div>

        <TransitionGroup name="list" tag="div" class="space-y-4 max-w-4xl mx-auto">
          <div v-for="item in notifications" :key="item.id" class="notif-card group">
            <!-- 类型指示器线 -->
            <div :class="[
              'w-1.5 h-12 rounded-full mr-1',
              item.type === 'success' ? 'bg-emerald-500' :
              item.type === 'error' ? 'bg-rose-500' :
              item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
            ]"></div>

            <div class="flex-1 px-4 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] font-black uppercase tracking-tighter text-indigo-600 dark:text-indigo-400">{{ item.appName }}</span>
                <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                <span class="text-[10px] font-medium opacity-40">{{ item.time }}</span>
              </div>
              <h4 class="font-bold text-base truncate">{{ item.title }}</h4>
              <p class="text-sm opacity-60 line-clamp-2 mt-0.5 leading-relaxed">{{ item.content }}</p>
            </div>

            <button @click="remove(item.id)" class="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-400 hover:text-rose-500">
              <div class="w-5 h-5" v-html="icons.trash"></div>
            </button>
          </div>
        </TransitionGroup>
      </div>
    </main>
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.nav-item {
  @apply w-full flex items-center gap-4 px-3 py-3 rounded-2xl transition-all text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white hover:shadow-sm;
}

.icon-box {
  @apply w-9 h-9 rounded-xl flex items-center justify-center shrink-0;
}

.quick-notif-btn {
  @apply py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-black transition-all active:scale-95;
}

.notif-card {
  @apply flex items-center p-6 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300;
}

/* 列表动画：更优雅的滑入 */
.list-enter-active, .list-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
.list-move {
  transition: transform 0.5s ease;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-white/10 rounded-full;
}
</style>
