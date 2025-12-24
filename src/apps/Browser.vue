<template>
  <div class="flex flex-col h-full bg-[#f3f3f3] dark:bg-[#2b2b2b] text-slate-700 dark:text-slate-200 overflow-hidden font-sans">

    <!-- 1. 标签栏 (Tab Bar) -->
    <div class="flex items-end px-2 pt-2 bg-[#dee1e6] dark:bg-[#1a1a1a] h-10 overflow-x-auto no-scrollbar gap-1">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id"
        @click="activeTabId = tab.id"
        :class="[
          'group relative flex items-center min-w-[120px] max-w-[200px] h-8 px-3 rounded-t-lg text-xs cursor-default transition-all duration-150',
          activeTabId === tab.id
            ? 'bg-[#f3f3f3] dark:bg-[#2b2b2b] text-blue-600 dark:text-blue-400 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]'
            : 'hover:bg-[#e8eaed] dark:hover:bg-[#333] text-gray-500'
        ]"
      >
        <span class="truncate pr-4 flex-1">{{ tab.title || '新标签页' }}</span>
        <button
          @click.stop="closeTab(index)"
          class="absolute right-1 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <button
        @click="addTab"
        class="mb-1 p-1.5 rounded-full hover:bg-[#e8eaed] dark:hover:bg-[#333] text-gray-600 dark:text-gray-400 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    </div>

    <!-- 2. 工具栏 (Navigation Bar) -->
    <div class="flex items-center gap-3 px-3 py-1.5 bg-[#f3f3f3] dark:bg-[#2b2b2b] border-b border-gray-300 dark:border-gray-800">
      <div class="flex gap-1">
        <button class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <button @click="refreshTab" class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
        </button>
      </div>

      <!-- 地址栏 -->
      <div class="flex-1 relative group">
        <div class="flex items-center gap-2 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-full px-4 h-8 transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input
            v-model="activeTab.urlInput"
            @keyup.enter="navigateToUrl"
            class="flex-1 bg-transparent border-none outline-none text-sm"
            placeholder="搜索或输入 Web 地址"
          />
        </div>
        <!-- 加载进度条动画 -->
        <div v-if="activeTab.loading" class="absolute bottom-0 left-4 right-4 h-0.5 bg-transparent overflow-hidden">
          <div class="h-full bg-blue-500 animate-progress origin-left"></div>
        </div>
      </div>

      <div class="flex gap-1 items-center">
        <button class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        <button class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>
    </div>

    <!-- 3. 内容区 (Content Area) -->
    <div class="flex-1 bg-white dark:bg-[#1a1a1a] relative">
      <template v-for="tab in tabs" :key="tab.id">
        <div v-show="activeTabId === tab.id" class="w-full h-full">
          <!-- 首页/新标签页视图 -->
          <div v-if="!tab.currentUrl" class="h-full flex flex-col items-center pt-20 px-6 bg-gradient-to-b from-[#f0f4f8] to-white dark:from-[#202020] dark:to-[#1a1a1a]">
            <div class="mb-8 flex items-center gap-3">
              <div class="w-16 h-16 bg-gradient-to-tr from-blue-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-10 h-10"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h1 class="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">Microsoft Edge</h1>
            </div>

            <!-- NTP 搜索框 -->
            <div class="w-full max-w-2xl relative mb-12">
              <input
                v-model="tab.urlInput"
                @keyup.enter="navigateToUrl"
                class="w-full h-14 pl-14 pr-6 rounded-full shadow-xl border-none outline-none text-lg bg-white dark:bg-[#333] focus:ring-4 focus:ring-blue-500/20 transition-all"
                placeholder="搜索 Web"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-5 top-4 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>

            <!-- 快捷方式网格 -->
            <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-6 max-w-3xl">
              <div v-for="site in quickLinks" :key="site.name" @click="quickGo(site.url)" class="flex flex-col items-center gap-2 cursor-pointer group">
                <div class="w-12 h-12 rounded-xl bg-white dark:bg-[#333] shadow-md flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-1 transition-all">
                  <span class="text-xl">{{ site.icon }}</span>
                </div>
                <span class="text-[11px] text-gray-600 dark:text-gray-400">{{ site.name }}</span>
              </div>
              <div class="flex flex-col items-center gap-2 cursor-pointer group">
                <div class="w-12 h-12 rounded-xl bg-white/50 dark:bg-[#333]/50 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </div>
                <span class="text-[11px] text-gray-600 dark:text-gray-400">添加</span>
              </div>
            </div>
          </div>

          <!-- Web 内容视图 -->
          <div v-else class="w-full h-full relative">
            <iframe
              :src="tab.currentUrl"
              class="w-full h-full border-none"
              @load="tab.loading = false"
            ></iframe>
            <!-- Iframe 提示遮罩（针对无法在 iframe 渲染的网站） -->
            <div v-if="tab.loading" class="absolute inset-0 bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
              <div class="flex flex-col items-center gap-4">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm text-gray-500">正在连接至安全网站...</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 4. 底部状态栏 -->
    <div class="h-6 px-3 bg-[#f3f3f3] dark:bg-[#2b2b2b] border-t border-gray-300 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-500">
      <div class="flex gap-3">
        <span>就绪</span>
      </div>
      <div class="flex gap-3">
        <span>100%</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';

const activeTabId = ref(1);
const tabs = ref([
  {
    id: 1,
    title: '新标签页',
    urlInput: '',
    currentUrl: '',
    loading: false
  }
]);

const activeTab = computed(() => {
  return tabs.value.find(t => t.id === activeTabId.value) || tabs.value[0];
});

const quickLinks = [
  { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { name: 'Vue.js', url: 'https://vuejs.org', icon: '🟢' },
  { name: 'Baidu', url: 'https://www.baidu.com', icon: '🐾' },
  { name: 'Bing', url: 'https://www.bing.com', icon: '🔍' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '📺' },
  { name: 'Canva', url: 'https://www.canva.com', icon: '🎨' },
];

const addTab = () => {
  const newId = Date.now();
  tabs.value.push({
    id: newId,
    title: '新标签页',
    urlInput: '',
    currentUrl: '',
    loading: false
  });
  activeTabId.value = newId;
};

const closeTab = (index) => {
  if (tabs.value.length === 1) {
    tabs.value[0] = { id: Date.now(), title: '新标签页', urlInput: '', currentUrl: '', loading: false };
    return;
  }
  const closedId = tabs.value[index].id;
  tabs.value.splice(index, 1);
  if (activeTabId.value === closedId) {
    activeTabId.value = tabs.value[Math.max(0, index - 1)].id;
  }
};

const navigateToUrl = () => {
  let url = activeTab.value.urlInput.trim();
  if (!url) return;

  // 简单的 URL 处理逻辑
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.') && !url.includes(' ')) {
      url = 'https://' + url;
    } else {
      url = `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
    }
  }

  activeTab.value.loading = true;
  activeTab.value.currentUrl = url;
  activeTab.value.title = url.replace('https://', '').replace('www.', '').split('/')[0];
};

const quickGo = (url) => {
  activeTab.value.urlInput = url;
  navigateToUrl();
};

const refreshTab = () => {
  if (activeTab.value.currentUrl) {
    const url = activeTab.value.currentUrl;
    activeTab.value.currentUrl = '';
    setTimeout(() => {
      activeTab.value.currentUrl = url;
      activeTab.value.loading = true;
    }, 50);
  }
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes progress {
  0% { transform: scaleX(0); }
  50% { transform: scaleX(0.7); }
  100% { transform: scaleX(0.9); }
}

.animate-progress {
  animation: progress 2s ease-out infinite;
}

/* 模拟输入框焦点样式 */
input:focus {
  outline: none;
}
</style>
