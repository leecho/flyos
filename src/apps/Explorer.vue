<template>
  <div class="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 select-none font-sans overflow-hidden">
    <!-- 顶部工具栏 -->
    <div class="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
      <div class="flex gap-1">
        <button
          @click="goBack"
          :disabled="pathStack.length <= 1"
          class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-30 cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <!-- 地址栏 -->
      <div class="flex-1 flex items-center gap-1 px-2 py-1 bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 rounded text-sm overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 shrink-0"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 shrink-0"><path d="m9 18 6-6-6-6"/></svg>
        <div class="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <template v-for="(node, index) in pathStack" :key="index">
            <span
              @click="jumpToPath(index)"
              class="hover:bg-gray-200 dark:hover:bg-gray-700 px-1 rounded cursor-pointer transition-colors"
            >
              {{ node.name }}
            </span>
            <svg v-if="index < pathStack.length - 1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 shrink-0"><path d="m9 18 6-6-6-6"/></svg>
          </template>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="relative w-40 hidden md:block">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          placeholder="搜索"
          class="w-full pl-8 pr-2 py-1 bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-700 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- 侧边栏 -->
      <div class="w-48 border-r border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 p-2 overflow-y-auto hidden sm:block">
        <div class="space-y-4">
          <div>
            <h3 class="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">常用位置</h3>
            <div class="space-y-1">
              <div
                v-for="item in quickAccess"
                :key="item.id"
                @click="navigateTo(item.id)"
                :class="['flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors', currentFolderId === item.id ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-800']"
              >
                <component :is="item.icon" class="w-4 h-4" :class="item.color" />
                <span>{{ item.name }}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 class="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">此电脑</h3>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="20" height="8" x="2" y="4" rx="2"/><rect width="20" height="8" x="2" y="12" rx="2"/><line x1="6" x2="6.01" y1="8" y2="8"/><line x1="6" x2="6.01" y1="16" y2="16"/></svg>
              <span>本地磁盘 (C:)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-y-auto bg-white dark:bg-[#1a1a1a]">
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <div
            v-for="item in currentItems"
            :key="item.id"
            @click="selectedId = item.id"
            @dblclick="handleOpen(item)"
            :class="['flex flex-col items-center p-2 rounded group border border-transparent transition-all cursor-default', selectedId === item.id ? 'bg-blue-100/60 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800']"
          >
            <div class="w-12 h-12 mb-2 flex items-center justify-center relative">
              <component :is="getFileIcon(item)" class="w-10 h-10" :class="getFileIconColor(item)" />
            </div>
            <span class="text-xs text-center break-all line-clamp-2 w-full px-1">
              {{ item.name }}
            </span>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="w-full">
          <table class="w-full text-sm text-left">
            <thead class="sticky top-0 bg-white dark:bg-[#1a1a1a] text-[11px] text-gray-400 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th class="py-2 px-4 font-normal">名称</th>
              <th class="py-2 px-4 font-normal hidden md:table-cell">修改日期</th>
              <th class="py-2 px-4 font-normal hidden sm:table-cell">类型</th>
              <th class="py-2 px-4 font-normal text-right">大小</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="item in currentItems"
              :key="item.id"
              @click="selectedId = item.id"
              @dblclick="handleOpen(item)"
              :class="['group transition-colors border-b border-transparent', selectedId === item.id ? 'bg-blue-100/40 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
            >
              <td class="py-2 px-4 flex items-center gap-3">
                <component :is="getFileIcon(item)" class="w-4 h-4 shrink-0" :class="getFileIconColor(item)" />
                <span class="truncate">{{ item.name }}</span>
              </td>
              <td class="py-2 px-4 text-gray-400 text-xs hidden md:table-cell">{{ item.date }}</td>
              <td class="py-2 px-4 text-gray-400 text-xs hidden sm:table-cell">{{ item.type }}</td>
              <td class="py-2 px-4 text-right text-gray-400 text-xs">{{ item.isFolder ? '--' : item.size }}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- 空文件夹提示 -->
        <div v-if="currentItems.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><line x1="12" x2="12" y1="10" y2="16"/><line x1="9" x2="15" y1="13" y2="13"/></svg>
          <p class="text-sm italic">此文件夹为空</p>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="px-3 py-1 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-[11px] text-gray-500 bg-gray-50 dark:bg-gray-900">
      <div class="flex gap-4">
        <span>{{ currentItems.length }} 个项目</span>
        <span v-if="selectedItem" class="text-blue-500 font-medium">选中 1 个项目 ({{ selectedItem.size || '文件夹' }})</span>
      </div>
      <div class="flex gap-2">
        <button
          @click="viewMode = 'grid'"
          :class="['p-0.5 rounded transition-colors', viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-700 text-blue-500' : 'hover:bg-gray-200 dark:hover:bg-gray-700']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </button>
        <button
          @click="viewMode = 'list'"
          :class="['p-0.5 rounded transition-colors', viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-700 text-blue-500' : 'hover:bg-gray-200 dark:hover:bg-gray-700']"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 图标定义 (SVG 组件化)
const IconFolder = { template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 18c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h5l2 2h7c1.1 0 2 .9 2 2v9Z"/></svg>' };
const IconFile = { template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>' };
const IconImage = { template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>' };
const IconDesktop = { template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>' };
const IconDownload = { template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>' };

// 模拟文件系统数据
const fileSystem = {
  'desktop': {
    name: '桌面',
    children: [
      { id: 'f1', name: '项目报告.docx', type: 'Word 文档', date: '2023-10-15', size: '24 KB' },
      { id: 'f2', name: '财务预算.xlsx', type: 'Excel 表格', date: '2023-11-01', size: '1.2 MB' },
      { id: 'sub1', name: '个人文件夹', isFolder: true, date: '2023-12-01' }
    ]
  },
  'documents': {
    name: '文档',
    children: [
      { id: 'f3', name: '简历.pdf', type: 'PDF 文件', date: '2023-09-20', size: '450 KB' },
      { id: 'f4', name: '会议纪要.txt', type: '文本文件', date: '2023-12-24', size: '2 KB' }
    ]
  },
  'downloads': {
    name: '下载',
    children: [
      { id: 'f5', name: 'vscode_installer.exe', type: '应用程序', date: '2023-12-10', size: '89 MB' },
      { id: 'f6', name: 'nature.zip', type: '压缩文件', date: '2023-11-28', size: '230 MB' }
    ]
  },
  'pictures': {
    name: '图片',
    children: [
      { id: 'f7', name: '风景.jpg', type: 'JPEG 图像', date: '2023-08-14', size: '3.4 MB', isImage: true },
      { id: 'f8', name: 'Logo.png', type: 'PNG 图像', date: '2023-12-01', size: '150 KB', isImage: true }
    ]
  },
  'sub1': {
    name: '个人文件夹',
    children: [
      { id: 'f9', name: '秘密文档.txt', type: '文本文件', date: '2023-12-25', size: '1 KB' }
    ]
  }
};

const quickAccess = [
  { id: 'desktop', name: '桌面', icon: IconDesktop, color: 'text-blue-500' },
  { id: 'downloads', name: '下载', icon: IconDownload, color: 'text-green-500' },
  { id: 'documents', name: '文档', icon: IconFolder, color: 'text-orange-400' },
  { id: 'pictures', name: '图片', icon: IconImage, color: 'text-pink-500' },
];

// 状态管理
const currentFolderId = ref('desktop');
const pathStack = ref([{ id: 'desktop', name: '桌面' }]);
const selectedId = ref(null);
const viewMode = ref('grid');

// 计算属性
const currentItems = computed(() => fileSystem[currentFolderId.value]?.children || []);
const selectedItem = computed(() => currentItems.value.find(i => i.id === selectedId.value));

// 方法
const navigateTo = (folderId) => {
  const folder = fileSystem[folderId];
  if (folder) {
    currentFolderId.value = folderId;
    pathStack.value = [{ id: folderId, name: folder.name }];
    selectedId.value = null;
  }
};

const handleOpen = (item) => {
  if (item.isFolder) {
    currentFolderId.value = item.id;
    pathStack.value.push({ id: item.id, name: item.name });
    selectedId.value = null;
  }
};

const jumpToPath = (index) => {
  pathStack.value = pathStack.value.slice(0, index + 1);
  currentFolderId.value = pathStack.value[index].id;
  selectedId.value = null;
};

const goBack = () => {
  if (pathStack.value.length > 1) {
    pathStack.value.pop();
    currentFolderId.value = pathStack.value[pathStack.value.length - 1].id;
    selectedId.value = null;
  }
};

const getFileIcon = (item) => {
  if (item.isFolder) return IconFolder;
  if (item.isImage) return IconImage;
  return IconFile;
};

const getFileIconColor = (item) => {
  if (item.isFolder) return 'text-yellow-500 fill-yellow-500/20';
  if (item.isImage) return 'text-pink-400';
  return 'text-blue-400';
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
/* 简单的交互动画 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
