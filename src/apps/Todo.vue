<template>
  <div ref="containerRef" class="todo-app-container h-full w-full bg-slate-50/50 dark:bg-gray-950/50 backdrop-blur-3xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col font-sans">
    
    <!-- Main Responsive Layout Wrapper -->
    <div class="flex-1 flex overflow-hidden min-h-0 relative" :class="isSidebarVisible ? 'sidebar-open' : 'sidebar-closed'">
      
      <!-- Sidebar / Category Navigation (Desktop) -->
      <aside class="todo-sidebar w-[240px] pt-3 border-r border-slate-200/60 dark:border-white/10 flex flex-col bg-slate-100/50 dark:bg-gray-900/50 backdrop-blur-xl shrink-0 transition-all duration-300 z-10">
        <nav class="flex-1 px-3 space-y-1">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group"
            :class="activeCategory === cat.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'"
          >
            <div class="flex items-center gap-3">
              <component :is="cat.icon" class="w-4.5 h-4.5" :class="activeCategory === cat.id ? '' : cat.color" />
              <span class="text-sm font-bold">{{ cat.name }}</span>
            </div>
            <span v-if="cat.count > 0" class="text-[10px] px-1.5 py-0.5 rounded-full font-bold" :class="activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-200 dark:bg-gray-800 text-slate-500'">
              {{ cat.count }}
            </span>
          </button>
        </nav>

        <div class="p-4 mt-auto">
          <div class="p-3 bg-white/40 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              FL
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold truncate">FlyOS User</div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">普通用户</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="todo-main flex-1 flex flex-col relative h-full min-w-0 bg-white/20 dark:bg-transparent overflow-hidden">
        <!-- Header -->
        <header class="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-200/60 dark:border-white/10 backdrop-blur-md sticky top-0 z-10 w-full">
          <div class="flex items-center gap-2">
            <button @click="toggleSidebar" class="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 menu-toggle-btn desktop-only">
              <Menu class="w-4.5 h-4.5" />
            </button>
            <h2 class="text-lg font-black tracking-tight truncate">{{ currentCategoryName }}</h2>
          </div>
          <div class="flex items-center gap-2 flex-1 justify-end">
            <!-- Search: Toggleable on mobile, fixed on desktop -->
            <div class="relative flex items-center" :class="isMobileSearchVisible ? 'flex-1' : ''">
              <button @click="isMobileSearchVisible = !isMobileSearchVisible" 
                      class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 sm:hidden"
                      :class="isMobileSearchVisible ? 'hidden' : 'block'">
                <Search class="w-4.5 h-4.5 text-slate-500" />
              </button>
              
              <div :class="isMobileSearchVisible ? 'flex w-full items-center gap-2 animate-in slide-in-from-right-4' : 'hidden sm:flex items-center relative group'">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input 
                  v-model="searchQuery"
                  ref="searchInputRef"
                  type="text" 
                  placeholder="搜索任务..." 
                  class="bg-slate-100/50 dark:bg-white/5 border border-transparent rounded-full py-1.5 pl-9 pr-10 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-accent/20 transition-all outline-none placeholder:text-slate-400 font-medium"
                  :class="isMobileSearchVisible ? 'w-full' : 'w-48 focus:w-64'"
                />
                <button v-if="isMobileSearchVisible" @click="isMobileSearchVisible = false" class="p-1 -ml-9 z-10 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 sm:hidden">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button @click="clearCompleted" v-if="completedTodos.length > 0 && !isMobileSearchVisible" class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0" title="清理已完成">
              <Trash2 class="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        <!-- Todo List Scrollable Area -->
        <div class="todo-list-content flex-1 overflow-y-auto no-scrollbar custom-scrollbar p-4 sm:p-6 pb-24 sm:pb-32">
          <!-- Empty State -->
          <div v-if="filteredTodos.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 py-12">
            <div class="w-20 h-20 mb-6 rounded-3xl bg-slate-100/50 dark:bg-white/5 flex items-center justify-center">
              <Inbox class="w-10 h-10 opacity-20" />
            </div>
            <h3 class="text-lg font-bold tracking-tight">还没有任务</h3>
            <p class="text-xs font-medium opacity-60">在下方输入框开始记录你的第一条任务吧</p>
          </div>

          <!-- Groups -->
          <div v-else class="max-w-4xl mx-auto space-y-8">
            <!-- Pending -->
            <section v-if="pendingFiltered.length > 0">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-3.5 bg-accent rounded-full"></div>
                <h3 class="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">待办中的事项</h3>
              </div>
              <transition-group name="todo-list" tag="div" class="space-y-3">
                <div v-for="todo in pendingFiltered" :key="todo.id" class="todo-card group">
                  <div class="flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-900/60 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-300">
                    <button @click="toggleTodo(todo.id)" class="w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all group/check"
                            :class="todo.completed ? 'bg-accent border-accent' : 'border-slate-300 dark:border-slate-600 hover:border-accent bg-transparent'">
                      <Check v-if="todo.completed" class="w-3.5 h-3.5 text-white" stroke-width="4" />
                      <Check v-else class="w-3.5 h-3.5 text-accent opacity-0 group-hover/check:opacity-100 transition-opacity" stroke-width="4" />
                    </button>
                    
                    <div class="flex-1 min-w-0" @dblclick="startEdit(todo)">
                      <input
                        v-if="editingId === todo.id"
                        ref="editInputRef"
                        v-model="editingText"
                        @keydown.enter.prevent="doneEdit"
                        @blur="doneEdit"
                        @keydown.esc.prevent="cancelEdit"
                        class="w-full bg-transparent focus:outline-none text-slate-900 dark:text-white font-bold text-[15px]"
                      />
                      <p v-else class="text-[15px] font-bold transition-all truncate" :class="todo.completed ? 'text-slate-400 line-through opacity-50' : 'text-slate-700 dark:text-slate-200'">
                        {{ todo.text }}
                      </p>
                    </div>

                    <div class="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="toggleStar(todo.id)" class="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                              :class="todo.starred ? 'text-amber-500' : 'text-slate-400'">
                        <Star class="w-4 h-4" :fill="todo.starred ? 'currentColor' : 'none'" />
                      </button>
                      <button @click="deleteTodo(todo.id)" class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </transition-group>
            </section>

            <!-- Completed -->
            <section v-if="completedFiltered.length > 0">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-3.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                <h3 class="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">已完成</h3>
              </div>
              <div class="space-y-3 opacity-60">
                 <div v-for="todo in completedFiltered" :key="todo.id" class="todo-card">
                   <div class="flex items-center gap-4 p-3.5 bg-white/40 dark:bg-gray-900/30 rounded-2xl border border-slate-200/40 dark:border-white/5 transition-all">
                      <button @click="toggleTodo(todo.id)" class="w-5.5 h-5.5 rounded-full bg-accent border-2 border-accent flex items-center justify-center">
                        <Check class="w-3.5 h-3.5 text-white" stroke-width="4" />
                      </button>
                      <p class="flex-1 text-[15px] font-bold text-slate-400 line-through truncate">{{ todo.text }}</p>
                      <button @click="deleteTodo(todo.id)" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 class="w-4 h-4" />
                      </button>
                   </div>
                 </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Input Area (Mobile: Stacked, Desktop: Floating) -->
        <div class="todo-input-wrapper z-40">
          <div class="w-full max-w-2xl mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-1.5 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 pointer-events-auto">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 shrink-0 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/30 transition-transform active:scale-95">
                <Plus class="w-5 h-5" />
              </div>
              <input 
                v-model="newTodoText"
                @keydown.enter.prevent="addTodo"
                placeholder="添加新任务..."
                class="flex-1 h-9 px-2 bg-transparent outline-none text-[13px] font-bold placeholder:text-slate-400"
              />
              <button 
                @click="addTodo"
                :disabled="!newTodoText.trim()"
                class="px-4 h-9 bg-accent hover:brightness-110 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white text-[12px] font-black rounded-xl transition-all shadow-md shadow-accent/20 disabled:shadow-none"
              >
                添加
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Tab Bar (Mobile Only) -->
        <nav class="todo-bottom-nav bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 flex items-center justify-around px-2 z-30 hidden">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="flex flex-col items-center gap-1 transition-all flex-1 py-1"
            :class="activeCategory === cat.id ? 'text-accent scale-105' : 'text-slate-400'"
          >
            <component :is="cat.icon" class="w-5 h-5 flex-shrink-0" />
            <span class="text-[10px] font-black tracking-tight">{{ cat.name }}</span>
          </button>
        </nav>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { 
  Menu, Search, Trash2, Plus, Star, Check, 
  Inbox, Calendar, ListTodo, CheckCircle2, X
} from 'lucide-vue-next';

// --- Interfaces ---
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  starred: boolean;
  date: string; 
}

// --- State ---
const STORAGE_KEY = 'flyos-todo-v2';
const todos = ref<Todo[]>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
const newTodoText = ref('');
const searchQuery = ref('');
const isMobileSearchVisible = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);
const activeCategory = ref('all');
const containerRef = ref<HTMLElement | null>(null);

// 初始侧边栏状态
const isSidebarVisible = ref(window.innerWidth >= 800);

const toggleSidebar = () => isSidebarVisible.value = !isSidebarVisible.value;

const selectCategory = (id: string) => {
  activeCategory.value = id;
};

watch(activeCategory, () => {
  isMobileSearchVisible.value = false;
});

// Auto-focus search input 
watch(isMobileSearchVisible, (val) => {
  if (val) nextTick(() => searchInputRef.value?.focus());
});

// State for editing
const editingId = ref<number | null>(null);
const editingText = ref('');
const editInputRef = ref<HTMLInputElement | null>(null);

// --- Categories ---
const categories = computed(() => [
  { id: 'all', name: '所有', icon: Inbox, color: 'text-blue-500', count: todos.value.length },
  { id: 'today', name: '今天', icon: Calendar, color: 'text-green-500', count: todos.value.filter(t => t.date === getTodayStr() && !t.completed).length },
  { id: 'starred', name: '星标', icon: Star, color: 'text-amber-500', count: todos.value.filter(t => t.starred && !t.completed).length },
  { id: 'completed', name: '已完成', icon: CheckCircle2, color: 'text-slate-400', count: todos.value.filter(t => t.completed).length }
]);

const currentCategoryName = computed(() => {
  return categories.value.find(c => c.id === activeCategory.value)?.name || '';
});

const completedTodos = computed(() => todos.value.filter(t => t.completed));
const pendingTodos = computed(() => todos.value.filter(t => !t.completed));

// --- Filtering ---
const filteredTodos = computed(() => {
  let list = todos.value;
  if (activeCategory.value === 'today') list = list.filter(t => t.date === getTodayStr());
  else if (activeCategory.value === 'starred') list = list.filter(t => t.starred);
  else if (activeCategory.value === 'completed') list = list.filter(t => t.completed);

  const q = searchQuery.value.toLowerCase().trim();
  if (q) list = list.filter(t => t.text.toLowerCase().includes(q));
  return list;
});

const pendingFiltered = computed(() => filteredTodos.value.filter(t => !t.completed));
const completedFiltered = computed(() => filteredTodos.value.filter(t => t.completed));

// --- Persistance ---
watch(todos, (newTodos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
}, { deep: true });

// --- Utils ---
function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// --- Actions ---
const addTodo = () => {
  const text = newTodoText.value.trim();
  if (!text) return;

  const newTodo: Todo = {
    id: Date.now(),
    text,
    completed: false,
    starred: activeCategory.value === 'starred',
    date: getTodayStr()
  };

  todos.value.unshift(newTodo);
  newTodoText.value = '';
};

const toggleTodo = (id: number) => {
  const todo = todos.value.find(t => t.id === id);
  if (todo) todo.completed = !todo.completed;
};

const toggleStar = (id: number) => {
  const todo = todos.value.find(t => t.id === id);
  if (todo) todo.starred = !todo.starred;
};

const deleteTodo = (id: number) => {
  todos.value = todos.value.filter(t => t.id !== id);
};

const clearCompleted = () => {
  todos.value = todos.value.filter(t => !t.completed);
};

// --- Editing ---
const startEdit = (todo: Todo) => {
  editingId.value = todo.id;
  editingText.value = todo.text;
  nextTick(() => editInputRef.value?.focus());
};

const doneEdit = () => {
  if (!editingId.value) return;
  const todo = todos.value.find(t => t.id === editingId.value);
  const newText = editingText.value.trim();
  if (todo) {
    if (newText) todo.text = newText;
    else deleteTodo(todo.id);
  }
  editingId.value = null;
};

const cancelEdit = () => editingId.value = null;
</script>

<style scoped>
.todo-app-container {
  container-type: inline-size;
  container-name: todo-app;
}

/* Default Desktop Floating Styles */
.todo-input-wrapper {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  padding-left: 24px;
  padding-right: 24px;
  pointer-events: none;
}

.todo-bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
}

/* Response Layout Logic */
@container todo-app (min-width: 651px) {
  .todo-sidebar {
    display: flex !important;
    transform: translateX(0) !important;
    position: relative !important;
  }
  .todo-main {
    display: flex !important;
  }
}

/* IMPORTANT: Mobile Stacked Layout */
@container todo-app (max-width: 650px) {
  .desktop-only {
    display: none !important;
  }
  
  .todo-sidebar {
    display: none !important;
  }

  .todo-main {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    height: 100% !important;
  }

  .todo-list-content {
    flex: 1 !important;
    padding-bottom: 0.5rem !important;
  }

  .todo-input-wrapper {
    position: relative !important;
    bottom: auto !important;
    padding: 0.75rem 1rem !important;
    background: rgba(255, 255, 255, 0.8) !important;
    pointer-events: auto !important;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
  .dark .todo-input-wrapper {
    background: rgba(15, 23, 42, 0.8) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .todo-bottom-nav {
    display: flex !important;
    position: relative !important;
    height: 64px !important;
    flex-shrink: 0 !important;
  }
}

/* Animations */
.todo-list-move,
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.todo-list-enter-from,
.todo-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
.todo-list-leave-active {
  position: absolute;
  width: 100%;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(155, 155, 155, 0.2);
  border-radius: 10px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
