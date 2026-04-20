<template>
  <div ref="containerRef" class="calendar-app flex h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden font-sans border-0">
    <!-- 左侧详情面板 -->
    <div 
      class="sidebar w-80 bg-gray-50 dark:bg-gray-800/50 flex flex-col border-r border-gray-200 dark:border-gray-700 shrink-0"
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

      <div class="flex-1 overflow-y-auto px-6 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-xs font-bold uppercase tracking-wider opacity-60">日程安排</h3>
          <button @click="addEvent" class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        <div v-if="currentDayEvents.length === 0" class="py-8 text-center opacity-40 italic text-sm">
          今天没有安排
        </div>
        <div v-else class="space-y-3">
          <div v-for="event in currentDayEvents" :key="event.id" class="group relative p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border-l-4 border-accent">
            <p class="text-sm font-semibold">{{ event.title }}</p>
            <p class="text-xs opacity-60 mt-1">{{ event.time }}</p>
            <button @click="deleteEvent(event.id)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-accent transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧日历视图 -->
    <div 
      class="flex-1 flex flex-col p-4 sm:p-6 min-w-0"
      v-if="!isMobile || mobileView === 'month'"
    >
      <div class="flex justify-between items-center mb-6 sm:mb-8">
        <div class="flex items-center space-x-2 sm:space-x-4 overflow-hidden">
          <h2 class="text-xl sm:text-2xl font-bold truncate">{{ viewMonthName }} {{ viewYear }}</h2>
          <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0">
            <button @click="prevMonth" class="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button @click="nextMonth" class="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded shadow-sm transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
        <button @click="goToToday" class="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors shrink-0">今天</button>
      </div>

      <div class="grid grid-cols-7 gap-1 sm:gap-2 flex-1 items-start content-start">
        <!-- 星期表头 -->
        <div v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="text-center text-[10px] sm:text-xs font-bold opacity-40 py-2">
          {{ day }}
        </div>

        <!-- 日期格子 -->
        <div
          v-for="{ date, isCurrentMonth, isToday, isSelected, eventsCount } in calendarDays"
          :key="date.getTime()"
          @click="onDateClick(date)"
          class="aspect-square relative rounded-lg sm:rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all border-2"
          :class="[
            isCurrentMonth ? 'opacity-100' : 'opacity-20',
            isSelected ? 'border-accent bg-accent/10 dark:bg-accent/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800',
            isToday && !isSelected ? 'text-accent font-bold' : ''
          ]"
        >
          <span class="text-xs sm:text-sm z-10">{{ date.getDate() }}</span>
          <div v-if="eventsCount > 0" class="absolute bottom-1 sm:bottom-2 flex space-x-0.5 sm:space-x-1">
            <div v-for="n in Math.min(eventsCount, 3)" :key="n" class="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-accent/50"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { messageBox } from '../composables/useMessage';

interface Event {
  id: string;
  dateStr: string;
  title: string;
  time: string;
}

const containerRef = ref<HTMLElement | null>(null);
const containerWidth = ref(1000);
const mobileView = ref<'month' | 'details'>('month');

const selectedDate = ref(new Date());
const viewDate = ref(new Date());
const events = ref<Event[]>([]);

const isMobile = computed(() => containerWidth.value < 700);

const viewYear = computed(() => viewDate.value.getFullYear());
const viewMonth = computed(() => viewDate.value.getMonth());
const viewMonthName = computed(() => viewDate.value.toLocaleString('zh-CN', { month: 'long' }));

const calendarDays = computed(() => {
  const days = [];
  const firstDay = new Date(viewYear.value, viewMonth.value, 1);
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0);

  // 填充月初前的空白 (计算星期几，国内周一为起始)
  let startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const prevMonthLastDay = new Date(viewYear.value, viewMonth.value, 0).getDate();

  for (let i = startOffset - 1; i >= 0; i--) {
    days.push(createDayObject(new Date(viewYear.value, viewMonth.value - 1, prevMonthLastDay - i), false));
  }

  // 填充当月
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(createDayObject(new Date(viewYear.value, viewMonth.value, i), true));
  }

  // 填充月末后的空白
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(createDayObject(new Date(viewYear.value, viewMonth.value + 1, i), false));
  }

  return days;
});

const currentDayEvents = computed(() => {
  const ds = selectedDate.value.toDateString();
  return events.value.filter(e => e.dateStr === ds);
});

// 容器尺寸监听
const updateSize = () => {
  if (containerRef.value) containerWidth.value = containerRef.value.offsetWidth;
};

let resizeObserver: ResizeObserver | null = null;

function createDayObject(date: Date, isCurrentMonth: boolean) {
  const today = new Date();
  return {
    date,
    isCurrentMonth,
    isToday: date.toDateString() === today.toDateString(),
    isSelected: date.toDateString() === selectedDate.value.toDateString(),
    eventsCount: events.value.filter(e => e.dateStr === date.toDateString()).length
  };
}

function onDateClick(date: Date) {
  selectedDate.value = date;
  if (isMobile.value) {
    mobileView.value = 'details';
  }
}

function prevMonth() { viewDate.value = new Date(viewYear.value, viewMonth.value - 1, 1); }
function nextMonth() { viewDate.value = new Date(viewYear.value, viewMonth.value + 1, 1); }
function goToToday() {
  const today = new Date();
  selectedDate.value = today;
  viewDate.value = new Date(today.getFullYear(), today.getMonth(), 1);
}

async function addEvent() {
  const title = await messageBox.prompt('输入日程内容')
  if (title) {
    events.value.push({
      id: Date.now().toString(),
      dateStr: selectedDate.value.toDateString(),
      title,
      time: '全天'
    });
    save();
  }
}

function deleteEvent(id: string) {
  events.value = events.value.filter(e => e.id !== id);
  save();
}

function save() { localStorage.setItem('flyos_calendar_events', JSON.stringify(events.value)); }

function formatFullDate(date: Date) {
  return date.toLocaleString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatChineseLunar(date: Date) {
  return "农历冬月十二 · 乙巳年";
}

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.value);
    updateSize();
  }

  const saved = localStorage.getItem('flyos_calendar_events');
  if (saved) events.value = JSON.parse(saved);
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>
.calendar-app {
  container-type: inline-size;
  container-name: calendar-app;
  user-select: none;
}
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: rgba(155, 155, 155, 0.2); border-radius: 10px; }
</style>
