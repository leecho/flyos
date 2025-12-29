<script setup>
import { ref, onMounted } from 'vue';

// 系统基本信息配置
const systemInfo = {
  osName: "WebOS Pro",
  version: "2024.12 (Build 29.0)",
  kernel: "WebKernel 5.4.0-stable",
  experience: "Fluid UI v2.5",
  owner: "管理员用户"
};

// 硬件摘要
const deviceSpecs = [
  { label: "处理器", value: "Virtual Eight-Core vCPU @ 3.2GHz", icon: "🔳" },
  { label: "已安装内存", value: "32.0 GB (31.8 GB 可用)", icon: "🧠" },
  { label: "系统类型", value: "64 位操作系统, 基于 x64 的处理器", icon: "💿" },
  { label: "设备名称", value: "WEBOS-DESKTOP-R7J2", icon: "💻" }
];

// 运行状态
const uptime = ref("00:00:00");
const startTime = Date.now();

onMounted(() => {
  setInterval(() => {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    uptime.value = `${h}:${m}:${s}`;
  }, 1000);
});
</script>

<template>
  <div class="about-container h-full bg-[#f9f9f9] dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 overflow-y-auto custom-scrollbar select-none">

    <!-- 顶部 Banner -->
    <div class="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center px-8 overflow-hidden">
      <div class="absolute right-[-20px] top-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute left-1/3 bottom-[-10px] w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>

      <div class="flex items-center gap-5 z-10">
        <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">{{ systemInfo.osName }}</h1>
          <p class="text-blue-100 text-xs opacity-80">版本 {{ systemInfo.version }}</p>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- 设备规格部分 -->
      <section>
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">设备规格</h3>
        <div class="grid grid-cols-1 gap-2">
          <div v-for="spec in deviceSpecs" :key="spec.label"
               class="flex items-center gap-4 p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
            <div class="text-xl w-8 text-center">{{ spec.icon }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-slate-400 font-medium">{{ spec.label }}</p>
              <p class="text-sm font-semibold truncate">{{ spec.value }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 系统状态信息 -->
      <section class="grid grid-cols-2 gap-3">
        <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
          <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">运行时间</p>
          <p class="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-300">{{ uptime }}</p>
        </div>
        <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
          <p class="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">当前用户</p>
          <p class="text-xl font-bold text-blue-700 dark:text-blue-300">{{ systemInfo.owner }}</p>
        </div>
      </section>

      <!-- 软件规范部分 -->
      <section>
        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">软件规范</h3>
        <div class="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden text-sm">
          <div class="p-4 flex justify-between border-b border-slate-100 dark:border-white/5">
            <span class="opacity-60">内核版本</span>
            <span class="font-medium">{{ systemInfo.kernel }}</span>
          </div>
          <div class="p-4 flex justify-between border-b border-slate-100 dark:border-white/5">
            <span class="opacity-60">界面体验</span>
            <span class="font-medium">{{ systemInfo.experience }}</span>
          </div>
          <div class="p-4 flex justify-between">
            <span class="opacity-60">授权状态</span>
            <span class="text-emerald-500 font-bold flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              已激活
            </span>
          </div>
        </div>
      </section>

      <!-- 版权页脚 -->
      <footer class="pt-4 pb-8 text-center space-y-2">
        <p class="text-[10px] opacity-40 leading-relaxed">
          &copy; 2024 WebOS International Corporation. 保留所有权利。<br>
          本系统受国际版权法及相关法律保护。
        </p>
        <div class="flex justify-center gap-4 text-[10px] font-bold text-blue-500 opacity-60">
          <a href="#" class="hover:underline">服务协议</a>
          <a href="#" class="hover:underline">隐私策略</a>
          <a href="#" class="hover:underline">更新日志</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.2);
  border-radius: 10px;
}
</style>
