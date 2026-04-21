<template>
  <div class="@container flex h-full w-full bg-white dark:bg-gray-900 overflow-hidden text-gray-800 dark:text-gray-200">
    <!-- Sidebar -->
    <div class="w-full @2xl:w-[50%] @2xl:max-w-sm border-r border-gray-200 dark:border-gray-800 flex-col bg-gray-50/50 dark:bg-[rgba(20,20,20,0.5)] shrink-0"
         :class="selectedContact ? 'hidden @2xl:flex' : 'flex'">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
        <h2 class="text-xl font-bold mb-4 ml-1">通讯录</h2>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索联系人..." 
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700/80 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-gray-700 dark:text-gray-200 shadow-sm"
          />
        </div>
      </div>
      <div class="flex-1 overflow-y-auto no-scrollbar">
        <div v-for="(group, letter) in groupedContacts" :key="letter" class="mb-2">
          <div class="px-5 py-1 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-800/40 sticky top-0 backdrop-blur-xl z-10 border-y border-gray-200/50 dark:border-gray-800/50">
            {{ letter }}
          </div>
          <div 
            v-for="contact in group" 
            :key="contact.id"
            @click="selectedId = contact.id"
            class="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors duration-200 hover:bg-black/5 dark:hover:bg-white/5 relative"
            :class="{'bg-blue-50 dark:bg-blue-900/20': selectedId === contact.id}"
          >
            <!-- Highlight bar -->
            <div v-if="selectedId === contact.id" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-blue-500 rounded-r-full"></div>
            
            <div class="w-10 h-10 min-w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm" :class="contact.color">
              {{ contact.name.charAt(0) }}
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="font-medium text-[15px] truncate">{{ contact.name }}</span>
              <span class="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5" v-if="contact.subtitle || contact.job">
                {{ contact.job || contact.subtitle }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Detail Area -->
    <div class="w-full @2xl:flex-1 flex flex-col bg-gray-50/30 dark:bg-black/20 relative h-full overflow-y-auto" v-if="selectedContact">
      <!-- Mobile Back Button & Desktop Top Actions -->
      <div class="sticky top-0 w-full flex items-center justify-between p-4 z-10 shrink-0">
        <button @click="selectedId = null" class="@2xl:hidden p-2 -ml-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-500 transition-colors flex items-center">
          <ChevronLeft class="w-6 h-6" />
        </button>
        <div class="flex-1"></div>
        <div class="flex gap-2">
          <button class="p-2.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-500 transition-colors">
            <Star class="w-5 h-5" />
          </button>
          <button class="p-2.5 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-500 transition-colors">
            <Edit3 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-start pb-8 w-full mt-2 lg:mt-8">
        <div class="flex flex-col items-center gap-4 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div class="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-xl ring-4 ring-white dark:ring-gray-800" :class="selectedContact.color">
          {{ selectedContact.name.charAt(0) }}
        </div>
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ selectedContact.name }}</h1>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1.5">{{ selectedContact.job || '联系人' }}</p>
        </div>
        
        <div class="flex flex-wrap gap-4 @xs:gap-6 mt-6 mb-8 w-full max-w-sm justify-center">
          <button class="flex flex-col items-center justify-center w-[60px] h-[64px] rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-600/30 transition-all hover:scale-105 active:scale-95 shadow-sm">
            <MessageCircle class="w-[22px] h-[22px] mb-1.5" />
            <span class="text-[10px] font-bold">信息</span>
          </button>
          <button class="flex flex-col items-center justify-center w-[60px] h-[64px] rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-600/30 transition-all hover:scale-105 active:scale-95 shadow-sm">
            <Phone class="w-[22px] h-[22px] mb-1.5" />
            <span class="text-[10px] font-bold">呼叫</span>
          </button>
          <button class="flex flex-col items-center justify-center w-[60px] h-[64px] rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-600/30 transition-all hover:scale-105 active:scale-95 shadow-sm">
            <Video class="w-[22px] h-[22px] mb-1.5" />
            <span class="text-[10px] font-bold">视频</span>
          </button>
          <button class="flex flex-col items-center justify-center w-[60px] h-[64px] rounded-2xl bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 shadow-sm">
            <Mail class="w-[22px] h-[22px] mb-1.5" />
            <span class="text-[10px] font-bold">邮件</span>
          </button>
        </div>
      </div>
      
      <div class="w-full max-w-sm space-y-4 px-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 px-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="text-[11px] font-bold tracking-wider text-gray-400 mb-1 uppercase">手机号码</div>
          <div class="text-blue-600 dark:text-blue-400 text-lg font-medium cursor-pointer hover:underline">{{ selectedContact.phone }}</div>
        </div>
        
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 px-5 shadow-sm hover:shadow-md transition-shadow" v-if="selectedContact.email">
          <div class="text-[11px] font-bold tracking-wider text-gray-400 mb-1 uppercase">电子邮件</div>
          <div class="text-blue-600 dark:text-blue-400 text-[15px] font-medium cursor-pointer hover:underline">{{ selectedContact.email }}</div>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 px-5 shadow-sm hover:shadow-md transition-shadow" v-if="selectedContact.address">
          <div class="text-[11px] font-bold tracking-wider text-gray-400 mb-1 uppercase">住宅地址</div>
          <div class="text-[15px] font-medium mt-1">{{ selectedContact.address }}</div>
        </div>
      </div>
    </div>
  </div>
 
    <!-- Empty State -->
    <div class="hidden @2xl:flex flex-1 flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50/30 dark:bg-black/20" v-else>
      <div class="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Users class="w-10 h-10 text-gray-300 dark:text-gray-600" />
      </div>
      <p class="text-lg font-semibold text-gray-500 dark:text-gray-400">选择一个联系人进行查看</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Star, Edit3, MessageCircle, Phone, Video, Mail, Users, ChevronLeft } from 'lucide-vue-next'

interface Contact {
  id: number
  pinyin: string
  name: string
  subtitle?: string
  job?: string
  phone: string
  email?: string
  address?: string
  color: string
}

const contacts = ref<Contact[]>([
  { id: 1, pinyin: 'A', name: '安先生', job: '产品经理', phone: '138-0000-0001', email: 'an@example.com', color: 'bg-gradient-to-br from-red-400 to-rose-600', address: '北京市朝阳区建国路89号' },
  { id: 2, pinyin: 'B', name: '白女士', job: 'UI 设计师', phone: '138-0000-0002', color: 'bg-gradient-to-br from-orange-400 to-amber-500' },
  { id: 3, pinyin: 'C', name: '陈总', job: 'CEO', phone: '138-0000-0003', email: 'chen@example.com', color: 'bg-gradient-to-br from-amber-400 to-yellow-500', address: '上海市浦东新区世纪大道1号' },
  { id: 4, pinyin: 'D', name: '丁丁', job: '前端开发', phone: '138-0000-0004', color: 'bg-gradient-to-br from-lime-400 to-green-500' },
  { id: 5, pinyin: 'F', name: '方经理', subtitle: '销售部', job: '销售总监', phone: '138-0000-0005', color: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
  { id: 6, pinyin: 'G', name: '高师傅', phone: '138-0000-0006', color: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
  { id: 7, pinyin: 'H', name: '黄老师', job: '架构师', phone: '138-0000-0007', email: 'huang@example.com', color: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
  { id: 8, pinyin: 'L', name: '李四', subtitle: '朋友', job: '自由职业', phone: '138-0000-0008', color: 'bg-gradient-to-br from-indigo-400 to-violet-500' },
  { id: 9, pinyin: 'L', name: '刘老板', phone: '138-0000-0009', color: 'bg-gradient-to-br from-violet-400 to-purple-500' },
  { id: 10, pinyin: 'W', name: '王五', phone: '138-0000-0010', color: 'bg-gradient-to-br from-fuchsia-400 to-pink-500' },
  { id: 11, pinyin: 'X', name: '小明', phone: '138-0000-0011', color: 'bg-gradient-to-br from-pink-400 to-rose-500' },
  { id: 12, pinyin: 'Z', name: '张三', subtitle: '家人', phone: '138-0000-0012', color: 'bg-gradient-to-br from-slate-400 to-gray-600', address: '浙江省杭州市西湖区' },
  { id: 13, pinyin: 'Z', name: '赵六', phone: '138-0000-0013', color: 'bg-gradient-to-br from-rose-400 to-red-500' }
])

const searchQuery = ref('')
const selectedId = ref<number | null>(null)

const selectedContact = computed(() => {
  return contacts.value.find(c => c.id === selectedId.value)
})

const groupedContacts = computed(() => {
  const filtered = contacts.value.filter(c => 
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    c.phone.includes(searchQuery.value)
  )
  
  const groups: Record<string, Contact[]> = {}
  filtered.forEach(contact => {
    const letter = contact.pinyin.toUpperCase()
    if (!groups[letter]) {
      groups[letter] = []
    }
    groups[letter].push(contact)
  })
  
  return Object.keys(groups).sort().reduce((acc, key) => {
    acc[key] = groups[key]
    return acc
  }, {} as Record<string, Contact[]>)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
