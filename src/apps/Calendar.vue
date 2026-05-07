<template>
  <div ref="containerRef" class="calendar-app flex h-full bg-[var(--fly-bg-primary)] text-[var(--fly-text-primary)] overflow-hidden font-sans border-0 select-none relative">
    <!-- 左侧详情面板 -->
 
    <!-- 右侧日历视图 -->
    <div 
      class="flex-1 flex flex-col min-w-0 relative"
      v-if="!isMobile || mobileView === 'month'"
    >
      <!-- 固定头部 -->
      <div class="px-6 pt-6 pb-2 z-10 bg-[var(--fly-bg-glass)] backdrop-blur-md border-b border-[var(--fly-border-system)]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ viewMonthName }} {{ viewYear }}</h2>
          <button @click="goToToday" class="px-4 py-1.5 text-xs font-bold bg-accent/10 hover:bg-accent/20 text-accent rounded-full transition-all active:scale-95">今天</button>
        </div>
        
        <!-- 星期表头 -->
        <div class="grid grid-cols-7 gap-1">
          <div v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="text-center text-[10px] font-bold opacity-30 py-1 uppercase tracking-tighter">
            {{ day }}
          </div>
        </div>
      </div>

      <!-- 滚动月份列表 -->
      <div 
        ref="scrollContainerRef" 
        @scroll="handleScroll"
        class="flex-1 overflow-y-auto px-6 py-4 no-scrollbar"
      >
        <div 
          v-for="month in renderedMonths" 
          :key="month.id" 
          :data-month-id="month.id"
          class="month-section mb-10 last:mb-20"
        >
          <h3 class="text-sm font-bold opacity-40 mb-4 px-1 sticky top-0 bg-[var(--fly-bg-primary)] py-2 z-[5]">{{ month.year }}年 {{ month.month + 1 }}月</h3>
          
          <div class="grid grid-cols-7 gap-1 sm:gap-2">
            <div v-for="n in month.startOffset" :key="'empty-'+n" class="aspect-square"></div>
            
            <!-- 日期格子 -->
            <div
              v-for="day in month.days"
              :key="day.date.getTime()"
              @click="onDateClick(day.date)"
              class="aspect-square relative rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 group"
              :class="[
                day.isSelected ? 'border-accent bg-accent/10 dark:bg-accent/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800',
                day.isToday && !day.isSelected ? 'text-accent font-bold ring-1 ring-accent/30' : '',
                day.isToday ? 'is-today' : ''
              ]"
            >
              <span class="text-sm z-10 group-active:scale-90 transition-transform">{{ day.date.getDate() }}</span>
              <span v-if="day.date.getDate() === 1 || day.isToday" class="text-[8px] opacity-40 scale-75 mt-0.5 leading-none absolute bottom-2 font-bold uppercase">
                {{ day.date.getDate() === 1 ? (month.month + 1) + '月' : '今日' }}
              </span>
              
              <div v-if="getEventsCount(day.date) > 0" class="absolute top-1 right-1">
                <div class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   <div 
      class="sidebar w-80 bg-[var(--fly-bg-secondary)] flex flex-col border-r border-[var(--fly-border-system)] shrink-0 z-20"
      v-if="!isMobile || mobileView === 'details'"
      :class="{ 'w-full': isMobile }"
    >
      <div class="p-6">
        <!-- 移动端返回按钮 -->
        <button 
          v-if="isMobile" 
          @click="mobileView = 'month'"
          class="mb-4 -ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors inline-flex items-center gap-1 text-xs font-bold text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          返回日历
        </button>

        <h1 class="text-4xl font-light text-accent leading-none">{{ selectedDate.getDate() }}</h1>
        <p class="text-lg font-medium mt-1">{{ formatFullDate(selectedDate) }}</p>
        <p class="text-sm opacity-50">{{ formatChineseLunar(selectedDate) }}</p>
      </div>

      <div class="flex-1 overflow-y-auto px-6 space-y-4 no-scrollbar">
        <div class="flex justify-between items-center">
          <h3 class="text-xs font-bold uppercase tracking-wider opacity-60">日程安排</h3>
          <button @click="openEventModal()" class="p-1.5 bg-accent/10 text-accent hover:bg-accent/20 rounded-lg transition-all active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        <div v-if="currentDayEvents.length === 0" class="py-12 text-center opacity-30 italic text-sm">
          <div class="mb-2 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="opacity-20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          今天没有安排
        </div>
        <div v-else class="space-y-3 pb-8">
          <div 
            v-for="event in currentDayEvents" 
            :key="event.id" 
            class="group relative p-4 bg-white dark:bg-gray-700/50 rounded-2xl shadow-sm border-l-4 transition-all hover:shadow-md cursor-pointer"
            :style="{ borderColor: event.color || 'var(--accent-color)' }"
            @click="openEventModal(event)"
          >
            <div class="flex justify-between items-start mb-1">
              <p class="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">{{ event.title }}</p>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click.stop="deleteEvent(event.id)" class="p-1 text-gray-400 hover:text-red-500 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            
            <div class="flex flex-wrap items-center gap-3 text-[11px] font-medium opacity-60">
              <span class="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ event.startTime || event.time }}{{ event.endTime ? ' - ' + event.endTime : '' }}
              </span>
              <span v-if="event.location" class="flex items-center gap-1 truncate max-w-[120px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ event.location }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 增强版日程表单浮层 -->
    <Transition name="fade">
      <div v-if="isFormOpen" class="absolute inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/10 dark:bg-black/30 backdrop-blur-md" @click.self="closeForm">
        <div 
          class="w-full max-w-lg bg-[var(--fly-bg-glass)] border border-[var(--fly-border-glass)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
          :class="isMobile ? 'mt-auto mb-0 rounded-t-[var(--fly-radius-lg)]' : 'rounded-[var(--fly-radius-lg)]'"
          @click.stop
        >
          <!-- 表单头部 -->
          <div class="p-6 pb-2 flex justify-between items-center">
            <h2 class="text-xl font-bold tracking-tight">{{ isEditing ? '编辑日程' : '新建日程' }}</h2>
            <button @click="closeForm" class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-[var(--fly-text-secondary)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="px-6 pb-8 overflow-y-auto max-h-[70vh] no-scrollbar">
            <!-- 标题输入 (大字体) -->
            <input 
              v-model="formState.title"
              type="text" 
              placeholder="日程标题" 
              class="w-full text-2xl font-black bg-transparent border-none focus:ring-0 focus:outline-none px-0 mb-6 placeholder:opacity-20"
              autofocus
            />

            <div class="space-y-6">
              <!-- 时间选择 -->
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-[var(--fly-radius-sm)] bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)]/50 text-[var(--fly-text-secondary)] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div class="flex-1 flex gap-2 items-center">
                  <input type="time" v-model="formState.startTime" class="flex-1 bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)]/50 rounded-[var(--fly-radius-sm)] px-3 py-2 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent/40 outline-none transition-all font-bold" />
                  <span class="opacity-30 font-bold">至</span>
                  <input type="time" v-model="formState.endTime" class="flex-1 bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)]/50 rounded-[var(--fly-radius-sm)] px-3 py-2 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent/40 outline-none transition-all font-bold" />
                </div>
              </div>

              <!-- 地点 -->
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-[var(--fly-radius-sm)] bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)]/50 text-[var(--fly-text-secondary)] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <input v-model="formState.location" type="text" placeholder="设置地点" class="flex-1 bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)]/50 rounded-[var(--fly-radius-sm)] px-3 py-2 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent/40 outline-none transition-all font-bold placeholder:opacity-20" />
              </div>

              <!-- 分类标签 -->
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-[var(--fly-radius-sm)] bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)]/50 text-[var(--fly-text-secondary)] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                </div>
                <div class="flex gap-2.5">
                  <button 
                    v-for="color in colorPresets" 
                    :key="color"
                    @click="formState.color = color"
                    class="w-6 h-6 rounded-md border-2 transition-all hover:scale-110 active:scale-90"
                    :class="[formState.color === color ? 'border-[var(--fly-text-primary)] scale-110 shadow-lg shadow-black/10' : 'border-transparent']"
                    :style="{ backgroundColor: color }"
                  ></button>
                </div>
              </div>

              <!-- 说明 -->
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-[var(--fly-radius-sm)] bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)]/50 text-[var(--fly-text-secondary)] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <textarea v-model="formState.description" placeholder="添加备注或详细说明..." rows="3" class="flex-1 bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)]/50 rounded-[var(--fly-radius-sm)] px-3 py-2 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent/40 outline-none transition-all font-bold resize-none no-scrollbar placeholder:opacity-20"></textarea>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-4 mt-10">
              <button @click="closeForm" class="flex-1 py-3 px-4 bg-[var(--fly-bg-primary)] text-[var(--fly-text-primary)] font-black rounded-[var(--fly-radius-md)] transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 border border-[var(--fly-border-system)]">取消</button>
              <button 
                @click="saveForm" 
                class="flex-1 py-3 px-4 bg-accent text-white font-black rounded-[var(--fly-radius-md)] transition-all hover:brightness-110 active:scale-95 shadow-xl shadow-accent/20 disabled:opacity-20 disabled:shadow-none"
                :disabled="!formState.title"
              >
                保存日程
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, reactive } from 'vue';

interface Event {
  id: string;
  dateStr: string;
  title: string;
  time: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  color?: string;
}

interface MonthData {
  id: string;
  year: number;
  month: number;
  startOffset: number;
  days: any[];
}

const containerRef = ref<HTMLElement | null>(null);
const scrollContainerRef = ref<HTMLElement | null>(null);
const containerWidth = ref(1000);
const mobileView = ref<'month' | 'details'>('month');

const selectedDate = ref(new Date());
const viewDate = ref(new Date()); // 当前正在看到的月份参考点
const events = ref<Event[]>([]);
const renderedMonths = ref<MonthData[]>([]);

// 表单相关状态
const isFormOpen = ref(false);
const isEditing = ref(false);
const formState = reactive({
  id: '',
  title: '',
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  description: '',
  color: '#6366f1'
});

const colorPresets = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#0f172a'];

const isMobile = computed(() => containerWidth.value < 700);

const viewYear = computed(() => viewDate.value.getFullYear());
const viewMonthName = computed(() => viewDate.value.toLocaleString('zh-CN', { month: 'long' }));

// 初始化加载：当前月及前后 12 个月
function initMonths() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 12, 1);
  for (let i = 0; i <= 24; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    renderedMonths.value.push(generateMonthData(d.getFullYear(), d.getMonth()));
  }
}

function generateMonthData(year: number, month: number): MonthData {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days = [];
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      isToday: isSameDay(d, new Date()),
      isSelected: isSameDay(d, selectedDate.value)
    });
  }
  
  return {
    id: `${year}-${month}`,
    year,
    month,
    startOffset,
    days
  };
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getDate() === d2.getDate();
}

function getEventsCount(date: Date) {
  return events.value.filter(e => e.dateStr === date.toDateString()).length;
}

const currentDayEvents = computed(() => {
  const ds = selectedDate.value.toDateString();
  return events.value.filter(e => e.dateStr === ds).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
});

// 监听滚动，更新当前可见月份标题
function handleScroll() {
  if (!scrollContainerRef.value) return;
  
  const container = scrollContainerRef.value;
  const sections = container.querySelectorAll('.month-section');
  let mostVisibleMonth = renderedMonths.value[0];
  let maxVisibleHeight = 0;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, containerRect.top);
    const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    
    if (visibleHeight > maxVisibleHeight) {
      maxVisibleHeight = visibleHeight;
      const monthId = section.getAttribute('data-month-id');
      const [year, month] = monthId!.split('-').map(Number);
      mostVisibleMonth = { year, month } as any;
    }
  });

  if (mostVisibleMonth) {
    const newViewDate = new Date(mostVisibleMonth.year, mostVisibleMonth.month, 1);
    if (newViewDate.getTime() !== viewDate.value.getTime()) {
      viewDate.value = newViewDate;
    }
  }

  // 无限滚动追加
  if (container.scrollTop < 200) {
    loadMoreMonths('prev');
  } else if (container.scrollHeight - container.scrollTop - container.clientHeight < 200) {
    loadMoreMonths('next');
  }
}

function loadMoreMonths(direction: 'prev' | 'next') {
  if (direction === 'next') {
    const last = renderedMonths.value[renderedMonths.value.length - 1];
    if (!last) return;
    const nextDate = new Date(last.year, last.month + 1, 1);
    renderedMonths.value.push(generateMonthData(nextDate.getFullYear(), nextDate.getMonth()));
  } else {
    const first = renderedMonths.value[0];
    if (!first) return;
    const prevDate = new Date(first.year, first.month - 1, 1);
    const oldHeight = scrollContainerRef.value?.scrollHeight || 0;
    renderedMonths.value.unshift(generateMonthData(prevDate.getFullYear(), prevDate.getMonth()));
    nextTick(() => {
       if (scrollContainerRef.value) {
         const newHeight = scrollContainerRef.value.scrollHeight;
         scrollContainerRef.value.scrollTop += (newHeight - oldHeight);
       }
    });
  }
}

/**
 * 滚动到“今天”的核心逻辑
 * @param smooth 是否平滑滚动
 */
function scrollToToday(smooth = true) {
  if (!scrollContainerRef.value) return false;
  
  const todayEl = scrollContainerRef.value.querySelector('.is-today');
  if (todayEl) {
    todayEl.scrollIntoView({ 
      block: 'center', 
      behavior: smooth ? 'smooth' : 'auto' 
    });
    return true;
  }
  return false;
}

function onDateClick(date: Date) {
  selectedDate.value = date;
  // 更新所有已经生成的月份数据的 isSelected 状态
  renderedMonths.value.forEach(m => {
    m.days.forEach(d => {
      d.isSelected = isSameDay(d.date, date);
    });
  });

  if (isMobile.value) {
    mobileView.value = 'details';
  }
}

function goToToday() {
  const today = new Date();
  selectedDate.value = today;
  
  if (!scrollToToday(true)) {
    // 如果“今天”不满足渲染范围，重新初始化
    renderedMonths.value = [];
    viewDate.value = new Date(today.getFullYear(), today.getMonth(), 1);
    initMonths();
    nextTick(() => {
      setTimeout(() => scrollToToday(false), 50);
    });
  }
}

// 表单操作
function openEventModal(event?: Event) {
  if (event) {
    isEditing.value = true;
    Object.assign(formState, event);
  } else {
    isEditing.value = false;
    Object.assign(formState, {
      id: '',
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      description: '',
      color: '#6366f1'
    });
  }
  isFormOpen.value = true;
}

function closeForm() {
  isFormOpen.value = false;
}

function saveForm() {
  if (!formState.title) return;
  
  const eventData: Event = {
    ...formState,
    id: formState.id || Date.now().toString(),
    dateStr: selectedDate.value.toDateString(),
    time: formState.startTime // 兼容旧代码
  };

  if (isEditing.value) {
    const index = events.value.findIndex(e => e.id === eventData.id);
    if (index !== -1) events.value[index] = eventData;
  } else {
    events.value.push(eventData);
  }

  save();
  closeForm();
}

function deleteEvent(id: string) {
  events.value = events.value.filter(e => e.id !== id);
  save();
}

function save() { localStorage.setItem('flyos_calendar_events', JSON.stringify(events.value)); }

function formatFullDate(date: Date) {
  return date.toLocaleString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatChineseLunar(_date: Date) {
  return "农历冬月十二 · 乙巳年";
}

// 容器尺寸监听
const updateSize = () => {
  if (containerRef.value) containerWidth.value = containerRef.value.offsetWidth;
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.value);
    updateSize();
  }

  const saved = localStorage.getItem('flyos_calendar_events');
  if (saved) events.value = JSON.parse(saved);

  initMonths();
  
  // 采用多层级稳健定位逻辑
  nextTick(() => {
    // 第一次尝试：在动画开始前定位
    setTimeout(() => {
      scrollToToday(false);
      
      // 第二次尝试：等待窗口可能存在的打开动画结束 (500ms)
      setTimeout(() => {
        if (!scrollToToday(false)) {
          // 如果还是没搜到，说明加载极慢，进行最后一次强力尝试
          setTimeout(() => scrollToToday(false), 500);
        }
      }, 500);
    }, 100);
  });
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>
.calendar-app {
  container-type: inline-size;
  container-name: calendar-app;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { 
  -ms-overflow-style: none; 
  scrollbar-width: none; 
}

/* 粘性标题优化 */
.month-section h3 {
  backdrop-filter: blur(var(--fly-glass-blur));
  background: var(--fly-bg-glass);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
