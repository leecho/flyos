<template>
  <div ref="containerRef" class="mail-app-container h-full w-full bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden">
    
    <div class="mail-layout-content-wrapper flex flex-1 overflow-hidden relative">
      
      <!-- 1. Left Sidebar Navigation (Desktop Only) -->
      <aside class="mail-sidebar w-64 border-r border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-gray-900/50 backdrop-blur-xl flex flex-col p-4 shrink-0 overflow-y-auto">
        <div class="p-3 mb-6">
          <button
            @click="isComposing = true"
            class="w-full py-2.5 bg-accent hover:brightness-110 text-white rounded-xl shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm font-black tracking-tight"
          >
            <Plus class="w-4.5 h-4.5" />
            <span>撰写邮件</span>
          </button>
        </div>

        <nav class="flex-1 space-y-1">
          <button
            v-for="folder in folders"
            :key="folder.id"
            @click="currentFolder = folder.id"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative"
            :class="currentFolder === folder.id
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 font-medium'"
          >
            <component :is="folder.icon" class="w-4.5 h-4.5" />
            <span class="text-[13px] font-bold">{{ folder.name }}</span>
            <span v-if="folder.unread" class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  :class="currentFolder === folder.id ? 'bg-white/20' : 'bg-accent/10 text-accent'">
              {{ folder.unread }}
            </span>
          </button>
        </nav>
      </aside>

      <!-- 2. Middle Mail List (Visible on Desktop OR on Mobile List View) -->
      <div class="mail-list-panel w-full md:w-[360px] lg:w-[400px] flex flex-col border-r border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-transparent shrink-0">
        <header class="h-16 flex items-center px-4 sm:px-6 border-b border-slate-200/40 dark:border-white/5 shrink-0 backdrop-blur-md sticky top-0 z-10 w-full justify-between">
          <h2 class="text-base font-black tracking-tight desktop-only">邮件列表</h2>
          <h2 class="text-base font-black tracking-tight mobile-only">{{ currentFolderName }}</h2>
          
          <div class="flex items-center gap-2">
            <div class="relative group">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索..."
                class="w-32 focus:w-48 sm:w-48 bg-slate-100/50 dark:bg-white/5 border border-transparent rounded-full py-1.5 pl-9 pr-4 text-xs outline-none focus:bg-white dark:focus:bg-gray-800 transition-all font-medium ring-accent/20 focus:ring-2"
              />
            </div>
            <button @click="isComposing = true" class="mobile-only p-2 bg-accent text-white rounded-full shadow-lg shadow-accent/20 transition-transform active:scale-95">
              <Plus class="w-4 h-4" />
            </button>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto custom-scrollbar bg-white/20 dark:bg-transparent">
          <div
            v-for="mail in filteredMails"
            :key="mail.id"
            @click="selectMail(mail.id)"
            class="mail-item p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 cursor-pointer transition-all duration-300 relative group"
            :class="[
              selectedMailId === mail.id ? 'bg-accent/5 ring-1 ring-inset ring-accent/10' : 'hover:bg-slate-50 dark:hover:bg-white/5',
              !mail.read ? 'before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:bg-accent before:rounded-r-full' : ''
            ]"
          >
            <div class="flex justify-between items-start mb-1.5">
              <span class="text-[13px] font-black truncate pr-4" :class="!mail.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 font-bold'">{{ mail.from }}</span>
              <span class="text-[10px] font-bold opacity-30 mt-0.5 shrink-0">{{ mail.time }}</span>
            </div>
            <h4 class="text-xs font-black mb-1.5 truncate leading-tight" :class="!mail.read ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500'">{{ mail.subject }}</h4>
            <p class="text-[11px] font-medium opacity-50 line-clamp-2 leading-relaxed">{{ mail.preview }}</p>

            <div class="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex gap-2">
                <button @click.stop="toggleStar(mail.id)" class="p-1 px-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors">
                  <Star class="w-3.5 h-3.5" :fill="mail.starred ? 'currentColor' : 'none'" />
                </button>
                <button @click.stop="deleteMail(mail.id)" class="p-1 px-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
              <span v-if="mail.attachment" class="opacity-20">
                <Paperclip class="w-3 h-3" stroke-width="3" />
              </span>
            </div>
          </div>
          <div v-if="filteredMails.length === 0" class="py-20 text-center opacity-30">
             <Inbox class="w-12 h-12 mx-auto mb-4 opacity-50" />
             <p class="text-sm font-bold">没有查找到邮件</p>
          </div>
        </div>
      </div>

      <!-- 3. Right Content Detail (Overlay on Mobile) -->
      <div class="mail-detail-panel flex-1 flex flex-col bg-white dark:bg-gray-950 transition-all duration-300 transform" 
           :class="[
             isMobile && selectedMailId ? 'mobile-visible translate-x-0' : '',
             isMobile && !selectedMailId ? 'mobile-hidden translate-x-full' : ''
           ]">
        <div v-if="selectedMail" class="h-full flex flex-col overflow-hidden">
          <!-- Toolbar -->
          <header class="h-16 px-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 backdrop-blur-md">
            <div class="flex items-center gap-3">
              <button @click="selectedMailId = null" class="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 mobile-only">
                <ChevronLeft class="w-5 h-5" />
              </button>
              <div class="flex items-center gap-1">
                <button @click="deleteMail(selectedMail.id)" class="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-all" title="删除">
                  <Trash2 class="w-4.5 h-4.5" />
                </button>
                <button class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-all" title="标为未读">
                  <MailIcon class="w-4.5 h-4.5" />
                </button>
                <button @click="toggleStar(selectedMail.id)" class="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" :class="selectedMail.starred ? 'text-amber-500' : 'text-slate-500'">
                  <Star class="w-4.5 h-4.5" :fill="selectedMail.starred ? 'currentColor' : 'none'" />
                </button>
              </div>
            </div>
            <div class="flex items-center gap-2">
               <!-- More actions -->
            </div>
          </header>

          <!-- Email Content -->
          <div class="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
            <h2 class="text-xl sm:text-3xl font-black mb-8 leading-tight tracking-tighter">{{ selectedMail.subject }}</h2>

            <div class="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-white/5">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-3xl bg-accent/10 flex items-center justify-center text-accent text-lg font-black shadow-inner shadow-accent/10">
                  {{ selectedMail.from.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-4 min-w-0">
                  <p class="text-sm font-black truncate">{{ selectedMail.from }}</p>
                  <p class="text-[11px] font-bold opacity-40">发送至: 我 &lt;user@flyos.dev&gt;</p>
                </div>
              </div>
              <div class="text-[10px] font-bold opacity-30 text-right shrink-0">
                {{ selectedMail.fullTime || selectedMail.time }}
              </div>
            </div>

            <div class="prose dark:prose-invert max-w-none text-[15px] leading-loose font-medium opacity-90 whitespace-pre-wrap">
              {{ selectedMail.content || selectedMail.preview }}
            </div>
            
            <!-- Dummy Attachments -->
            <div v-if="selectedMail.attachment" class="mt-12 pt-12 border-t border-slate-100 dark:border-white/5">
              <h4 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">附件 (1)</h4>
              <div class="flex flex-wrap gap-4">
                 <div class="p-3 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-3 cursor-pointer hover:bg-accent/5 hover:border-accent/20 transition-all">
                    <FileText class="w-8 h-8 text-accent" />
                    <div>
                      <div class="text-xs font-bold">flyos_report.pdf</div>
                      <div class="text-[10px] opacity-40 font-bold">12.4 MB</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center opacity-20 p-10 text-center">
          <div class="w-24 h-24 rounded-[40px] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
            <MailIcon class="w-10 h-10" stroke-width="1.5" />
          </div>
          <h3 class="text-lg font-black tracking-tight mb-2">选择一封邮件</h3>
          <p class="text-sm font-medium max-w-xs">在这里可以查阅完整的历史邮件详情及附件信息。</p>
        </div>
      </div>

    </div>

    <!-- 4. Mobile Bottom Nav -->
    <nav class="mail-bottom-nav absolute bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 flex items-center justify-around px-2 z-50 hidden">
      <button
        v-for="folder in mobileFolders"
        :key="folder.id"
        @click="currentFolder = folder.id; selectedMailId = null"
        class="flex flex-col items-center gap-1 transition-all flex-1 py-1"
        :class="currentFolder === folder.id ? 'text-accent scale-105' : 'text-slate-400'"
      >
        <component :is="folder.icon" class="w-5 h-5 flex-shrink-0" />
        <span class="text-[10px] font-black tracking-tight">{{ folder.name }}</span>
      </button>
    </nav>

    <!-- 5. Compose Mail Modal -->
    <div v-if="isComposing" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
      <div class="bg-white dark:bg-gray-900 w-full max-w-2xl h-full sm:h-auto sm:max-h-[80vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-gray-900/50 backdrop-blur-sm">
          <h3 class="font-black tracking-tight text-lg">新邮件</h3>
          <button @click="isComposing = false" class="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-all">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 custom-scrollbar">
          <div class="space-y-4">
            <div class="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 py-1">
              <span class="text-xs font-bold text-slate-400 w-12 lowercase">收件人</span>
              <input type="text" class="flex-1 bg-transparent outline-none text-sm font-bold" />
            </div>
            <div class="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 py-1">
              <span class="text-xs font-bold text-slate-400 w-12 lowercase">主题</span>
              <input type="text" class="flex-1 bg-transparent outline-none text-sm font-bold" />
            </div>
          </div>
          <textarea placeholder="想写点什么..." class="w-full h-48 sm:h-64 bg-transparent resize-none outline-none text-sm leading-loose font-medium placeholder:opacity-30"></textarea>
        </div>
        <div class="px-8 py-5 bg-slate-50 dark:bg-gray-900/50 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
          <button @click="isComposing = false" class="hidden sm:inline-flex px-6 py-2.5 rounded-xl text-sm font-bold opacity-50 hover:bg-slate-200 dark:hover:bg-white/5 transition-all">取消</button>
          <button @click="isComposing = false" class="flex-1 sm:flex-none px-10 py-2.5 bg-accent hover:brightness-110 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-accent/20 active:scale-95">
            发送邮件
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw, onUnmounted } from 'vue';
import {
  Inbox, Send, FileText, Star, Trash2, AlertCircle, Plus, Search, Paperclip, ChevronLeft, Mail as MailIcon, X, MoreVertical
} from 'lucide-vue-next';

interface Mail {
  id: string;
  from: string;
  subject: string;
  preview: string;
  content?: string;
  time: string;
  fullTime?: string;
  read: boolean;
  starred: boolean;
  folder: string;
  attachment?: boolean;
}

const containerRef = ref<HTMLElement | null>(null);
const currentFolder = ref('inbox');
const selectedMailId = ref<string | null>(null);
const isComposing = ref(false);
const searchQuery = ref('');
const containerWidth = ref(1000);

// --- Window Size Simulation via Container Query (Simplified with element size sensor) ---
const updateSize = () => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth;
  }
};

const isMobile = computed(() => containerWidth.value < 700);

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.value);
    updateSize();
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

const folders = ref([
  { id: 'inbox', name: '收件箱', icon: markRaw(Inbox), unread: 2 },
  { id: 'starred', name: '星标邮件', icon: markRaw(Star), unread: 0 },
  { id: 'sent', name: '已发送', icon: markRaw(Send), unread: 0 },
  { id: 'drafts', name: '草稿箱', icon: markRaw(FileText), unread: 1 },
  { id: 'trash', name: '垃圾箱', icon: markRaw(Trash2), unread: 0 },
]);

const mobileFolders = computed(() => [
  folders.value[0], // Inbox
  folders.value[1], // Starred
  folders.value[2], // Sent
  folders.value[4], // Trash
]);

const currentFolderName = computed(() => {
  return folders.value.find(f => f.id === currentFolder.value)?.name || '';
});

const mails = ref<Mail[]>([
  {
    id: '1',
    from: 'GitHub',
    subject: '[FlyOS] 收到一个新的 Pull Request',
    preview: '用户 fly-admin 提交了关于“磁贴动画优化”的代码更改。',
    content: '你好，\n\n用户 fly-admin 最近为你的项目 flyos 提交了一个新的 Pull Request：\n\n- 修复了磁贴在低刷新率显示器下的动画掉帧问题\n- 优化了内存占用\n\n请尽快审核。',
    time: '10:24',
    fullTime: '2025年12月23日 10:24',
    read: false,
    starred: false,
    folder: 'inbox',
    attachment: true
  },
  {
    id: '2',
    from: 'Microsoft Azure',
    subject: '您的服务账单已就绪',
    preview: '您 12 月份的 Azure 消费账单已生成。本月总计消费 $0.00。',
    content: '尊敬的客户：\n\n您 2025年12月 的 Azure 账单已经生成，您可以通过 Azure 管理门户在线查阅详细账单信息。\n\n本期应付金额：$0.00\n截止日期：2026年1月15日',
    time: '昨天',
    fullTime: '2025年12月22日 18:45',
    read: true,
    starred: true,
    folder: 'inbox'
  },
  {
    id: '3',
    from: 'Vue.js News',
    subject: 'Vue 3.5 版本特性预告',
    preview: '探索即将到来的新特性：更加轻量的响应式系统以及全新的内置组件。',
    content: '大家好，Vue 3.5 即将发布。在这个版本中，我们专注于开发者体验和性能提升...\n\n主要改进点：\n1. 响应式系统内存占用降低 20%\n2. 引入了新的 Teleport 增强方案\n3. 模板编译器优化',
    time: '12-21',
    fullTime: '2025年12月21日 09:00',
    read: false,
    starred: false,
    folder: 'inbox'
  }
]);

const filteredMails = computed(() => {
  let list = mails.value;
  if (currentFolder.value === 'starred') {
    list = list.filter(m => m.starred);
  } else {
    list = list.filter(m => m.folder === currentFolder.value);
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(m => m.subject.toLowerCase().includes(q) || m.from.toLowerCase().includes(q));
  }
  return list;
});

const selectedMail = computed(() => {
  const mail = mails.value.find(m => m.id === selectedMailId.value);
  if (mail && !mail.read) {
    mail.read = true;
    updateUnreadCount();
  }
  return mail;
});

function selectMail(id: string) {
  selectedMailId.value = id;
}

function toggleStar(id: string) {
  const mail = mails.value.find(m => m.id === id);
  if (mail) mail.starred = !mail.starred;
}

function deleteMail(id: string) {
  const mail = mails.value.find(m => m.id === id);
  if (mail) {
    if (mail.folder === 'trash') {
      mails.value = mails.value.filter(m => m.id !== id);
    } else {
      mail.folder = 'trash';
    }
    selectedMailId.value = null;
    updateUnreadCount();
  }
}

function updateUnreadCount() {
  folders.value.forEach(folder => {
    if (folder.id === 'starred') return;
    folder.unread = mails.value.filter(m => m.folder === folder.id && !m.read).length;
  });
}

onMounted(() => {
  updateUnreadCount();
});
</script>

<style scoped>
.mail-app-container {
  container-type: inline-size;
  container-name: mail-app;
  user-select: none;
}

/* Container Queries Logic */

@container mail-app (max-width: 700px) {
  .mail-sidebar {
    display: none !important;
  }
  
  .mail-bottom-nav {
    display: flex !important;
  }
  
  .mail-list-panel {
    width: 100% !important;
    padding-bottom: 64px; /* Space for bottom nav */
  }
  
  .mail-detail-panel {
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 60;
  }

  .mail-detail-panel.mobile-hidden {
    pointer-events: none;
    opacity: 0;
    transform: translateX(100%);
  }

  .mail-detail-panel.mobile-visible {
    pointer-events: auto !important;
    opacity: 1;
    transform: translateX(0);
  }

  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: flex !important;
  }
}

/* Hide desktop stuff by default on mobile query */
.mobile-only {
  display: none;
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
</style>
