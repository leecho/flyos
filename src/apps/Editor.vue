<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  FileCode,
  FolderTree,
  Search,
  Settings,
  Play,
  Files,
  Terminal as TerminalIcon,
  X,
  Plus,
  ChevronRight,
  ChevronDown,
  Save,
  Command
} from 'lucide-vue-next';

// 模拟文件系统
const files = ref([
  { id: 1, name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello FlyOS</title>\n</head>\n<body>\n  <h1>Welcome to FlyCode</h1>\n</body>\n</html>', isOpen: true },
  { id: 2, name: 'styles.css', language: 'css', content: 'body {\n  background: #0f172a;\n  color: white;\n  font-family: sans-serif;\n}', isOpen: true },
  { id: 3, name: 'main.js', language: 'javascript', content: 'function greet() {\n  console.log("Hello from FlyOS!");\n}\n\ngreet();', isOpen: false }
]);

const activeFileId = ref(1);
const openTabs = computed(() => files.value.filter(f => f.isOpen));
const activeFile = computed(() => files.value.find(f => f.id === activeFileId.value));

const sidebarWidth = ref(200);
const showTerminal = ref(true);
const terminalLogs = ref([
  { type: 'system', text: 'FlyCode Terminal v1.0.0' },
  { type: 'info', text: '正在初始化环境...' },
  { type: 'success', text: '就绪。输入命令开始。' }
]);

const selectFile = (file: any) => {
  if (!file.isOpen) file.isOpen = true;
  activeFileId.value = file.id;
};

const closeTab = (e: Event, file: any) => {
  e.stopPropagation();
  file.isOpen = false;
  if (activeFileId.value === file.id) {
    const remaining = openTabs.value;
    if (remaining.length > 0) {
      activeFileId.value = remaining[remaining.length - 1].id;
    }
  }
};

const runCode = () => {
  terminalLogs.value.push({ type: 'info', text: `正在运行 ${activeFile.value?.name}...` });
  setTimeout(() => {
    terminalLogs.value.push({ type: 'success', text: '执行成功 (耗时 12ms)' });
  }, 500);
};

// 简单的语法高亮模拟逻辑
const highlightCode = (code: string) => {
  if (!code) return '';
  return code
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(var|let|const|function|return|if|else|for|while|import|export|from|class|extends)/g, '<span class="text-pink-400">$1</span>')
    .replace(/(string|number|boolean|any|void)/g, '<span class="text-blue-400">$1</span>')
    .replace(/(\".*?\"|\'.*?\')/g, '<span class="text-amber-200">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="text-slate-500 italic">$1</span>')
    .replace(/(\d+)/g, '<span class="text-orange-400">$1</span>');
};

</script>

<template>
  <div class="flycode-container">
    <!-- 顶部工具栏 -->
    <header class="editor-toolbar">
      <div class="flex items-center gap-4 px-4 h-full">
        <div class="flex items-center gap-2 text-indigo-400 font-bold">
          <FileCode :size="18" />
          <span class="text-xs tracking-widest uppercase">FlyCode</span>
        </div>
        <nav class="flex items-center gap-3 text-[11px] text-slate-400">
          <button class="hover:text-white transition-colors">文件</button>
          <button class="hover:text-white transition-colors">编辑</button>
          <button class="hover:text-white transition-colors">选择</button>
          <button class="hover:text-white transition-colors">视图</button>
          <button class="hover:text-white transition-colors">帮助</button>
        </nav>
      </div>
      <div class="flex items-center gap-2 px-4">
        <button @click="runCode" class="run-btn">
          <Play :size="12" fill="currentColor" />
          运行
        </button>
        <button class="icon-btn">
          <Save :size="14" />
        </button>
      </div>
    </header>

    <div class="editor-body">
      <!-- 侧边活动栏 -->
      <aside class="activity-bar">
        <div class="flex flex-col items-center gap-4 py-4 w-full">
          <button class="active"><Files :size="20" /></button>
          <button><Search :size="20" /></button>
          <button><FolderTree :size="20" /></button>
        </div>
        <div class="mt-auto pb-4">
          <button><Settings :size="20" /></button>
        </div>
      </aside>

      <!-- 资源管理器 -->
      <aside class="explorer" :style="{ width: sidebarWidth + 'px' }">
        <div class="section-title">资源管理器</div>
        <div class="py-2">
          <div class="flex items-center px-4 py-1 gap-2 text-[11px] font-bold text-slate-500 uppercase">
            <ChevronDown :size="12" />
            FLYOS-PROJECT
          </div>
          <div v-for="file in files" :key="file.id"
               @click="selectFile(file)"
               :class="['file-item', { active: activeFileId === file.id }]">
            <ChevronRight :size="12" class="opacity-0" />
            <FileCode :size="14" :class="file.id === 1 ? 'text-orange-400' : (file.id === 2 ? 'text-blue-400' : 'text-yellow-400')" />
            <span>{{ file.name }}</span>
          </div>
        </div>
      </aside>

      <!-- 主编辑区域 -->
      <main class="main-content">
        <!-- 标签栏 -->
        <div class="tabs-bar">
          <div v-for="file in openTabs" :key="file.id"
               @click="activeFileId = file.id"
               :class="['tab', { active: activeFileId === file.id }]">
            <span class="text-[11px]">{{ file.name }}</span>
            <X @click="closeTab($event, file)" :size="10" class="tab-close" />
          </div>
          <div class="flex-1 bg-[#1a1b26]/50"></div>
        </div>

        <!-- 编辑器核心 -->
        <div class="editor-view">
          <div class="line-numbers">
            <div v-for="i in 20" :key="i">{{ i }}</div>
          </div>
          <div class="code-area">
            <pre v-if="activeFile" v-html="highlightCode(activeFile.content)"></pre>
            <div v-else class="empty-editor">
              <Command :size="48" class="opacity-10 mb-4" />
              <p class="text-slate-500 text-xs">选择一个文件开始编辑</p>
            </div>
          </div>
        </div>

        <!-- 终端面板 -->
        <div v-if="showTerminal" class="terminal-panel">
          <div class="terminal-header">
            <div class="flex items-center gap-2">
              <TerminalIcon :size="12" />
              <span>终端</span>
            </div>
            <div class="flex items-center gap-3">
              <Plus :size="12" class="cursor-pointer" />
              <X :size="12" class="cursor-pointer" @click="showTerminal = false" />
            </div>
          </div>
          <div class="terminal-content">
            <div v-for="(log, i) in terminalLogs" :key="i" :class="['log-line', log.type]">
              <span class="prompt">flyos@user:~$</span> {{ log.text }}
            </div>
            <div class="flex gap-2">
              <span class="prompt">flyos@user:~$</span>
              <input type="text" class="bg-transparent border-none outline-none flex-1 text-slate-300" autofocus />
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 状态栏 -->
    <footer class="status-bar">
      <div class="flex items-center gap-4 h-full px-3">
        <div class="status-item bg-indigo-600 hover:bg-indigo-500 px-2 cursor-pointer">
          <Plus :size="12" />
          <span>Main</span>
        </div>
        <div class="status-item">
          <span>Ln 1, Col 1</span>
        </div>
        <div class="status-item">
          <span>UTF-8</span>
        </div>
      </div>
      <div class="ml-auto flex items-center gap-4 h-full px-3">
        <div class="status-item">
          <span>{{ activeFile?.language || 'Plain Text' }}</span>
        </div>
        <div class="status-item text-emerald-400">
          <CheckCircle :size="12" class="mr-1" />
          <span>Prettier</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.flycode-container {
  @apply flex flex-col w-full h-full bg-[#1a1b26] text-slate-300 overflow-hidden font-sans;
}

/* 顶部工具栏 */
.editor-toolbar {
  @apply h-10 border-b border-white/5 flex items-center justify-between bg-[#16161e] shrink-0;
}

.run-btn {
  @apply flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded transition-all uppercase;
}

.icon-btn {
  @apply p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-all;
}

.editor-body {
  @apply flex flex-1 min-h-0;
}

/* 活动栏 */
.activity-bar {
  @apply w-12 border-r border-white/5 bg-[#16161e] flex flex-col items-center shrink-0;
}

.activity-bar button {
  @apply p-2.5 text-slate-500 hover:text-white transition-all relative;
}

.activity-bar button.active {
  @apply text-indigo-400;
}

.activity-bar button.active::before {
  content: '';
  @apply absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-indigo-500;
}

/* 资源管理器 */
.explorer {
  @apply border-r border-white/5 bg-[#1a1b26] shrink-0 hidden md:block;
}

.section-title {
  @apply px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest;
}

.file-item {
  @apply flex items-center gap-2 px-4 py-1.5 text-xs text-slate-400 hover:bg-white/5 cursor-pointer transition-colors border-l-2 border-transparent;
}

.file-item.active {
  @apply bg-indigo-500/10 text-slate-200 border-indigo-500;
}

/* 主内容区 */
.main-content {
  @apply flex-1 flex flex-col min-w-0 bg-[#1a1b26];
}

.tabs-bar {
  @apply h-9 flex bg-[#16161e] overflow-x-auto shrink-0;
}

.tab {
  @apply flex items-center gap-3 px-4 h-full border-r border-white/5 bg-[#1a1b26]/50 text-slate-500 cursor-pointer min-w-[120px] transition-all;
}

.tab.active {
  @apply bg-[#1a1b26] text-slate-200 border-t border-t-indigo-500;
}

.tab-close {
  @apply opacity-0 hover:bg-white/10 rounded p-0.5 transition-all;
}

.tab:hover .tab-close {
  @apply opacity-100;
}

/* 编辑器区域 */
.editor-view {
  @apply flex-1 flex overflow-auto font-mono;
}

.line-numbers {
  @apply w-12 py-4 flex flex-col items-center text-[11px] text-slate-600 bg-[#1a1b26] border-r border-white/5 select-none;
}

.code-area {
  @apply flex-1 p-4 text-sm leading-relaxed overflow-auto;
}

.empty-editor {
  @apply h-full flex flex-col items-center justify-center;
}

/* 终端面板 */
.terminal-panel {
  @apply h-40 border-t border-white/10 bg-[#16161e] flex flex-col shrink-0;
}

.terminal-header {
  @apply px-4 h-8 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-[#1a1b26];
}

.terminal-content {
  @apply flex-1 p-3 font-mono text-xs overflow-y-auto space-y-1;
}

.prompt {
  @apply text-emerald-400 font-bold;
}

.log-line.system { @apply text-slate-500; }
.log-line.info { @apply text-blue-400; }
.log-line.success { @apply text-emerald-400; }

/* 状态栏 */
.status-bar {
  @apply h-6 bg-indigo-800 text-white flex items-center text-[10px] font-medium shrink-0;
}

.status-item {
  @apply flex items-center h-full px-2 hover:bg-white/10 transition-colors;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  @apply bg-transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-white/5 rounded-full hover:bg-white/10;
}
</style>
