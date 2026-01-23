<template>
  <div class="w-full h-full relative group bg-red-600">
    <LiveTile :items="calendarPages" :interval="6000" animationType="slide-up">
      <template #default="{ item }">
        <!-- 页面 1: 今日概览 -->
        <div v-if="item.type === 'today'" class="w-full h-full p-3 flex flex-col justify-between text-white">
          <div class="flex flex-col items-start">
            <span class="text-[10px] font-medium opacity-80 uppercase tracking-tighter">{{ currentMonthStr }}</span>
            <span class="text-4xl font-light leading-none mt-1">{{ todayDate }}</span>
          </div>
          <div class="space-y-1">
            <p class="text-[10px] font-bold truncate">{{ todayEvents[0]?.title || '今日无日程' }}</p>
            <p v-if="todayEvents.length > 1" class="text-[9px] opacity-70">+ 还有 {{ todayEvents.length - 1 }} 项日程</p>
          </div>
        </div>

        <!-- 页面 2: 近期行程列表 -->
        <div v-else class="w-full h-full p-3 flex flex-col justify-start space-y-2 bg-black/10 text-white text-left">
          <h4 class="text-[10px] font-bold opacity-60 mb-1 uppercase">近期行程</h4>
          <div v-for="(event, index) in upcomingEvents" :key="index" class="flex flex-col border-l-2 border-white/30 pl-2 py-0.5">
            <span class="text-[10px] font-medium truncate">{{ event.title }}</span>
            <span class="text-[9px] opacity-60">{{ event.time }}</span>
          </div>
        </div>
      </template>
    </LiveTile>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LiveTile from '../components/LiveTile.vue';

// --- 静态日期信息 ---
const now = new Date();
const todayDate = now.getDate();
const currentMonthStr = now.toLocaleString('zh-CN', { month: 'long' });

// --- 数据同步逻辑 ---
interface CalendarEvent {
  id: string;
  dateStr: string;
  title: string;
  time: string;
}
const STORAGE_KEY = 'flyos_calendar_events';
const allEvents = ref<CalendarEvent[]>([]);

const loadEvents = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    allEvents.value = data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("未能加载或解析日历事件：", e);
    allEvents.value = [];
  }
};

onMounted(() => {
  loadEvents();
  // 监听来自其他标签页/窗口的更改
  window.addEventListener('storage', loadEvents);
  // 定期检查日期以处理午夜跨天的情况
  const timer = setInterval(loadEvents, 60000);
  onUnmounted(() => {
      window.removeEventListener('storage', loadEvents);
      clearInterval(timer);
  });
});

// --- 用于显示的计算属性 ---
const todayEvents = computed(() => {
  const todayStr = new Date().toDateString();
  return allEvents.value
    .filter(event => event.dateStr === todayStr)
    .map(e => ({ title: e.title, time: e.time }));
});

function formatRelativeTime(dateStr: string): string {
    const eventDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    const dayDiff = Math.floor((eventDate.getTime() - today.getTime()) / msPerDay);

    if (dayDiff === 1) return '明天';
    if (dayDiff > 1 && dayDiff <= 7) return eventDate.toLocaleString('zh-CN', { weekday: 'long' }).replace('星期','周');
    return `${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;
}

const upcomingEvents = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 获取从明天开始的事件
  return allEvents.value
    .filter(event => new Date(event.dateStr) > today)
    .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())
    .map(event => ({
      title: event.title,
      time: `${formatRelativeTime(event.dateStr)}${event.time === '全天' ? '' : ' ' + event.time}`.trim()
    }));
});

const calendarPages = computed(() => [
  { type: 'today', data: todayEvents.value },
  { type: 'upcoming', data: upcomingEvents.value }
]);
</script>
