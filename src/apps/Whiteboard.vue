<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

// 基础绘图状态
const canvasRef = ref(null);
const containerRef = ref(null);
const ctx = ref(null);
const isDrawing = ref(false);
const color = ref(''); // Default color will be set dynamically from theme
const lineWidth = ref(6);
const tool = ref('pencil');
const isSidebarOpen = ref(true);

// 多画布管理状态
const boards = ref([]);
const activeBoardId = ref(null);

const STORAGE_KEY = 'zen_whiteboard_v2_data';
// Preset colors, with a placeholder for the theme's accent color
const presetColors = ref(['#0f172a', '#10b981', '#f59e0b', '#ef4444', '#a855f7']);
let lastPos = { x: 0, y: 0 };
let resizeObserver = null;

// 获取当前激活的画布对象
const getActiveBoard = () => {
  return boards.value.find(b => b.id === activeBoardId.value);
};

// 初始化数据加载
const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        boards.value = parsed;
        activeBoardId.value = parsed[0].id;
      } else {
        createNewBoard();
      }
    } catch (e) {
      console.error("Load error", e);
      createNewBoard();
    }
  } else {
    createNewBoard();
  }
};

// 保存数据
const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards.value));
};

// 创建新画布
const createNewBoard = () => {
  const newId = Date.now().toString();
  const newBoard = {
    id: newId,
    name: `未命名画布 ${boards.value.length + 1}`,
    strokes: [],
    lastModified: Date.now()
  };
  boards.value.unshift(newBoard);
  activeBoardId.value = newId;
  saveData();
  nextTick(setupCanvas);
};

// 删除画布
const deleteBoard = (id, event) => {
  event.stopPropagation();
  if (boards.value.length <= 1) return;
  const index = boards.value.findIndex(b => b.id === id);
  if (index !== -1) {
    boards.value.splice(index, 1);
    if (activeBoardId.value === id) {
      activeBoardId.value = boards.value[0].id;
    }
    saveData();
    nextTick(setupCanvas);
  }
};

// 重命名
const renameBoard = (id, newName) => {
  const board = boards.value.find(b => b.id === id);
  if (board) {
    board.name = newName || '未命名画布';
    saveData();
  }
};

// 配置 Canvas 环境
const setupCanvas = () => {
  if (!canvasRef.value || !containerRef.value) return;
  const canvas = canvasRef.value;
  const rect = containerRef.value.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  const context = canvas.getContext('2d');
  context.scale(dpr, dpr);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  ctx.value = context;

  redrawAll();
};

const redrawAll = () => {
  if (!ctx.value) return;
  const active = getActiveBoard();
  if (!active) return;

  const canvas = canvasRef.value;
  ctx.value.clearRect(0, 0, canvas.width, canvas.height);
  active.strokes.forEach(drawStrokeOnCanvas);
};

const drawStrokeOnCanvas = (stroke) => {
  const c = ctx.value;
  if (!c) return;
  c.beginPath();
  c.strokeStyle = stroke.color;
  c.lineWidth = stroke.width;
  c.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
  c.moveTo(stroke.start.x, stroke.start.y);
  c.lineTo(stroke.end.x, stroke.end.y);
  c.stroke();
  c.closePath();
};

const getPos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  return { x: clientX - rect.left, y: clientY - rect.top };
};

const startDrawing = (e) => {
  isDrawing.value = true;
  lastPos = getPos(e);
};

const draw = (e) => {
  if (!isDrawing.value || !ctx.value) return;
  const active = getActiveBoard();
  if (!active) return;

  const currentPos = getPos(e);
  const newStroke = {
    start: { ...lastPos },
    end: { ...currentPos },
    color: tool.value === 'eraser' ? 'rgba(0,0,0,1)' : color.value,
    width: lineWidth.value,
    tool: tool.value
  };

  drawStrokeOnCanvas(newStroke);
  active.strokes.push(newStroke);
  lastPos = currentPos;
};

const stopDrawing = () => {
  if (isDrawing.value) saveData();
  isDrawing.value = false;
};

const clearCurrent = () => {
  const active = getActiveBoard();
  if (active) {
    active.strokes = [];
    saveData();
    redrawAll();
  }
};

const switchBoard = (id) => {
  activeBoardId.value = id;
};

onMounted(() => {
  // Dynamically set accent color from CSS variables
  const accentColorValue = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#6366f1';
  color.value = accentColorValue;
  presetColors.value.splice(1, 0, accentColorValue); // Insert theme color as a preset

  loadData();
  resizeObserver = new ResizeObserver(() => setupCanvas());
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

watch(activeBoardId, () => {
  nextTick(setupCanvas);
});
</script>

<template>
  <div class="flex h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">

    <!-- 侧边管理栏 -->
    <aside
      class="flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 overflow-hidden"
      :class="[isSidebarOpen ? 'w-64' : 'w-0']"
    >
      <div class="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h2 class="font-bold text-xs uppercase tracking-widest text-accent truncate">我的画布</h2>
        <button @click="createNewBoard" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <div
          v-for="board in boards"
          :key="board.id"
          @click="switchBoard(board.id)"
          class="group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border"
          :class="[activeBoardId === board.id
            ? 'bg-accent/10 border-accent/20 dark:bg-accent/10 dark:border-accent/30'
            : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          <div class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <input
              v-if="activeBoardId === board.id"
              v-model="board.name"
              @blur="renameBoard(board.id, board.name)"
              @keyup.enter="$event.target.blur()"
              class="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium"
            />
            <p v-else class="text-sm font-medium truncate opacity-80">{{ board.name }}</p>
            <p class="text-[10px] opacity-40">笔触: {{ board.strokes.length }}</p>
          </div>
          <button
            @click="deleteBoard(board.id, $event)"
            class="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all shrink-0"
            v-if="boards.length > 1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- 主画布区 -->
    <div class="flex-1 relative flex flex-col min-w-0">

      <!-- 顶部控制条 -->
      <nav class="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl">
        <button @click="isSidebarOpen = !isSidebarOpen" class="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-transform" :class="{'rotate-180': !isSidebarOpen}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div class="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>

        <!-- 颜色选择器 -->
        <div class="flex items-center gap-2">
          <button
            v-for="c in presetColors"
            :key="c"
            @click="color = c; tool = 'pencil'"
            class="w-5 h-5 rounded-full transition-transform border-2"
            :class="[color === c && tool === 'pencil' ? 'border-slate-400 scale-125' : 'border-transparent hover:scale-110']"
            :style="{ backgroundColor: c }"
          ></button>
          <div class="relative w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden">
            <input type="color" v-model="color" class="absolute inset-0 w-full h-full scale-[2] cursor-pointer" @change="tool = 'pencil'" />
          </div>
        </div>

        <div class="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>

        <button @click="clearCurrent" class="p-1.5 text-slate-500 hover:text-red-500 rounded-lg transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
        </button>
      </nav>

      <!-- 侧边浮动工具栏 -->
      <div class="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-lg">
        <button
          @click="tool = 'pencil'"
          class="p-3 rounded-xl transition-all"
          :class="[tool === 'pencil' ? 'bg-accent text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>

        <button
          @click="tool = 'eraser'"
          class="p-3 rounded-xl transition-all"
          :class="[tool === 'eraser' ? 'bg-accent text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800']"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z"/></svg>
        </button>

        <div class="h-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        <div class="flex flex-col items-center gap-3 py-2">
          <input
            type="range"
            min="1" max="40"
            v-model.number="lineWidth"
            class="slider-v"
          />
          <div class="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <div class="bg-accent rounded-full" :style="{ width: Math.max(2, lineWidth/4) + 'px', height: Math.max(2, lineWidth/4) + 'px' }"></div>
          </div>
        </div>
      </div>

      <!-- 画布显示区 -->
      <main ref="containerRef" class="flex-1 relative cursor-crosshair touch-none select-none">
        <!-- 网格背景 -->
        <div class="absolute inset-0 pointer-events-none opacity-[0.05]"
             style="background-image: radial-gradient(currentColor 1px, transparent 0); background-size: 32px 32px;"></div>

        <canvas
          ref="canvasRef"
          class="block"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="startDrawing"
          @touchmove.prevent="draw"
          @touchend.prevent="stopDrawing"
        ></canvas>

        <!-- 当前画布名称浮层 -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
          <div class="px-4 py-1.5 bg-slate-900/10 dark:bg-white/10 backdrop-blur rounded-full text-[11px] font-bold tracking-widest uppercase opacity-40">
            {{ getActiveBoard()?.name || 'ZenBoard' }}
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.2);
  border-radius: 10px;
}

.slider-v {
  -webkit-appearance: none;
  width: 4px;
  height: 100px;
  background: rgba(156, 163, 175, 0.2);
  border-radius: 2px;
  outline: none;
  writing-mode: vertical-lr;
  direction: rtl;
  cursor: pointer;
}

.slider-v::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent-color);
  border: 2px solid white;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
