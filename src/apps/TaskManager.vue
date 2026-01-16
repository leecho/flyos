<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { taskStore, stopTask } from '../stores/taskStore.ts';
import { getAppById } from '@/stores/appStore';
import AppIcon from '../components/AppIcon.vue'
import { messageBox } from '../composables/useMessage.ts'

// 模拟历史数据用于绘图
const cpuHistory = ref(Array(20).fill(10));
const memHistory = ref(Array(20).fill(40));

const systemStats = ref({
  cpu: 12,
  mem: 42,
  uptime: '02:45:12'
});

// 模拟进程资源数据
const processData = ref<Record<string, { cpu: number; mem: number; status: string }>>({});

const runningTasks = computed(() => {
  const list = [];
  for (const [appId, winId] of taskStore.tasks.entries()) {
    const app = getAppById(appId);
    if (app) {
      if (!processData.value[appId]) {
        processData.value[appId] = {
          cpu: Math.random() * 5,
          mem: Math.random() * 200 + 50,
          status: 'Running'
        };
      }
      list.push({ ...app, winId, metrics: processData.value[appId] });
    }
  }
  return list;
});

// 模拟实时更新
let timer: any = null;
const refresh = () => {
  let totalCpu = 0;
  Object.keys(processData.value).forEach(id => {
    const delta = (Math.random() - 0.5) * 2;
    processData.value[id].cpu = Math.max(0.1, Number((processData.value[id].cpu + delta).toFixed(1)));
    totalCpu += processData.value[id].cpu;
  });

  const newCpu = Math.round(totalCpu + 5);
  systemStats.value.cpu = newCpu;
  cpuHistory.value.push(newCpu);
  cpuHistory.value.shift();

  const newMem = Math.round(40 + (totalCpu / 5));
  systemStats.value.mem = newMem;
  memHistory.value.push(newMem);
  memHistory.value.shift();
};

onMounted(() => { timer = setInterval(refresh, 1500); });
onUnmounted(() => { if (timer) clearInterval(timer); });


const terminateTask = async (e: Event, id: string) => {
  e.stopPropagation();
  const ok = await messageBox.confirm('确定要关闭应用？', '提示');
    if (ok) {
      stopTask(id);
    }
};

// SVG 曲线路径生成
const getPath = (data: number[]) => {
  const width = 100;
  const height = 30;
  const step = width / (data.length - 1);
  return data.map((val, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (val / 100 * height)}`).join(' ');
};
</script>

<template>
  <div class="h-full flex overflow-hidden bg-[#f8f9fa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans">

    <!-- 左侧监控边栏 -->
    

    <!-- 右侧进程列表 -->
    <main class="flex-1 flex flex-col min-w-0">
      <header class="h-16 flex items-center justify-between px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md">
        <div class="flex items-center gap-4">
          <h2 class="text-sm font-bold">进程列表</h2>
          <span class="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono">{{ runningTasks.length }} ACTIVE</span>
        </div>
        <div class="flex gap-2">
          <div class="h-8 w-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
            <svg class="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        <table class="w-full text-left border-separate border-spacing-y-1.5">
          <thead>
          <tr class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <th class="px-4 py-2 font-bold">名称</th>
            <th class="px-4 py-2 font-bold text-right">组件</th>
            <th class="px-4 py-2 font-bold text-right">内存使用</th>
            <th class="px-4 py-2 font-bold text-right">操作</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="task in runningTasks"
            :key="task.id"
            class="group hover:bg-white dark:hover:bg-zinc-900/60 transition-all duration-200"
          >
            <td class="px-4 py-3 rounded-l-xl border-y border-l border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-800">
              <div class="flex items-center gap-3">
                <AppIcon :id='task.id' size='sm' />
                <div class="flex flex-col">
                  <span class="text-xs font-bold">{{ task.name }}</span>
                  <span class="text-[10px] opacity-40 font-mono tracking-tighter">PID: {{ task.id }}</span>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right border-y border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-800">
              <span class="text-xs font-mono font-bold text-accent">{{ task.window.component }}.vue</span>
            </td>
            <td class="px-4 py-3 text-right border-y border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-800">
              <span class="text-xs font-mono opacity-60">{{ Math.round(task.metrics.mem) }} MB</span>
            </td>
            <td class="px-4 py-3 text-right rounded-r-xl border-y border-r border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-800">
              <button
                @click="terminateTask($event, task.id)"
                class="p-1.5 rounded-md hover:bg-rose-500/10 hover:text-rose-500 text-zinc-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </td>
          </tr>
          </tbody>
        </table>

        <!-- 无进程状态 -->
        <div v-if="runningTasks.length === 0" class="h-64 flex flex-col items-center justify-center opacity-20">
          <div class="w-12 h-12 mb-4 border-2 border-dashed border-zinc-400 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
          </div>
          <p class="text-xs font-bold uppercase tracking-widest">无活动进程</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
:deep(svg) {
  max-width: 100%;
  max-height: 100%;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(120, 120, 120, 0.1);
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
}

tr {
  cursor: default;
}

/* 简单的进入动画 */
tbody tr {
  animation: fadeIn 0.4s ease-out backwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(4px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
