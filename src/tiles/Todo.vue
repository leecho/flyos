<template>
  <!-- Main container, assuming parent provides background color. Text is white for better contrast on colored tiles. -->
  <div class="w-full h-full p-4 flex flex-col text-white overflow-hidden">

    <!-- ===== Small View: Just the count or a checkmark ===== -->
    <div class="view-small h-full flex-col justify-center items-center text-center">
      <div v-if="pendingCount === 0" class="flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-90"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span class="mt-2 text-xs font-medium opacity-80">已完成</span>
      </div>
      <div v-else class="flex flex-col justify-center items-center">
        <span class="text-4xl font-bold tracking-tight">{{ pendingCount }}</span>
        <span class="mt-1 text-xs font-medium opacity-80">待办</span>
      </div>
    </div>

    <!-- ===== Medium View ===== -->
    <div class="view-medium h-full flex-col">
      <header class="flex-shrink-0 mb-3 flex justify-between items-center">
        <h3 class="font-semibold">待办事项</h3>
        <div v-if="pendingCount > 0" class="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
          {{ pendingCount }}
        </div>
      </header>
      <div class="flex-grow overflow-hidden flex flex-col">
        <div v-if="pendingCount === 0" class="flex-grow flex flex-col justify-center items-center text-center opacity-80 select-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <p class="font-medium">全部完成！</p>
        </div>
        <div v-else class="flex flex-col h-full">
          <ul class="flex-grow space-y-2.5 overflow-hidden">
            <li v-for="todo in pendingTodos.slice(0, 2)" :key="todo.id" class="flex items-center gap-2.5">
              <span class="flex-shrink-0 w-1.5 h-1.5 mt-0.5 bg-white/60 rounded-full"></span>
              <span class="truncate text-sm opacity-90">{{ todo.text }}</span>
            </li>
          </ul>
          <div v-if="pendingCount > 2" class="flex-shrink-0 text-right text-xs opacity-70 mt-1">
            ...还有 {{ pendingCount - 2 }} 项
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Large View ===== -->
    <div class="view-large h-full flex-col">
       <header class="flex-shrink-0 mb-3 flex justify-between items-center">
        <h3 class="font-semibold">待办事项</h3>
        <div v-if="pendingCount > 0" class="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
          {{ pendingCount }}
        </div>
      </header>
      <div class="flex-grow overflow-hidden flex flex-col">
        <div v-if="pendingCount === 0" class="flex-grow flex flex-col justify-center items-center text-center opacity-80 select-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <p class="font-medium">全部完成！</p>
        </div>
        <div v-else class="flex flex-col h-full">
          <ul class="flex-grow space-y-2 overflow-hidden">
             <li v-for="todo in pendingTodos.slice(0, 4)" :key="todo.id" class="flex items-center gap-3">
               <span class="flex-shrink-0 w-4 h-4 mt-0.5 border-2 border-white/50 rounded-md"></span>
               <span class="truncate text-sm opacity-90">{{ todo.text }}</span>
            </li>
          </ul>
          <div v-if="pendingCount > 4" class="flex-shrink-0 text-right text-xs opacity-70 mt-1">
            ...还有 {{ pendingCount - 4 }} 项
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'flyos-todo-app';
const todos = ref<Todo[]>([]);

const pendingTodos = computed(() => todos.value.filter(t => !t.completed));
const pendingCount = computed(() => pendingTodos.value.length);

const loadTodos = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  todos.value = data ? JSON.parse(data) : [];
};

const handleStorageChange = (event: StorageEvent) => {
  if (event.key === STORAGE_KEY) {
    loadTodos();
  }
};

onMounted(() => {
  loadTodos();
  window.addEventListener('storage', handleStorageChange);
});

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
});
</script>

<style scoped>
.view-small,
.view-medium,
.view-large {
  display: none;
}

.tile-small .view-small,
.tile-medium .view-medium,
.tile-large .view-large {
  display: flex;
}
</style>
