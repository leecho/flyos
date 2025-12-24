<script setup>
import { onMounted, computed } from 'vue';
import { messageBox } from '@/composables/useMessage';
import { useNotification } from '@/composables/useNotification';

// 初始化通知中心逻辑
const { notifications, push, remove, clearAll } = useNotification();

// --- 实用工具与状态 ---
const notificationCount = computed(() => notifications.value.length);

// --- 业务操作 ---
const triggerAlert = () => {
  messageBox.alert('欢迎使用 FlyOS 系统，这是一个全局的消息警报示例。', '系统安全提示');
};

const triggerConfirm = async () => {
  const confirmed = await messageBox.confirm('您确定要执行深度清理吗？此操作不可逆。', '危险操作确认');
  if (confirmed) {
    clearAll();
    push({
      title: '清理成功',
      content: '所有通知历史记录已被物理清除。',
      type: 'success',
      appName: '磁盘管理'
    });
  }
};

const triggerPrompt = async () => {
  const name = await messageBox.prompt('请输入您在 FlyOS 中的新代号：', 'Administrator', '身份识别');
  if (name) {
    push({
      title: '身份已更新',
      content: `很高兴见到你，${name}。系统已为您分配了新的访问权限。`,
      type: 'info',
      appName: '身份中心'
    });
  }
};

const sendRandomNotification = () => {
  const configs = [
    { title: '安全威胁已解除', content: '防火墙已成功拦截来自 192.168.1.1 的异常请求。', type: 'success', appName: '安全中心' },
    { title: '云端同步异常', content: '由于网络连接波动，您的文档尚未同步到云端。', type: 'warning', appName: '云空间' },
    { title: '核心更新可用', content: 'FlyOS v2.4.0 版本已准备就绪，请选择合适时间安装。', type: 'info', appName: '系统更新' },
    { title: '存储空间不足', content: '系统分区可用容量不足 500MB，请立即清理。', type: 'error', appName: '内核' }
  ];
  const item = configs[Math.floor(Math.random() * configs.length)];
  push(item);
};

onMounted(() => {
  setTimeout(() => {
    push({ title: '系统就绪', content: '已成功集成外部 Message 与 Notification 组件。', type: 'success', appName: '系统总线' });
  }, 500);
});

// --- 图标定义 ---
const icons = {
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
};
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 sm:p-8 md:p-12">
    <!-- 背景修饰 -->
    <div class="fixed top-0 left-1/4 w-96 h-96 bg-indigo-200/40 blur-[120px] rounded-full -z-10"></div>
    <div class="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 blur-[120px] rounded-full -z-10"></div>

    <div class="max-w-6xl mx-auto">
      <!-- 头部设计 -->
      <header class="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm mb-2">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Composables Active</span>
          </div>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">控制台中心</h1>
          <p class="text-slate-500 font-medium">集成自 <code class="text-indigo-600 bg-indigo-50 px-1 rounded">@/composables</code> 的统一通知架构</p>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto">
          <button @click="sendRandomNotification" class="flex-1 md:flex-none h-12 px-6 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all active:scale-95 group">
            <div class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" v-html="icons.plus"></div>
            推送通知
          </button>
          <button @click="triggerConfirm" class="h-12 w-12 flex items-center justify-center rounded-2xl border-2 border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all active:scale-95" title="清空所有通知">
            <div class="w-5 h-5" v-html="icons.trash"></div>
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- 侧边交互区 -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-white/80 backdrop-blur-md border border-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">MessageBox API 演示</h3>
            <div class="space-y-3">
              <button @click="triggerAlert" class="action-card group">
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <div class="w-5 h-5" v-html="icons.alert"></div>
                </div>
                <div class="flex-1 text-left">
                  <p class="font-bold text-slate-700">警告对话框</p>
                  <p class="text-[10px] text-slate-400 font-mono">.alert()</p>
                </div>
              </button>
              <button @click="triggerConfirm" class="action-card group">
                <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <div class="w-5 h-5" v-html="icons.check"></div>
                </div>
                <div class="flex-1 text-left">
                  <p class="font-bold text-slate-700">二次确认</p>
                  <p class="text-[10px] text-slate-400 font-mono">.confirm()</p>
                </div>
              </button>
              <button @click="triggerPrompt" class="action-card group">
                <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <div class="w-5 h-5" v-html="icons.plus"></div>
                </div>
                <div class="flex-1 text-left">
                  <p class="font-bold text-slate-700">数据录入</p>
                  <p class="text-[10px] text-slate-400 font-mono">.prompt()</p>
                </div>
              </button>
            </div>
          </div>

          <div class="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 overflow-hidden relative group">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div class="relative z-10">
              <h4 class="text-lg font-bold mb-2 tracking-tight">实时数据通道</h4>
              <p class="text-indigo-100/70 text-sm leading-relaxed mb-6 font-medium">
                所有通知项均通过 <code class="bg-indigo-500/50 px-1 rounded">onSnapshot</code> 或内部 Reactive 状态同步，保证多端 UI 响应。
              </p>
              <div class="flex items-center gap-4">
                <div class="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold uppercase tracking-wider">
                  {{ notificationCount }} 条未读消息
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 通知展示主区 -->
        <div class="lg:col-span-8">
          <div class="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 flex flex-col min-h-[600px] overflow-hidden">
            <div class="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
              <h2 class="text-xl font-black text-slate-800 tracking-tight">消息流</h2>
              <div v-html="icons.bell" class="w-5 h-5 text-slate-300"></div>
            </div>

            <div class="flex-1 p-6 relative">
              <TransitionGroup name="list" tag="div" class="space-y-4">
                <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  class="notif-item group"
                  :class="[
                    notif.type === 'success' ? 'border-emerald-100 bg-emerald-50/20' :
                    notif.type === 'error' ? 'border-rose-100 bg-rose-50/20' :
                    notif.type === 'warning' ? 'border-amber-100 bg-amber-50/20' : 'border-slate-100 bg-white'
                  ]"
                >
                  <div class="shrink-0 w-1.5 self-stretch rounded-full"
                       :class="[
                      notif.type === 'success' ? 'bg-emerald-400' :
                      notif.type === 'error' ? 'bg-rose-400' :
                      notif.type === 'warning' ? 'bg-amber-400' : 'bg-indigo-400'
                    ]"
                  ></div>

                  <div class="flex-1 py-1">
                    <div class="flex items-center justify-between mb-1.5">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ notif.appName || '系统' }}</span>
                        <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span class="text-[10px] font-medium text-slate-400">{{ notif.time }}</span>
                      </div>
                      <button @click="remove(notif.id)" class="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500 p-1">
                        <div class="w-4 h-4" v-html="icons.trash"></div>
                      </button>
                    </div>
                    <h5 class="text-sm font-bold text-slate-800 mb-1">{{ notif.title }}</h5>
                    <p class="text-sm text-slate-500 leading-relaxed font-medium">{{ notif.content }}</p>
                  </div>
                </div>
              </TransitionGroup>

              <div v-if="notifications.length === 0" class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                  <div class="w-10 h-10" v-html="icons.bell"></div>
                </div>
                <p class="text-slate-400 font-bold tracking-tight">暂无任何系统通知</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.action-card {
  @apply w-full p-4 bg-white border border-slate-100 rounded-[1.5rem] flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-slate-100 hover:border-transparent active:scale-[0.98];
}

.notif-item {
  @apply flex items-center gap-4 p-5 border rounded-[1.75rem] transition-all hover:shadow-md hover:shadow-slate-100;
}

/* 列表动画 */
.list-enter-active, .list-leave-active {
  transition: all 0.5s cubic-bezier(0.2, 1, 0.3, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.95);
}
.list-move {
  transition: transform 0.4s ease;
}

/* 对话框动画 */
.dialog-enter-active, .dialog-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dialog-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
