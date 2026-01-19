<template>
  <div class="h-full flex flex-col bg-slate-100/80 dark:bg-gray-900/80 font-sans backdrop-blur-2xl">
    <!-- Header -->
    <header class="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-slate-200/80 dark:border-gray-700/60">
      <div class="text-md font-semibold text-slate-800 dark:text-slate-100">待办清单</div>
      <button 
        v-if="completedTodos.length > 0"
        @click="clearCompleted" 
        class="text-xs text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors duration-300"
      >
        清空已完成
      </button>
    </header>

    <!-- Add Todo Input -->
    <div class="flex-shrink-0 p-4">
      <input
        type="text"
        v-model="newTodoText"
        @keydown.enter.prevent="addTodo"
        placeholder="添加新任务，按 Enter 键确认"
        class="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-blue-500/80 transition-all duration-300 shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
    </div>

    <!-- Todo Lists -->
    <div class="flex-grow px-4 pb-4 overflow-y-auto custom-scrollbar">
      <!-- Empty State -->
      <div v-if="todos.length === 0" class="h-full flex flex-col justify-center items-center text-slate-400 dark:text-slate-500 text-center select-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-40"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <p class="font-medium">列表为空</p>
        <p class="text-sm">开始添加你的第一个任务吧！</p>
      </div>

      <div v-else>
        <!-- Pending Todos -->
        <h2 v-if="pendingTodos.length > 0" class="px-2 mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 select-none">待办</h2>
        <transition-group name="list" tag="ul" class="space-y-2">
          <li v-for="todo in pendingTodos" :key="todo.id" class="todo-item">
            <div 
              class="group flex items-center p-3.5 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80"
              :class="{ 'opacity-50': todo.completed, 'editing': editingTodo && todo.id === editingTodo.id }"
            >
               <label class="flex-shrink-0 relative cursor-pointer">
                <input type="checkbox" :checked="todo.completed" @change="toggleTodo(todo.id)" class="sr-only peer">
                <span class="w-5 h-5 rounded-md flex items-center justify-center bg-slate-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-all duration-200 peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/50">
                  <svg v-show="todo.completed" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="transition-opacity duration-200"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
              </label>
              <div class="flex-grow mx-3" @dblclick="startEdit(todo)">
                <input
                  v-if="editingTodo && todo.id === editingTodo.id"
                  ref="editInputRef"
                  v-model="editingText"
                  @keydown.enter.prevent="doneEdit"
                  @blur="doneEdit"
                  @keydown.esc.prevent="cancelEdit"
                  class="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
                />
                <span v-else class="text-slate-700 dark:text-slate-300 transition-colors select-none" :class="{ 'line-through text-slate-400 dark:text-slate-500': todo.completed }">
                  {{ todo.text }}
                </span>
              </div>
              <button @click="deleteTodo(todo.id)" class="flex-shrink-0 text-gray-400/80 hover:text-red-500/90 transition-colors opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </li>
        </transition-group>

        <!-- Completed Todos -->
        <h2 v-if="completedTodos.length > 0" class="px-2 mt-6 text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 select-none">已完成</h2>
        <transition-group name="list-completed" tag="ul" class="space-y-2">
          <li v-for="todo in completedTodos" :key="todo.id" class="todo-item">
             <div 
              class="group flex items-center p-3.5 bg-white/60 dark:bg-gray-800/60 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/80"
              :class="{ 'opacity-50': todo.completed, 'editing': editingTodo && todo.id === editingTodo.id }"
            >
              <label class="flex-shrink-0 relative cursor-pointer">
                <input type="checkbox" :checked="todo.completed" @change="toggleTodo(todo.id)" class="sr-only peer">
                <span class="w-5 h-5 rounded-md flex items-center justify-center bg-slate-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-all duration-200 peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/50">
                  <svg v-show="todo.completed" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="transition-opacity duration-200"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
              </label>
              <div class="flex-grow mx-3" @dblclick="startEdit(todo)">
                <input
                  v-if="editingTodo && todo.id === editingTodo.id"
                  ref="editInputRef"
                  v-model="editingText"
                  @keydown.enter.prevent="doneEdit"
                  @blur="doneEdit"
                  @keydown.esc.prevent="cancelEdit"
                  class="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
                />
                <span v-else class="text-slate-700 dark:text-slate-300 transition-colors select-none" :class="{ 'line-through text-slate-400 dark:text-slate-500': todo.completed }">
                  {{ todo.text }}
                </span>
              </div>
              <button @click="deleteTodo(todo.id)" class="flex-shrink-0 text-gray-400/80 hover:text-red-500/90 transition-colors opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </li>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

// --- Interfaces & Types ---
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// --- Reactive State ---
const STORAGE_KEY = 'flyos-todo-app';
const todos = ref<Todo[]>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
const newTodoText = ref('');

// State for editing
const editingId = ref<number | null>(null);
const editingText = ref('');
const editInputRef = ref<HTMLInputElement | null>(null);

// --- Computed Properties ---
const pendingTodos = computed(() => todos.value.filter(t => !t.completed));
const completedTodos = computed(() => todos.value.filter(t => t.completed));

// --- Watchers for Persistence ---
watch(todos, (newTodos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
}, { deep: true });

// --- Methods ---
const addTodo = (event: KeyboardEvent) => {
  if ((event as any).isComposing) return;
  const text = newTodoText.value.trim();
  if (text) {
    todos.value.unshift({ id: Date.now(), text, completed: false });
    newTodoText.value = '';
  }
};

const toggleTodo = (id: number) => {
  const todo = todos.value.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
};

const deleteTodo = (id: number) => {
  todos.value = todos.value.filter(t => t.id !== id);
};

const clearCompleted = () => {
  todos.value = todos.value.filter(t => !t.completed);
};

const startEdit = (todo: Todo) => {
  editingId.value = todo.id;
  editingText.value = todo.text;
  nextTick(() => {
    editInputRef.value?.focus();
  });
};

const doneEdit = (event: Event) => {
  if ((event as any).isComposing) return;
  if (!editingId.value) return;
  
  const todo = todos.value.find(t => t.id === editingId.value);
  const newText = editingText.value.trim();

  if (todo) {
    if (newText) {
      todo.text = newText;
    } else {
      deleteTodo(todo.id);
    }
  }

  editingId.value = null;
  editingText.value = '';
};

const cancelEdit = () => {
  editingId.value = null;
  editingText.value = '';
};

</script>

<style scoped>
/* List transition animations */
.list-enter-active,
.list-leave-active,
.list-completed-enter-active,
.list-completed-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}
.list-leave-active {
  position: absolute; 
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.4);
}

/* Edit state styling */
.todo-item .editing {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.7);
}
</style>
