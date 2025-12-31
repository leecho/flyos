<script setup>
import { ref, computed } from 'vue';

const activeTabId = ref(1);
const tabs = ref([
  {
    id: 1,
    title: '新标签页',
    urlInput: '',
    currentUrl: '',
    loading: false,
    favicon: ''
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
    loading: false,
    favicon: ''
  });
  activeTabId.value = newId;
};

const closeTab = (index) => {
  if (tabs.value.length === 1) {
    tabs.value[0] = { id: Date.now(), title: '新标签页', urlInput: '', currentUrl: '', loading: false, favicon: '' };
    activeTabId.value = tabs.value[0].id;
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
  activeTab.value.favicon = `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
};

const quickGo = (url) => {
  activeTab.value.urlInput = url;
  navigateToUrl();
};

const refreshTab = () => {
  if (activeTab.value.currentUrl) {
    const url = activeTab.value.currentUrl;
    activeTab.value.currentUrl = '';
    activeTab.value.loading = true;
    setTimeout(() => {
      activeTab.value.currentUrl = url;
    }, 50);
  }
};
</script>

<template>
  <div class="flex flex-col h-full bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl text-gray-900 dark:text-gray-100 font-sans overflow-hidden">

    <!-- Tab Bar -->
    <div class="flex items-center pl-3 pr-1 h-12 bg-gray-100/30 dark:bg-gray-900/30 border-b border-gray-200/80 dark:border-gray-800/80 no-scrollbar overflow-x-auto">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.id"
        @click="activeTabId = tab.id"
        :class="[
          'group relative flex items-center justify-between w-56 h-full p-3 text-sm cursor-pointer border-r border-gray-200/80 dark:border-gray-800/80 transition-all duration-200',
          activeTabId === tab.id
            ? 'bg-white/40 dark:bg-white/5 shadow-inner-top'
            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
        ]"
      >
        <div class="flex items-center gap-2 min-w-0">
            <img v-if="tab.favicon" :src="tab.favicon" class="w-4 h-4" alt="favicon"/>
            <span v-else class="w-4 h-4 text-gray-500">🌐</span>
            <span class="truncate">{{ tab.title || '新标签页' }}</span>
        </div>
        <button
          @click.stop="closeTab(index)"
          class="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <div v-if="activeTabId === tab.id" class="absolute bottom-0 left-0 w-full h-0.5 bg-accent"></div>
      </div>
      <button @click="addTab" class="p-2 ml-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    </div>

    <!-- Navigation Bar -->
    <div class="flex items-center gap-2 px-4 h-14 bg-white/40 dark:bg-white/5 shadow-inner-top">
      <div class="flex gap-1">
        <button class="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 text-gray-700 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button class="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 text-gray-700 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <button @click="refreshTab" class="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6.49 4.36L2 9"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 14.51 7.64L22 15"/></svg>
        </button>
      </div>

      <div class="flex-1 relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <input
          v-model="activeTab.urlInput"
          @keyup.enter="navigateToUrl"
          class="w-full h-10 bg-black/5 dark:bg-black/20 border-2 border-transparent rounded-xl pl-10 pr-4 text-sm outline-none focus:border-accent transition-all"
          placeholder="搜索或输入网址"
        />
        <div v-if="activeTab.loading" class="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/30 overflow-hidden rounded-full">
          <div class="h-full bg-accent animate-progress"></div>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 bg-white dark:bg-gray-900 relative">
      <template v-for="tab in tabs" :key="tab.id">
        <div v-show="activeTabId === tab.id" class="w-full h-full">
          
          <!-- New Tab Page -->
          <div v-if="!tab.currentUrl" class="h-full flex flex-col items-center justify-center p-6">
            <div class="w-full max-w-2xl text-center">
              <h1 class="text-6xl font-black text-gray-300 dark:text-gray-700 mb-12">Fly<span class="text-accent">.</span></h1>
              <div class="grid grid-cols-4 sm:grid-cols-6 gap-6">
                 <div v-for="site in quickLinks" :key="site.name" @click="quickGo(site.url)" class="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                   <div class="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700/50 text-2xl flex items-center justify-center mb-2 mx-auto">{{ site.icon }}</div>
                   <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{{ site.name }}</p>
                 </div>
                 <div class="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-white/10 flex flex-col justify-center items-center cursor-pointer">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 mb-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                   <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">添加</p>
                 </div>
              </div>
            </div>
          </div>

          <!-- Web Content -->
          <div v-else class="w-full h-full relative">
            <iframe
              :src="tab.currentUrl"
              class="w-full h-full border-none"
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation"
              @load="tab.loading = false"
            ></iframe>
            <div v-if="tab.loading" class="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
               <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                <p class="text-sm text-gray-500">正在加载安全页面...</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.shadow-inner-top {
  box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

@keyframes progress {
  0% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

.animate-progress {
  transform-origin: left;
  animation: progress 1.5s ease-out infinite;
}
</style>