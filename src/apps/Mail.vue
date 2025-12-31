<template>
  <div class="mail-app flex h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden font-sans">
    <!-- 左侧导航栏 -->
    <div class="w-16 md:w-60 bg-gray-50 dark:bg-gray-800/50 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div class="p-4">
        <button
          @click="isComposing = true"
          class="w-full py-3 bg-accent hover:bg-opacity-80 text-white rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span class="hidden md:inline font-medium text-sm">撰写邮件</span>
        </button>
      </div>

      <nav class="flex-1 px-2 space-y-1">
        <div
          v-for="folder in folders"
          :key="folder.id"
          @click="currentFolder = folder.id"
          class="flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors group"
          :class="currentFolder === folder.id ? 'bg-accent/10 text-accent' : 'hover:bg-gray-200/50 dark:hover:bg-gray-700/50'"
        >
          <component :is="folder.icon" class="w-5 h-5" :class="currentFolder === folder.id ? 'opacity-100' : 'opacity-60'" />
          <span class="hidden md:inline ml-3 text-sm font-medium">{{ folder.name }}</span>
          <span v-if="folder.unread" class="hidden md:inline ml-auto text-[10px] bg-accent/20 px-1.5 py-0.5 rounded-full font-bold">
            {{ folder.unread }}
          </span>
        </div>
      </nav>
    </div>

    <!-- 中间邮件列表 -->
    <div class="w-80 md:w-96 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div class="h-14 flex items-center px-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="搜索邮件..."
            class="w-full pl-9 pr-4 py-1.5 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-xs focus:ring-2 focus:ring-accent/50 outline-none"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div
          v-for="mail in filteredMails"
          :key="mail.id"
          @click="selectedMailId = mail.id"
          class="p-4 border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors relative"
          :class="[
            selectedMailId === mail.id ? 'bg-accent/5' : '',
            !mail.read ? 'border-l-4 border-l-accent' : 'border-l-4 border-l-transparent'
          ]"
        >
          <div class="flex justify-between items-start mb-1">
            <span class="text-sm font-bold truncate pr-2" :class="!mail.read ? 'text-gray-900 dark:text-white' : 'text-gray-500'">{{ mail.from }}</span>
            <span class="text-[10px] opacity-40 shrink-0 mt-0.5">{{ mail.time }}</span>
          </div>
          <h4 class="text-xs font-semibold mb-1 truncate" :class="!mail.read ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500'">{{ mail.subject }}</h4>
          <p class="text-[11px] opacity-50 line-clamp-2 leading-relaxed">{{ mail.preview }}</p>

          <div class="mt-2 flex items-center space-x-2">
            <button @click.stop="toggleStar(mail.id)" class="hover:text-yellow-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" :fill="mail.starred ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" class="text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </button>
            <span v-if="mail.attachment" class="opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容详情 -->
    <div class="flex-1 flex flex-col bg-white dark:bg-gray-900">
      <div v-if="selectedMail" class="h-full flex flex-col">
        <!-- 工具栏 -->
        <div class="h-14 px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div class="flex items-center space-x-4">
            <button @click="deleteMail(selectedMail.id)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors" title="删除">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors" title="标为未读">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </button>
          </div>
        </div>

        <!-- 邮件内容 -->
        <div class="flex-1 overflow-y-auto p-8">
          <h2 class="text-2xl font-bold mb-6 leading-tight">{{ selectedMail.subject }}</h2>

          <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-50 dark:border-gray-800">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                {{ selectedMail.from.charAt(0).toUpperCase() }}
              </div>
              <div class="ml-4">
                <p class="text-sm font-bold">{{ selectedMail.from }}</p>
                <p class="text-xs opacity-40">发送至: 我 &lt;user@flyos.dev&gt;</p>
              </div>
            </div>
            <div class="text-xs opacity-40">
              {{ selectedMail.fullTime || selectedMail.time }}
            </div>
          </div>

          <div class="prose dark:prose-invert max-w-none text-sm leading-loose opacity-90 whitespace-pre-wrap">
            {{ selectedMail.content || selectedMail.preview }}
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex flex-col items-center justify-center opacity-30">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path><rect width="20" height="16" x="2" y="4" rx="2"></rect></svg>
        <p class="mt-4 text-sm">选择一封邮件来阅读内容</p>
      </div>
    </div>

    <!-- 写邮件弹窗 -->
    <div v-if="isComposing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 class="font-bold">新邮件</h3>
          <button @click="isComposing = false" class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <input type="text" placeholder="收件人" class="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 py-2 outline-none focus:border-accent transition-colors text-sm" />
          <input type="text" placeholder="主题" class="w-full bg-transparent border-b border-gray-100 dark:border-gray-700 py-2 outline-none focus:border-accent transition-colors text-sm" />
          <textarea placeholder="输入邮件正文..." class="w-full h-64 bg-transparent resize-none outline-none py-4 text-sm leading-relaxed"></textarea>
        </div>
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button @click="isComposing = false" class="px-6 py-2 bg-accent hover:bg-opacity-80 text-white rounded-lg text-sm font-medium transition-all shadow-md active:scale-95">
            发送邮件
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue';
import {
  Inbox,
  Send,
  FileText,
  Star,
  Trash2,
  AlertCircle
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

const currentFolder = ref('inbox');
const selectedMailId = ref<string | null>(null);
const isComposing = ref(false);

const folders = ref([
  { id: 'inbox', name: '收件箱', icon: markRaw(Inbox), unread: 2 },
  { id: 'starred', name: '星标邮件', icon: markRaw(Star), unread: 0 },
  { id: 'sent', name: '已发送', icon: markRaw(Send), unread: 0 },
  { id: 'drafts', name: '草稿箱', icon: markRaw(FileText), unread: 1 },
  { id: 'trash', name: '垃圾箱', icon: markRaw(Trash2), unread: 0 },
]);

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
  if (currentFolder.value === 'starred') {
    return mails.value.filter(m => m.starred);
  }
  return mails.value.filter(m => m.folder === currentFolder.value);
});

const selectedMail = computed(() => {
  const mail = mails.value.find(m => m.id === selectedMailId.value);
  if (mail && !mail.read) {
    mail.read = true; // 选中时标为已读
    updateUnreadCount();
  }
  return mail;
});

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
.mail-app {
  user-select: none;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: rgba(155, 155, 155, 0.2); border-radius: 10px; }
</style>
