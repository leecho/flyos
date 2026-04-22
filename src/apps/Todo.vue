<template>
  <div ref="containerRef" class="todo-app-container h-full w-full bg-[var(--fly-bg-primary)] overflow-hidden text-[var(--fly-text-primary)] flex flex-col font-sans">
    
    <!-- Main Responsive Layout Wrapper -->
    <div class="flex-1 flex overflow-hidden min-h-0 relative" :class="isSidebarVisible ? 'sidebar-open' : 'sidebar-closed'">
      
      <!-- Sidebar / Category Navigation (Desktop) -->
      <aside class="todo-sidebar w-[240px] pt-4 border-r border-[var(--fly-border-system)] flex flex-col bg-[var(--fly-bg-secondary)] shrink-0 transition-all duration-300 z-10">
        <nav class="flex-1 px-3 space-y-1">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="w-full flex items-center justify-between px-4 py-2.5 rounded-[var(--fly-radius-md)] transition-all duration-200 group relative"
            :class="activeCategory === cat.id ? 'bg-accent/10 text-accent font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100'"
          >
            <span v-if="activeCategory === cat.id" class="absolute left-0 w-1 h-4 bg-accent rounded-full"></span>
            <div class="flex items-center gap-3">
              <component :is="cat.icon" class="w-4.5 h-4.5" :class="activeCategory === cat.id ? '' : cat.color" stroke-width="2.5" />
              <span class="text-[13px] tracking-tight">{{ cat.name }}</span>
            </div>
            <span v-if="cat.count > 0" class="text-[10px] px-2 py-0.5 rounded-full font-black tracking-tighter" :class="activeCategory === cat.id ? 'bg-accent text-white' : 'bg-black/5 dark:bg-white/10 opacity-60'">
              {{ cat.count }}
            </span>
          </button>
        </nav>

        <div class="p-4 mt-auto">
          <div class="p-4 bg-black/5 dark:bg-white/5 rounded-[var(--fly-radius-md)] border border-[var(--fly-border-system)] flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-black">
              {{ userStore.user.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <div class="text-[11px] font-black truncate tracking-tight">{{ userStore.user.name }}</div>
              <div class="text-[9px] opacity-40 font-bold uppercase tracking-widest truncate">FlyOS Pro</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="todo-main flex-1 flex flex-col relative h-full min-w-0 overflow-hidden">
        <!-- Header -->
        <header class="h-16 shrink-0 flex items-center justify-between px-6 border-b border-[var(--fly-border-system)] bg-[var(--fly-bg-glass)] backdrop-blur-md sticky top-0 z-10 w-full animate-in fade-in slide-in-from-top-2">
          <div class="flex items-center gap-2">
            <button @click="toggleSidebar" class="p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 menu-toggle-btn desktop-only transition-colors">
              <Menu class="w-5 h-5" />
            </button>
            <h2 class="text-base font-black tracking-tighter truncate">{{ currentCategoryName }}</h2>
          </div>
          <div class="flex items-center gap-2 flex-1 justify-end">
            <!-- Search: Toggleable on mobile, fixed on desktop -->
            <div class="relative flex items-center" :class="isMobileSearchVisible ? 'flex-1' : ''">
              <button @click="isMobileSearchVisible = !isMobileSearchVisible" 
                      class="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 sm:hidden"
                      :class="isMobileSearchVisible ? 'hidden' : 'block'">
                <Search class="w-5 h-5 opacity-50" />
              </button>
              
              <div :class="isMobileSearchVisible ? 'flex w-full items-center gap-2 animate-in slide-in-from-right-4' : 'hidden sm:flex items-center relative group'">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 pointer-events-none" />
                <input 
                  v-model="searchQuery"
                  ref="searchInputRef"
                  type="text" 
                  placeholder="搜索任务..." 
                  class="bg-black/5 dark:bg-white/5 border border-transparent rounded-full py-2 pl-9 pr-10 text-[13px] focus:bg-[var(--fly-bg-primary)] focus:ring-2 focus:ring-accent/10 transition-all outline-none placeholder:opacity-20 font-bold"
                  :class="isMobileSearchVisible ? 'w-full' : 'w-48 focus:w-64'"
                />
                <button v-if="isMobileSearchVisible" @click="isMobileSearchVisible = false" class="p-1 -ml-9 z-10 rounded-full hover:bg-black/10 dark:hover:bg-white/10 sm:hidden">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button @click="clearCompleted" v-if="completedTodos.length > 0 && !isMobileSearchVisible" class="p-2 rounded-lg text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0" title="清理已完成">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </header>

        <!-- Todo List Scrollable Area -->
        <div class="todo-list-content flex-1 overflow-y-auto no-scrollbar custom-scrollbar p-6 sm:p-10 pb-32">
          <!-- Empty State -->
          <div v-if="filteredTodos.length === 0" class="h-full flex flex-col items-center justify-center space-y-6">
            <div class="w-24 h-24 rounded-[var(--fly-radius-lg)] bg-[var(--fly-bg-secondary)] flex items-center justify-center opacity-40 shadow-inner">
              <Inbox class="w-12 h-12" stroke-width="1.5" />
            </div>
            <div class="text-center">
              <h3 class="text-lg font-black tracking-tight">井井有条</h3>
              <p class="text-[11px] font-bold uppercase tracking-widest opacity-30 mt-1">当前没有待办任务</p>
            </div>
          </div>

          <!-- Groups -->
          <div v-else class="max-w-4xl mx-auto space-y-12">
            <!-- Pending -->
            <section v-if="pendingFiltered.length > 0">
              <div class="flex items-center gap-2 mb-6 px-1">
                <div class="w-1 h-3.5 bg-accent rounded-full"></div>
                <h3 class="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">待办事项 ({{ pendingFiltered.length }})</h3>
              </div>
              <transition-group name="todo-list" tag="div" class="space-y-3">
                <div v-for="todo in pendingFiltered" :key="todo.id" class="todo-card group">
                  <div class="flex items-center gap-5 p-5 bg-[var(--fly-bg-glass)] border border-[var(--fly-border-glass)] rounded-[var(--fly-radius-md)] shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                    <button @click="toggleTodo(todo.id)" class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all group/check shrink-0"
                            :class="todo.completed ? 'bg-accent border-accent' : 'border-[var(--fly-border-system)] hover:border-accent bg-transparent'">
                      <Check v-if="todo.completed" class="w-4 h-4 text-white" stroke-width="4" />
                      <Check v-else class="w-4 h-4 text-accent opacity-0 group-hover/check:opacity-100 transition-opacity" stroke-width="4" />
                    </button>
                    
                    <div class="flex-1 min-w-0" @dblclick="startEdit(todo)">
                      <input
                        v-if="editingId === todo.id"
                        ref="editInputRef"
                        v-model="editingText"
                        @keydown.enter.prevent="doneEdit"
                        @blur="doneEdit"
                        @keydown.esc.prevent="cancelEdit"
                        class="w-full bg-transparent focus:outline-none text-[var(--fly-text-primary)] font-bold text-base"
                      />
                      <p v-else class="text-base font-bold transition-all truncate tracking-tight" :class="todo.completed ? 'opacity-20 line-through' : 'opacity-90'">
                        {{ todo.text }}
                      </p>
                    </div>

                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button @click="toggleStar(todo.id)" class="p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
                              :class="todo.starred ? 'text-amber-500' : 'opacity-20 hover:opacity-100'">
                        <Star class="w-5 h-5" :fill="todo.starred ? 'currentColor' : 'none'" stroke-width="2.5" />
                      </button>
                      <button @click="deleteTodo(todo.id)" class="p-2 rounded-lg hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-colors">
                        <Trash2 class="w-5 h-5" stroke-width="2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </transition-group>
            </section>

            <!-- Completed -->
            <section v-if="completedFiltered.length > 0">
              <div class="flex items-center gap-2 mb-6 px-1">
                <div class="w-1 h-3.5 bg-black/10 dark:bg-white/10 rounded-full"></div>
                <h3 class="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">已完成 ({{ completedFiltered.length }})</h3>
              </div>
              <div class="space-y-3">
                 <div v-for="todo in completedFiltered" :key="todo.id" class="todo-card opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all">
                   <div class="flex items-center gap-5 p-4 bg-black/5 dark:bg-white/5 rounded-[var(--fly-radius-md)] border border-[var(--fly-border-system)] transition-all">
                      <button @click="toggleTodo(todo.id)" class="w-6 h-6 rounded-full bg-accent border-2 border-accent flex items-center justify-center shrink-0">
                        <Check class="w-4 h-4 text-white" stroke-width="4" />
                      </button>
                      <p class="flex-1 text-base font-bold line-through truncate tracking-tight opacity-40">{{ todo.text }}</p>
                      <button @click="deleteTodo(todo.id)" class="p-2 text-red-500/30 hover:text-red-500 transition-colors">
                        <Trash2 class="w-5 h-5" stroke-width="2.5" />
                      </button>
                   </div>
                 </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Input Area (Mobile: Stacked, Desktop: Floating) -->
        <div class="todo-input-wrapper z-40 transition-all animate-in slide-in-from-bottom-4">
          <div class="w-full max-w-2xl mx-auto bg-[var(--fly-bg-glass)] backdrop-blur-2xl border border-[var(--fly-border-glass)] rounded-[var(--fly-radius-lg)] p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 pointer-events-auto">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 shrink-0 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/30 transition-all active:scale-90">
                <Plus class="w-6 h-6" stroke-width="3" />
              </div>
              <input 
                v-model="newTodoText"
                @keydown.enter.prevent="addTodo"
                placeholder="在此输入新的待办事项..."
                class="flex-1 h-10 px-1 bg-transparent outline-none text-base font-bold placeholder:opacity-20"
              />
              <button 
                @click="addTodo"
                :disabled="!newTodoText.trim()"
                class="px-6 h-10 bg-accent hover:brightness-110 disabled:bg-black/5 dark:disabled:bg-white/5 text-white text-[13px] font-black rounded-xl transition-all shadow-lg shadow-accent/20 disabled:shadow-none disabled:text-black/20 dark:disabled:text-white/20"
              >
                添加
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Tab Bar (Mobile Only) -->
        <nav class="todo-bottom-nav bg-[var(--fly-bg-glass)] backdrop-blur-2xl border-t border-[var(--fly-border-system)] flex items-center justify-around px-2 z-30 hidden">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectCategory(cat.id)"
            class="flex flex-col items-center gap-1 transition-all flex-1 py-1"
            :class="activeCategory === cat.id ? 'text-accent font-black scale-105' : 'opacity-30'"
          >
            <component :is="cat.icon" class="w-5 h-5 flex-shrink-0" stroke-width="2.5" />
            <span class="text-[10px] font-bold tracking-tight">{{ cat.name }}</span>
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
import { userStore } from '@/stores/userStore';

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
const isSidebarVisible = ref(window.innerWidth >= 900);

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
  { id: 'all', name: '所有任务', icon: Inbox, color: 'text-blue-500', count: todos.value.length },
  { id: 'today', name: '今日计划', icon: Calendar, color: 'text-green-500', count: todos.value.filter(t => t.date === getTodayStr() && !t.completed).length },
  { id: 'starred', name: '特别关注', icon: Star, color: 'text-amber-500', count: todos.value.filter(t => t.starred && !t.completed).length },
  { id: 'completed', name: '已完成项', icon: CheckCircle2, color: 'text-slate-400', count: todos.value.filter(t => t.completed).length }
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
  user-select: none;
}

/* Default Desktop Floating Styles */
.todo-input-wrapper {
  position: absolute;
  bottom: 32px;
  left: 0;
  right: 0;
  padding-left: 32px;
  padding-right: 32px;
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
    background: var(--fly-bg-glass) !important;
    pointer-events: auto !important;
    border-top: 1px solid var(--fly-border-system);
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
  transition: all 0.4s cubic-bezier(0.2, 1, 0.3, 1);
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

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
