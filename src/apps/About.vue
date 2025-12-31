<script setup>
import { ref, onMounted } from 'vue';

const systemInfo = {
  osName: "FlyOS Pro",
  version: "2024.12 (Build 29.0)",
  kernel: "WebKernel 5.4.0-stable",
  experience: "Fluid UI v2.5",
  owner: "管理员用户"
};

const deviceSpecs = [
  { label: "处理器", value: "Virtual Eight-Core vCPU @ 3.2GHz" },
  { label: "已安装内存", value: "32.0 GB (31.8 GB 可用)" },
  { label: "系统类型", value: "64 位操作系统, 基于 x64 的处理器" },
  { label: "设备名称", value: "WEBOS-DESKTOP-R7J2" }
];

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
  <div class="h-full bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl text-gray-900 dark:text-gray-100 font-sans overflow-y-auto custom-scrollbar">

    <!-- Header -->
    <div class="p-8 pb-4">
      <h1 class="text-4xl font-black tracking-tighter">{{ systemInfo.osName }}</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">版本 {{ systemInfo.version }}</p>
    </div>

    <div class="p-8 pt-4 space-y-8">
      
      <!-- Device Specs -->
      <section class="space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">设备规格</h2>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="spec in deviceSpecs" :key="spec.label"
               class="bg-white/40 dark:bg-white/5 rounded-2xl p-5 border border-white/20 dark:border-white/10 shadow-sm">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ spec.label }}</p>
            <p class="text-base font-bold text-gray-800 dark:text-gray-200">{{ spec.value }}</p>
          </div>
        </div>
      </section>

      <!-- System Status -->
      <section class="grid grid-cols-2 gap-4">
        <div class="bg-white/40 dark:bg-white/5 rounded-2xl p-5 border border-white/20 dark:border-white/10 shadow-sm text-center">
          <p class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">正常运行时间</p>
          <p class="text-2xl font-mono font-bold text-gray-800 dark:text-gray-200">{{ uptime }}</p>
        </div>
        <div class="bg-white/40 dark:bg-white/5 rounded-2xl p-5 border border-white/20 dark:border-white/10 shadow-sm text-center">
          <p class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">当前用户</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ systemInfo.owner }}</p>
        </div>
      </section>

      <!-- Software & Legal -->
      <section class="space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">软件与授权</h2>
        <div class="bg-white/40 dark:bg-white/5 rounded-2xl p-4 border border-white/20 dark:border-white/10 shadow-sm text-sm">
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">内核版本</p>
              <p class="font-medium text-gray-800 dark:text-gray-200">{{ systemInfo.kernel }}</p>
            </div>
            <div class="p-4 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">界面体验</p>
              <p class="font-medium text-gray-800 dark:text-gray-200">{{ systemInfo.experience }}</p>
            </div>
            <div class="col-span-2 p-4 rounded-lg bg-accent/10 text-center">
              <p class="font-bold text-accent flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                系统已激活
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Footer -->
      <footer class="pt-8 pb-4 text-center">
        <p class="text-xs text-gray-400 dark:text-gray-600">
          &copy; 2024 FlyOS Corporation. All rights reserved.
        </p>
        <div class="mt-2 flex justify-center gap-4 text-xs font-bold text-accent/80">
          <a href="#" class="hover:underline">服务条款</a>
          <a href="#" class="hover:underline">隐私政策</a>
          <a href="#" class="hover:underline">开源许可</a>
        </div>
      </footer>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(155, 155, 155, 0.2);
  border-radius: 10px;
}
</style>