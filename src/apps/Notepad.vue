<template>
  <div class="notepad-app flex h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden font-sans">
    <div class="w-64 bg-gray-100/50 dark:bg-gray-800/50 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div class="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h2 class="font-bold text-xs uppercase tracking-wider opacity-60">我的笔记</h2>
        <button
          v-on:click="createNewNote"
          class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-accent"
          title="新建笔记"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div
          v-for="note in notes"
          v-bind:key="note.id"
          v-on:click="selectNote(note.id)"
          class="group p-3 rounded-lg cursor-pointer transition-all flex justify-between items-center"
          v-bind:class="activeNoteId === note.id ? 'bg-white dark:bg-gray-700 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'hover:bg-gray-200/50 dark:hover:bg-gray-700/30'"
        >
          <div class="flex flex-col overflow-hidden text-left">
            <span class="font-medium truncate text-sm leading-tight">{{ getNoteTitle(note) }}</span>
            <span class="text-[10px] opacity-40 truncate mt-1">{{ note.updatedAt }}</span>
          </div>
          <button
            v-on:click.stop="deleteNote(note.id)"
            class="opacity-0 group-hover:opacity-100 p-1 hover:text-accent transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="activeNote" class="flex-1 flex flex-col min-w-0">
      <div class="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 justify-between bg-white dark:bg-gray-900">
        <input
          v-model="activeNote.title"
          v-on:input="updateTimestamp"
          placeholder="笔记标题..."
          class="bg-transparent border-none outline-none font-semibold text-base w-2/3 focus:ring-0 placeholder:opacity-30"
        />
        <div class="flex items-center space-x-4 text-[10px] opacity-40 whitespace-nowrap">
          <span class="hidden sm:inline">字数: {{ getNoteContentLength() }}</span>
          <span>已自动保存</span>
        </div>
      </div>

      <textarea
        v-model="activeNote.content"
        v-on:input="updateTimestamp"
        placeholder="在此开始输入..."
        class="flex-1 p-8 outline-none resize-none text-base leading-relaxed bg-transparent w-full text-gray-700 dark:text-gray-300"
      ></textarea>
    </div>

    <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-4">
      <div class="p-8 bg-gray-100 dark:bg-gray-800 rounded-full opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      </div>
      <p class="text-sm">点击左侧笔记开始编辑</p>
      <button
        v-on:click="createNewNote"
        class="px-5 py-2 bg-accent hover:bg-accent/90 text-white rounded-full text-xs font-medium transition-all shadow-md active:scale-95"
      >
        新建第一条笔记
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const notes = ref<Note[]>([]);
const activeNoteId = ref<string | null>(null);

const activeNote = computed(() => {
  return notes.value.find(n => n.id === activeNoteId.value) || null;
});

onMounted(() => {
  const saved = localStorage.getItem('flyos_notepad_data');
  if (saved) {
    try {
      notes.value = JSON.parse(saved);
      if (notes.value.length > 0) {
        activeNoteId.value = notes.value[0].id;
      }
    } catch (e) {
      console.error('Failed to parse notes', e);
    }
  }
});

watch(notes, (newNotes) => {
  localStorage.setItem('flyos_notepad_data', JSON.stringify(newNotes));
}, { deep: true });

function selectNote(id: string) {
  activeNoteId.value = id;
}

function getNoteTitle(note: Note) {
  return note.title || '无标题笔记';
}

function getNoteContentLength() {
  return activeNote.value ? activeNote.value.content.length : 0;
}

function createNewNote() {
  const newNote: Note = {
    id: Date.now().toString(),
    title: '',
    content: '',
    updatedAt: new Date().toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  };
  notes.value.unshift(newNote);
  activeNoteId.value = newNote.id;
}

function deleteNote(id: string) {
  notes.value = notes.value.filter(n => n.id !== id);
  if (activeNoteId.value === id) {
    activeNoteId.value = notes.value.length > 0 ? notes.value[0].id : null;
  }
}

function updateTimestamp() {
  if (activeNote.value) {
    activeNote.value.updatedAt = new Date().toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}
</script>

<style scoped>
.notepad-app {
  user-select: text;
}
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(155, 155, 155, 0.2);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(155, 155, 155, 0.4);
}
</style>
