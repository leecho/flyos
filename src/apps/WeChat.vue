<template>
  <!-- Root Container -->
  <div class="wechat-container flex h-full w-full bg-white dark:bg-gray-900 overflow-hidden text-gray-800 dark:text-gray-200" :class="activeChatId ? 'has-active-chat' : 'no-active-chat'">
    
    <!-- 左侧区域：列表 + 底部导航 -->
    <div class="wechat-left-panel bg-gray-50/50 dark:bg-[rgba(20,20,20,0.5)] border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 h-full overflow-hidden w-full">
      
      <!-- 固定的搜索框头部: h-16 (64px) -->
      <div class="h-16 flex items-center px-4 shrink-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-800/50">
        <div class="relative flex-1 flex items-center">
          <Search class="absolute left-2 w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="搜索" 
            class="w-full bg-gray-200/60 dark:bg-gray-800 border-none outline-none rounded-md py-1.5 pl-8 pr-3 text-sm focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-green-500 transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <button class="w-8 h-8 ml-3 rounded-md flex flex-none items-center justify-center bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shrink-0">
          <Plus class="w-5 h-5" />
        </button>
      </div>

      <!-- 聊天列表 -->
      <div class="flex-1 overflow-y-auto no-scrollbar custom-scrollbar bg-gray-50/30 dark:bg-gray-900/30">
        <div 
          v-for="chat in chats" 
          :key="chat.id"
          @click="selectChat(chat)"
          class="flex items-center px-3 py-3 mx-2 my-1 cursor-pointer transition-colors rounded-lg relative"
          :class="activeChatId === chat.id ? 'bg-gray-200 dark:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-white/5'"
        >
          <!-- 头像: 真正正方形 w-12 h-12 (48px) -->
          <div class="w-12 h-12 flex-none rounded-md flex items-center justify-center text-white font-bold text-lg relative shadow-sm overflow-hidden" :class="chat.avatar">
            {{ chat.name.charAt(0) }}
            <span v-if="chat.unread" class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
              {{ chat.unread > 99 ? '99+' : chat.unread }}
            </span>
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <div class="flex justify-between items-baseline mb-1">
              <span class="font-medium text-base truncate text-gray-900 dark:text-gray-100">{{ chat.name }}</span>
              <span class="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2" :class="chat.unread ? 'text-green-500 font-medium' : ''">{{ chat.time }}</span>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
              <span v-if="chat.draft" class="text-red-500 dark:text-red-400">[草稿] </span>
              {{ chat.latest }}
            </div>
          </div>
        </div>
      </div>

      <!-- 底部导航栏: h-14 (56px) -->
      <div class="h-14 shrink-0 border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[rgba(20,20,20,0.5)] flex items-center justify-around px-2 z-10 w-full">
        <!-- 导航按钮 -->
        <button @click="activeNav = 'chat'" class="flex flex-col items-center justify-center w-14 h-14 gap-1 transition-colors" :class="activeNav === 'chat' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'">
          <MessageCircle :class="activeNav === 'chat' ? 'fill-current' : ''" class="w-6 h-6" />
          <span class="text-xs shrink-0 font-medium scale-90">微信</span>
        </button>
        <button @click="activeNav = 'contacts'" class="flex flex-col items-center justify-center w-14 h-14 gap-1 transition-colors" :class="activeNav === 'contacts' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'">
          <Users :class="activeNav === 'contacts' ? 'fill-current' : ''" class="w-6 h-6" />
          <span class="text-xs shrink-0 font-medium scale-90">通讯录</span>
        </button>
        <button class="flex flex-col items-center justify-center w-14 h-14 gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
          <Settings class="w-6 h-6" />
          <span class="text-xs shrink-0 font-medium scale-90">设置</span>
        </button>
      </div>
    </div>

    <!-- 右侧区域：聊天对话区 -->
    <div class="wechat-right-panel flex-1 flex flex-col bg-gray-50 dark:bg-black/20 relative h-full w-full min-w-0">
      <template v-if="activeChatId && currentChat">
        <!-- 聊天头部: h-16 (64px) -->
        <div class="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-gray-50/95 dark:bg-[rgba(20,20,20,0.95)] backdrop-blur z-10 w-full">
          <div class="flex items-center gap-2 min-w-0">
            <button @click="activeChatId = null" class="wechat-back-btn p-2 -ml-1 rounded-md flex flex-none items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronLeft class="w-6 h-6" />
            </button>
            <div class="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5 truncate">
              {{ currentChat.name }}
              <span v-if="currentChat.members" class="text-sm font-normal text-gray-500 dark:text-gray-400">({{ currentChat.members }})</span>
            </div>
          </div>
          <button class="p-2 flex-none rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors shrink-0">
            <MoreHorizontal class="w-6 h-6" />
          </button>
        </div>

        <!-- 聊天记录区 -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar" ref="messagesContainer">
          <div v-for="msg in activeMessages" :key="msg.id" class="flex items-start gap-4 w-full" :class="msg.isMe ? 'flex-row-reverse' : ''">
            <!-- 气泡区头像 -->
            <div class="w-10 h-10 flex-none rounded-md flex items-center justify-center font-bold text-white shadow-sm overflow-hidden" :class="msg.isMe ? 'bg-blue-500' : currentChat.avatar">
              {{ msg.isMe ? '我' : currentChat.name.charAt(0) }}
            </div>
            
            <div class="w-2/3 flex flex-col min-w-0" :class="msg.isMe ? 'items-end' : 'items-start'">
               <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 mx-1" v-if="!msg.isMe && currentChat.members">{{ currentChat.name }}</div>
               <div 
                 class="px-4 py-2.5 rounded-lg text-base leading-relaxed break-words shadow-sm relative group"
                 :class="[
                   msg.isMe 
                     ? 'bg-green-400 dark:bg-green-700 text-black dark:text-gray-100' 
                     : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                 ]"
               >
                 {{ msg.text }}
               </div>
            </div>
          </div>
        </div>

        <!-- 聊天输入区 -->
        <div class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shrink-0 min-h-36 w-full relative z-20">
          <div class="flex items-center px-4 py-2 gap-3 text-gray-500 dark:text-gray-400">
            <button class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition" title="表情"><Smile class="w-5 h-5"/></button>
            <button class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition" title="发送文件"><FolderOpen class="w-5 h-5"/></button>
            <button class="wechat-pc-only p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition" title="聊天"><Video class="w-5 h-5"/></button>
          </div>
          <textarea 
            v-model="inputText"
            @keydown.enter.prevent="sendMessage"
            class="flex-1 w-full bg-transparent resize-none border-none outline-none px-5 py-1 text-base scrollbar-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="输入消息... (Enter 发送)"
          ></textarea>
          <div class="flex justify-end p-3">
            <button 
              @click="sendMessage"
              :disabled="!inputText.trim()"
              class="px-5 py-1.5 rounded text-sm font-medium transition-colors border"
              :class="inputText.trim() 
                ? 'bg-gray-100 dark:bg-gray-800 text-green-500 dark:text-green-500 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700' 
                : 'bg-gray-50 dark:bg-transparent text-gray-400 dark:text-gray-600 border-transparent cursor-not-allowed'"
            >发 送</button>
          </div>
        </div>
      </template>

      <!-- 空白欢迎页 -->
      <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 w-full bg-gray-50/50 dark:bg-black/20">
        <MessageCircle class="w-20 h-20 mb-6 text-gray-200 dark:text-gray-800" />
        <h2 class="text-xl font-medium text-gray-400 dark:text-gray-600">FlyWeb WeChat</h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { 
  MessageCircle, Users, Settings, Search, Plus, 
  ChevronLeft, MoreHorizontal, Smile, FolderOpen, Video 
} from 'lucide-vue-next'

const activeNav = ref('chat')
const activeChatId = ref<number | null>(null)
const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

interface Chat {
  id: number
  name: string
  latest: string
  time: string
  avatar: string
  unread?: number
  draft?: boolean
  members?: number
}

// Mock 数据
const chats = ref<Chat[]>([
  { id: 1, name: '文件传输助手', latest: '[已接收文件]', time: '10:24', avatar: 'bg-emerald-500' },
  { id: 2, name: '开发交流群', latest: '前端还需要处理一下这个bug', time: '09:12', avatar: 'bg-blue-500', unread: 3, members: 12 },
  { id: 3, name: 'Boss', latest: '下周的周会PPT准备一下', time: '昨天', avatar: 'bg-indigo-500' },
  { id: 4, name: 'UI设计团队', latest: '[图片]', time: '星期二', avatar: 'bg-pink-500', members: 5 },
  { id: 5, name: '运维告警机器人', latest: '【警告】数据库连接池已达 90%', time: '星期一', avatar: 'bg-orange-500' },
  { id: 6, name: '李四', latest: '好的，明天见。', time: '星期日', avatar: 'bg-emerald-500' }
])

interface Message {
  id: number
  text: string
  isMe: boolean
}

// Mock 历史消息容器
const messagesDb = ref<Record<number, Message[]>>({
  1: [
    { id: 1, text: '重要文件.pdf 已经接收', isMe: false },
    { id: 2, text: '好的，已在本地备份。', isMe: true }
  ],
  2: [
    { id: 1, text: '各位，深色模式还有一个小瑕疵，建议跟进。', isMe: false },
    { id: 2, text: '已经在修了，马上提 PR。', isMe: true },
    { id: 3, text: '赞！顺便把自适应 Container queries 也看下', isMe: false },
  ],
  3: [
    { id: 1, text: '这周辛苦了！代码质量很高', isMe: false },
    { id: 2, text: '多谢老板，职责所在。', isMe: true },
    { id: 3, text: '下周的周会PPT准备一下', isMe: false },
  ]
})

const currentChat = computed(() => {
  return chats.value.find(c => c.id === activeChatId.value)
})

const activeMessages = computed(() => {
  if (!activeChatId.value) return []
  if (!messagesDb.value[activeChatId.value]) {
    messagesDb.value[activeChatId.value] = []
  }
  return messagesDb.value[activeChatId.value]
})

const selectChat = (chat: Chat) => {
  activeChatId.value = chat.id
  if (chat.unread) chat.unread = 0
  scrollToBottom()
}

const sendMessage = () => {
  if (!inputText.value.trim() || !activeChatId.value) return
  
  const text = inputText.value.trim()
  const chatMsg = messagesDb.value[activeChatId.value]
  
  chatMsg.push({
    id: Date.now(),
    text,
    isMe: true
  })
  
  // 更新外侧卡片状态
  const chatItem = chats.value.find(c => c.id === activeChatId.value)
  if (chatItem) {
    chatItem.latest = text
    chatItem.time = '刚刚'
    // 移到顶端
    chats.value = [chatItem, ...chats.value.filter(c => c.id !== activeChatId.value)]
  }

  inputText.value = ''
  scrollToBottom()
  
  // 模拟随便回复
  if (activeChatId.value !== 1 && Math.random() > 0.3) {
    setTimeout(() => {
      receiveMockMessage(activeChatId.value as number)
    }, 1500)
  }
}

const receiveMockMessage = (chatId: number) => {
  messagesDb.value[chatId].push({
    id: Date.now(),
    text: '收到！好的，我会跟进处理。',
    isMe: false
  })
  
  const chatItem = chats.value.find(c => c.id === chatId)
  if (chatItem) {
    chatItem.latest = '收到！好的，我会跟进处理。'
    chatItem.time = '刚刚'
    if (activeChatId.value !== chatId) {
      chatItem.unread = (chatItem.unread || 0) + 1
    }
  }
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
/* 核心自适应逻辑：利用浏览器原生 Container Queries，彻底杜绝 Tailwind 编译漏报现象 */
.wechat-container {
  container-type: inline-size;
  container-name: wechat;
}

/* PC 模式 (宽度 >= 600px)：左右并列排布 */
@container wechat (min-width: 600px) {
  .wechat-left-panel {
    width: 280px !important;
    display: flex !important;
  }
  .wechat-right-panel {
    display: flex !important;
  }
  .wechat-pc-only {
    display: block !important;
  }
  .wechat-back-btn {
    display: none !important;
  }
}

/* 移动端模式 (宽度 < 600px)：单边全屏切换 */
@container wechat (max-width: 599px) {
  .wechat-pc-only {
    display: none !important;
  }
  
  /* 如果有选中的会话，隐藏左侧联系人列表，全屏显示聊天室 */
  .wechat-container.has-active-chat .wechat-left-panel {
    display: none !important;
  }
  
  /* 如果没有选中会话，隐藏右侧聊天室，全屏显示联系人列表 */
  .wechat-container.no-active-chat .wechat-right-panel {
    display: none !important;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(155, 155, 155, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(155, 155, 155, 0.4);
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
