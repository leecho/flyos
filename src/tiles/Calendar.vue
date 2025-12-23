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
import { ref, computed } from 'vue';
import LiveTile from '../components/LiveTile.vue';

// 模拟日期数据
const now = new Date();
const todayDate = now.getDate();
const currentMonthStr = now.toLocaleString('zh-CN', { month: 'long' });

// 模拟日程数据
const todayEvents = ref([
  { title: '产品迭代会议', time: '14:00' },
  { title: '健身房训练', time: '18:30' }
]);

const upcomingEvents = ref([
  { title: '牙医预约', time: '明天 10:00' },
  { title: '朋友聚餐', time: '周四 19:00' },
  { title: 'FlyOS 周会', time: '下周一' }
]);

const calendarPages = computed(() => [
  { type: 'today', data: todayEvents.value },
  { type: 'upcoming', data: upcomingEvents.value }
]);
</script>
