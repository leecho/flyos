<template>
  <!-- Root Container -->
  <div class="FlyChat-container flex h-full w-full bg-white dark:bg-gray-900 overflow-hidden text-gray-800 dark:text-gray-200" :class="((activeNav === 'chat' && activeChatId) || (activeNav === 'contacts' && activeContactId) || (activeNav === 'settings' && selectedSettingId)) ? 'has-active-view' : 'no-active-view'">
    
    <!-- 左侧区域：列表 + 底部导航 -->
    <div class="FlyChat-left-panel bg-gray-50/50 dark:bg-[rgba(20,20,20,0.5)] border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 h-full overflow-hidden w-full">
      
      <!-- 固定的搜索框头部: h-16 (64px) -->
      <div class="h-16 flex items-center px-4 shrink-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-800/50">
        <div class="relative flex-1 flex items-center">
          <Search class="absolute left-2 w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="搜索" 
            class="w-full bg-gray-200/60 dark:bg-gray-800 border-none outline-none rounded-md py-1.5 pl-8 pr-3 text-sm focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-green-500 transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <button class="w-8 h-8 ml-3 rounded-md flex flex-none items-center justify-center bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors shrink-0">
          <Plus class="w-5 h-5" />
        </button>
      </div>

      <!-- 列表区域 (聊天 vs 通讯录) -->
      <div class="flex-1 overflow-y-auto no-scrollbar custom-scrollbar bg-gray-50/30 dark:bg-gray-900/30 relative">
        <!-- 聊天列表 -->
        <div v-if="activeNav === 'chat'">
          <div 
            v-for="chat in filteredChats" 
            :key="chat.id"
            @click="selectChat(chat)"
            class="flex items-center px-3 py-4 cursor-pointer transition-colors relative"
            :class="activeChatId === chat.id ? 'bg-gray-200 dark:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-white/5'"
          >
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

        <!-- 通讯录列表 -->
        <div v-else-if="activeNav === 'contacts'" class="pb-10">
          <!-- 菜单项 (新朋友, 群聊等) -->
          <div v-for="menu in groupedContacts.menus" :key="menu.id" 
               @click="selectContact(menu)"
               class="flex items-center px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
               :class="activeContactId === menu.id ? 'bg-gray-200 dark:bg-white/10' : ''">
            <div class="w-10 h-10 flex-none rounded-md flex items-center justify-center text-white shadow-sm" :class="menu.avatar">
              <component :is="menu.icon === 'UserPlus' ? UserPlus : (menu.icon === 'Users' ? Users : (menu.icon === 'Hash' ? Hash : ShieldCheck))" class="w-6 h-6" />
            </div>
            <span class="ml-3 font-medium text-gray-900 dark:text-gray-100">{{ menu.name }}</span>
          </div>

          <!-- 字母分组 -->
          <div v-for="group in groupedContacts.alphabetical" :key="group.letter" :id="'contact-group-' + group.letter">
            <div class="px-4 py-1 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-800/50 sticky top-0 backdrop-blur-md z-10">
              {{ group.letter }}
            </div>
            <div v-for="contact in group.items" :key="contact.id"
                 @click="selectContact(contact)"
                 class="flex items-center px-3 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                 :class="activeContactId === contact.id ? 'bg-gray-200 dark:bg-white/10' : ''">
              <div class="w-10 h-10 flex-none rounded-md flex items-center justify-center text-white font-bold text-lg shadow-sm" :class="contact.avatar">
                {{ contact.name.charAt(0) }}
              </div>
              <span class="ml-3 font-medium text-gray-900 dark:text-gray-100">{{ contact.name }}</span>
            </div>
          </div>
          
          <!-- A-Z 索引栏 (PC端由于宽度足够可以放在最右侧) -->
          <div class="absolute right-1 top-20 bottom-20 flex flex-col items-center justify-center gap-0.5 z-20 pointer-events-none">
            <div v-for="group in groupedContacts.alphabetical" :key="group.letter" 
                 @click="scrollToSection(group.letter)"
                 class="text-[10px] font-bold text-gray-400 dark:text-gray-600 px-1 pointer-events-auto cursor-pointer hover:text-green-500">
              {{ group.letter }}
            </div>
          </div>
        </div>
        
        <!-- 设置菜单 -->
        <div v-else-if="activeNav === 'settings'" class="flex-1 flex flex-col pt-4">
          <div class="px-6 mb-8 flex items-center gap-4">
            <div class="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md" :class="userInfo.avatar">
              {{ userInfo.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <h2 class="text-lg font-bold truncate">{{ userInfo.name }}</h2>
              <p class="text-xs text-gray-500">飞信号：{{ userInfo.wxid }}</p>
            </div>
          </div>
          
          <div class="space-y-0.5">
            <div v-for="item in settingsMenu" :key="item.id"
                 @click="selectedSettingId = item.id"
                 class="flex items-center px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
                 :class="selectedSettingId === item.id ? 'bg-gray-200 dark:bg-white/10' : ''">
              <component :is="item.icon" class="w-5 h-5 mr-3 shrink-0" :class="item.danger ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-green-500'" />
              <span class="font-medium" :class="item.danger ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部导航栏: h-14 (56px) -->
      <div class="h-14 shrink-0 border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[rgba(20,20,20,0.5)] flex items-center justify-around px-2 z-10 w-full">
        <!-- 导航按钮 -->
        <button @click="activeNav = 'chat'" class="flex flex-col items-center justify-center w-14 h-14 gap-1 transition-colors" :class="activeNav === 'chat' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'">
          <MessageCircle :class="activeNav === 'chat' ? 'fill-current' : ''" class="w-6 h-6" />
          <span class="text-xs shrink-0 font-medium scale-90">飞信</span>
        </button>
        <button @click="activeNav = 'contacts'" class="flex flex-col items-center justify-center w-14 h-14 gap-1 transition-colors" :class="activeNav === 'contacts' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'">
          <Users :class="activeNav === 'contacts' ? 'fill-current' : ''" class="w-6 h-6" />
          <span class="text-xs shrink-0 font-medium scale-90">通讯录</span>
        </button>
        <button @click="activeNav = 'settings'" class="flex flex-col items-center justify-center w-14 h-14 gap-1 transition-colors" :class="activeNav === 'settings' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'">
          <Settings :class="activeNav === 'settings' ? 'fill-current' : ''" class="w-6 h-6" />
          <span class="text-xs shrink-0 font-medium scale-90">设置</span>
        </button>
      </div>
    </div>

    <!-- 右侧区域：聊天对话区 vs 资料页 -->
    <div class="FlyChat-right-panel flex-1 flex flex-col bg-gray-50 dark:bg-black/20 relative h-full w-full min-w-0">
      
      <!-- 聊天模式 -->
      <template v-if="activeNav === 'chat'">
        <template v-if="activeChatId && currentChat">
          <!-- 聊天头部 -->
          <div class="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-gray-50/95 dark:bg-[rgba(20,20,20,0.95)] backdrop-blur z-10 w-full">
            <div class="flex items-center gap-2 min-w-0">
              <button @click="activeChatId = null" class="FlyChat-back-btn p-2 -ml-1 rounded-md flex flex-none items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
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
            <!-- 消息渲染保持不变... -->
            <div v-for="msg in activeMessages" :key="msg.id" class="flex items-start gap-4 w-full" :class="msg.isMe ? 'flex-row-reverse' : ''">
              <div class="w-10 h-10 flex-none rounded-md flex items-center justify-center font-bold text-white shadow-sm overflow-hidden" :class="msg.isMe ? 'bg-blue-500' : currentChat.avatar">
                {{ msg.isMe ? '我' : currentChat.name.charAt(0) }}
              </div>
              <div class="w-2/3 flex flex-col min-w-0" :class="msg.isMe ? 'items-end' : 'items-start'">
                 <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 mx-1" v-if="!msg.isMe && currentChat.members">{{ currentChat.name }}</div>
                 <div class="px-4 py-2.5 rounded-lg text-base leading-relaxed break-words shadow-sm relative group" :class="[msg.isMe ? 'bg-green-400 dark:bg-green-700 text-black dark:text-gray-100' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100']">
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
              <button class="FlyChat-pc-only p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition" title="聊天"><Video class="w-5 h-5"/></button>
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
                :class="inputText.trim() ? 'bg-gray-100 dark:bg-gray-800 text-green-500 dark:text-green-500 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-transparent text-gray-400 dark:text-gray-600 border-transparent cursor-not-allowed'"
              >发 送</button>
            </div>
          </div>
        </template>
        <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 w-full bg-gray-50/50 dark:bg-black/20">
          <MessageCircle class="w-20 h-20 mb-6 text-gray-200 dark:text-gray-800" />
          <h2 class="text-xl font-medium text-gray-400 dark:text-gray-600">FlyOS FlyChat</h2>
        </div>
      </template>

      <!-- 通讯录资料模式 -->
      <template v-else-if="activeNav === 'contacts'">
        <div v-if="activeContactId && currentContact" class="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
           <!-- 头部 -->
           <div class="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
             <button @click="activeContactId = null" class="FlyChat-back-btn p-2 -ml-1 rounded-md flex flex-none items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
               <ChevronLeft class="w-6 h-6" />
             </button>
             <div class="flex-1"></div>
             <button class="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
               <MoreHorizontal class="w-6 h-6" />
             </button>
           </div>
           
           <!-- 资料详情 -->
           <div class="flex-1 overflow-y-auto overflow-x-hidden p-8 lg:p-12">
             <div class="max-w-md mx-auto">
               <div v-if="currentContact.type === 'contact'">
                 <div class="flex items-start gap-6 mb-10">
                   <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-lg flex items-center justify-center text-white font-bold text-3xl shadow-md shrink-0" :class="currentContact.avatar">
                     {{ currentContact.name.charAt(0) }}
                   </div>
                   <div class="min-w-0 pt-1">
                     <h1 class="text-2xl font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                       {{ currentContact.name }}
                       <User class="w-4 h-4 text-blue-400" />
                     </h1>
                     <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">飞信号：{{ currentContact.wxid }}</p>
                     <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">地区：{{ currentContact.region }}</p>
                   </div>
                 </div>
                 
                 <div class="space-y-1 mb-10">
                   <div class="flex py-3 border-b border-gray-100 dark:border-gray-800 flex-col sm:flex-row sm:items-center">
                     <span class="w-24 text-gray-500 dark:text-gray-400 shrink-0 text-sm">个性签名</span>
                     <span class="text-gray-900 dark:text-gray-100 text-sm italic">{{ currentContact.signature || '未设置签名' }}</span>
                   </div>
                   <div class="flex py-3 border-b border-gray-100 dark:border-gray-800 items-center">
                     <span class="w-24 text-gray-500 dark:text-gray-400 shrink-0 text-sm">朋友圈</span>
                     <div class="flex gap-1 overflow-hidden">
                        <div class="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div class="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded"></div>
                     </div>
                   </div>
                 </div>
                 
                 <div class="flex flex-col gap-3">
                   <button @click="goToChat(currentContact)" class="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition shadow-sm flex items-center justify-center gap-2">
                     <MessageCircle class="w-5 h-5" /> 发消息
                   </button>
                   <button class="w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md font-medium transition flex items-center justify-center gap-2">
                     <Video class="w-5 h-5 text-green-500" /> 音视频通话
                   </button>
                 </div>
               </div>
               
               <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div class="w-20 h-20 rounded-full flex items-center justify-center text-white mb-6 shadow-lg" :class="currentContact.avatar">
                    <component :is="currentContact.icon === 'UserPlus' ? UserPlus : (currentContact.icon === 'Users' ? Users : (currentContact.icon === 'Hash' ? Hash : ShieldCheck))" class="w-10 h-10" />
                  </div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ currentContact.name }}</h2>
                  <p class="mt-2 text-sm">暂无新消息</p>
               </div>
             </div>
           </div>
        </div>
        <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 w-full bg-gray-50/50 dark:bg-black/20">
          <Users class="w-20 h-20 mb-6 text-gray-200 dark:text-gray-800" />
          <h2 class="text-lg font-medium">通讯录</h2>
        </div>
      </template>

      <!-- 设置详情模式 -->
      <template v-else-if="activeNav === 'settings'">
        <div class="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900">
          <div class="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
             <button @click="selectedSettingId = ''" class="FlyChat-back-btn p-2 -ml-1 rounded-md flex flex-none items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
               <ChevronLeft class="w-5 h-5" />
             </button>
             <h2 class="ml-2 text-base font-medium">{{ settingsMenu.find(m => m.id === selectedSettingId)?.name || '设置' }}</h2>
          </div>
          
          <div class="flex-1 overflow-y-auto p-8 lg:p-12">
            <div class="max-w-xl mx-auto space-y-6">
              <!-- 账号与安全 -->
              <div v-if="selectedSettingId === 'account'" class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                  <div class="flex justify-between items-center py-1.5">
                    <span class="text-gray-500">飞信号</span>
                    <span class="text-gray-900 dark:text-gray-100">{{ userInfo.wxid }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1.5 border-t border-gray-200 dark:border-gray-800/50">
                    <span class="text-gray-500">手机号</span>
                    <span class="text-gray-900 dark:text-gray-100">138 **** 8888</span>
                  </div>
                </div>
                <button class="w-full text-left p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex justify-between items-center transition text-sm">
                  <span class="text-gray-900 dark:text-gray-100">更多安全设置</span>
                  <MoreHorizontal class="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              <!-- 新消息通知 -->
              <div v-if="selectedSettingId === 'notifications'" class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4 text-sm">
                  <div class="flex justify-between items-center">
                    <div class="flex flex-col">
                      <span class="text-gray-900 dark:text-gray-100">新消息提醒</span>
                      <span class="text-[11px] text-gray-500">接收新消息通知</span>
                    </div>
                    <div class="w-9 h-4.5 bg-green-500 rounded-full relative"><div class="absolute right-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full"></div></div>
                  </div>
                  <div class="flex justify-between items-center border-t border-gray-200 dark:border-gray-800/50 pt-4">
                    <span class="text-gray-900 dark:text-gray-100">通知显示消息详情</span>
                    <div class="w-9 h-4.5 bg-green-500 rounded-full relative"><div class="absolute right-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full"></div></div>
                  </div>
                </div>
              </div>

              <!-- 通用 -->
              <div v-if="selectedSettingId === 'general'" class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                  <div class="flex justify-between items-center py-1.5">
                    <span class="text-gray-900 dark:text-gray-100">多语言</span>
                    <span class="text-gray-500">简体中文</span>
                  </div>
                  <div class="flex justify-between items-center py-1.5 border-t border-gray-200 dark:border-gray-800/50">
                    <span class="text-gray-900 dark:text-gray-100">深色模式</span>
                    <div class="flex gap-2">
                      <button class="p-1 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm"><Sun class="w-3.5 h-3.5 text-orange-500"/></button>
                      <button class="p-1 rounded-md bg-gray-100 dark:bg-green-600/30 border border-transparent"><Moon class="w-3.5 h-3.5 text-blue-400"/></button>
                    </div>
                  </div>
                </div>
                <button class="w-full text-center p-2.5 text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition">
                  清理飞信存储空间
                </button>
              </div>

              <!-- 关于 -->
              <div v-if="selectedSettingId === 'about'" class="flex flex-col items-center py-10 space-y-6">
                <div class="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageCircle class="w-12 h-12 text-white fill-current" />
                </div>
                <div class="text-center">
                  <h3 class="text-lg font-bold">FlyChat FlyOS 版</h3>
                  <p class="text-gray-500 text-xs mt-1 flex items-center justify-center gap-1">Version 1.0.0 <span class="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">Beta</span></p>
                </div>
                <div class="w-full border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
                  <p class="text-center text-xs text-gray-400 leading-relaxed">
                    Designed for FlyOS <br/>
                    © 2026 FlyChat Emulator Inc.
                  </p>
                </div>
              </div>
              
              <!-- 退出登录 -->
              <div v-if="selectedSettingId === 'logout'" class="flex flex-col items-center py-12">
                <div class="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                  <LogOut class="w-6 h-6 text-red-500" />
                </div>
                <h3 class="text-lg font-bold mb-2">确认退出飞信？</h3>
                <p class="text-gray-500 text-xs text-center mb-10 max-w-xs">退出后将无法接收新消息，但聊天记录将保存在此设备中。</p>
                <div class="flex gap-4 w-full text-sm">
                   <button @click="selectedSettingId = 'account'" class="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-medium">取消</button>
                   <button class="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium shadow-md shadow-red-500/20 active:scale-95 transition-transform">退出登录</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { 
  MessageCircle, Users, Settings, Search, Plus, 
  ChevronLeft, MoreHorizontal, Smile, FolderOpen, Video,
  UserPlus, Hash, ShieldCheck, User, Mail, Phone,
  Shield, Bell, Monitor, Lock, CircleHelp, LogOut, Sun, Moon
} from 'lucide-vue-next'

import { userStore } from '@/stores/userStore'

const activeNav = ref('chat')
const activeChatId = ref<number | null>(null)
const searchQuery = ref('')
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
  wxid?: string
}

interface Contact {
  id: string | number
  name: string
  avatar: string
  pinyin: string
  type: 'contact' | 'menu'
  icon?: any
  wxid?: string
  region?: string
  signature?: string
}

// Mock 数据
const chats = ref<Chat[]>([
  { id: 1, name: '文件传输助手', latest: '[已接收文件]', time: '10:24', avatar: 'bg-emerald-500', wxid: 'filehelper' },
  { id: 2, name: '开发交流群', latest: '前端还需要处理一下这个bug', time: '09:12', avatar: 'bg-blue-500', unread: 3, members: 12, wxid: 'dev_group' },
  { id: 3, name: 'Boss', latest: '下周的周会PPT准备一下', time: '昨天', avatar: 'bg-indigo-500', wxid: 'boss_001' },
  { id: 4, name: 'UI设计团队', latest: '[图片]', time: '星期二', avatar: 'bg-pink-500', members: 5, wxid: 'ui_team' },
  { id: 5, name: '运维告警机器人', latest: '【警告】数据库连接池已达 90%', time: '星期一', avatar: 'bg-orange-500', wxid: 'ops_bot' },
  { id: 6, name: '李四', latest: '好的，明天见。', time: '星期日', avatar: 'bg-emerald-500', wxid: 'lisi_luck' }
])

const contacts = ref<Contact[]>([
  { id: 'new_friends', name: '新朋友', avatar: 'bg-orange-500', pinyin: '', type: 'menu', icon: 'UserPlus' },
  { id: 'group_chats', name: '群聊', avatar: 'bg-green-500', pinyin: '', type: 'menu', icon: 'Users' },
  { id: 'tags', name: '标签', avatar: 'bg-blue-500', pinyin: '', type: 'menu', icon: 'Hash' },
  { id: 'official_accounts', name: '公众号', avatar: 'bg-blue-600', pinyin: '', type: 'menu', icon: 'ShieldCheck' },
  { id: 7, name: '安先生', avatar: 'bg-red-500', pinyin: 'A', type: 'contact', wxid: 'an_sir', region: '北京 朝阳', signature: '不积跬步无以至千里' },
  { id: 8, name: '白女士', avatar: 'bg-orange-400', pinyin: 'B', type: 'contact', wxid: 'white_lady', region: '上海 浦东' },
  { id: 3, name: 'Boss', avatar: 'bg-indigo-500', pinyin: 'B', type: 'contact', wxid: 'boss_001', region: '北京 海淀', signature: '奋斗中...' },
  { id: 9, name: '陈总', avatar: 'bg-amber-500', pinyin: 'C', type: 'contact', wxid: 'mr_chen', region: '深圳 南山' },
  { id: 10, name: '丁丁', avatar: 'bg-lime-500', pinyin: 'D', type: 'contact', wxid: 'dingding', region: '杭州 西湖' },
  { id: 6, name: '李四', avatar: 'bg-emerald-500', pinyin: 'L', type: 'contact', wxid: 'lisi_luck', region: '广州 天河' },
  { id: 11, name: '王五', avatar: 'bg-fuchsia-500', pinyin: 'W', type: 'contact', wxid: 'wangwu_007', region: '成都 武侯' },
  { id: 12, name: '张三', avatar: 'bg-slate-500', pinyin: 'Z', type: 'contact', wxid: 'zhangsan_sky', region: '浙江 宁波' }
])

const activeContactId = ref<string | number | null>(null)
const selectedSettingId = ref<string>('account')

const userInfo = ref({
  name: userStore.user.name,
  avatar: 'bg-blue-500',
  wxid: userStore.user.id,
  region: 'Google Lab',
  signature: 'Coding the future, one byte at a time.'
})

const settingsMenu = [
  { id: 'account', name: '账号与安全', icon: Shield },
  { id: 'notifications', name: '新消息通知', icon: Bell },
  { id: 'general', name: '通用', icon: Monitor },
  { id: 'privacy', name: '朋友权限', icon: Lock },
  { id: 'about', name: '关于飞信', icon: CircleHelp },
  { id: 'logout', name: '退出登录', icon: LogOut, danger: true }
]

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

const filteredChats = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return chats.value
  return chats.value.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.latest.toLowerCase().includes(query)
  )
})

const currentChat = computed(() => {
  return chats.value.find(c => c.id === activeChatId.value)
})

const currentContact = computed(() => {
  return contacts.value.find(c => c.id === activeContactId.value)
})

const groupedContacts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const menus = contacts.value.filter(c => c.type === 'menu')
  const people = contacts.value.filter(c => c.type === 'contact' && 
    (c.name.toLowerCase().includes(query) || c.wxid?.toLowerCase().includes(query)))
  
  const groups: Record<string, Contact[]> = {}
  people.forEach(p => {
    const letter = p.pinyin.toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(p)
  })
  
  const sortedLetters = Object.keys(groups).sort()
  return {
    menus,
    alphabetical: sortedLetters.map(letter => ({
      letter,
      items: groups[letter].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
    }))
  }
})

const selectChat = (chat: Chat) => {
  activeNav.value = 'chat'
  activeChatId.value = chat.id
  if (chat.unread) chat.unread = 0
  scrollToBottom()
}

const selectContact = (contact: Contact) => {
  activeContactId.value = contact.id
}

const scrollToSection = (letter: string) => {
  const el = document.getElementById('contact-group-' + letter)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const goToChat = (contact: Contact) => {
  if (contact.type !== 'contact') return
  
  // 查找是否已有聊天，没有就创建一个
  let chat = chats.value.find(c => c.wxid === contact.wxid)
  if (!chat) {
    const newId = Math.max(0, ...chats.value.map(c => c.id)) + 1
    chat = {
      id: newId,
      name: contact.name,
      latest: '',
      time: '刚刚',
      avatar: contact.avatar,
      wxid: contact.wxid
    }
    chats.value.unshift(chat)
  }
  
  activeNav.value = 'chat'
  activeChatId.value = chat.id as number
  scrollToBottom()
}

const activeMessages = computed(() => {
  if (!activeChatId.value) return []
  if (!messagesDb.value[activeChatId.value]) {
    messagesDb.value[activeChatId.value] = []
  }
  return messagesDb.value[activeChatId.value]
})

// Removed duplicate selectChat to keep clean

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
.FlyChat-container {
  container-type: inline-size;
  container-name: FlyChat;
}

/* PC 模式 (宽度 >= 600px)：左右并列排布 */
@container FlyChat (min-width: 600px) {
  .FlyChat-left-panel {
    width: 280px !important;
    display: flex !important;
  }
  .FlyChat-right-panel {
    display: flex !important;
  }
  .FlyChat-pc-only {
    display: block !important;
  }
  .FlyChat-back-btn {
    display: none !important;
  }
}

/* 移动端模式 (宽度 < 600px)：单边全屏切换 */
@container FlyChat (max-width: 599px) {
  .FlyChat-pc-only {
    display: none !important;
  }
  
  /* 如果有选中的内容（聊天或联系人），隐藏左侧列表，全屏显示详情 */
  .FlyChat-container.has-active-view .FlyChat-left-panel {
    display: none !important;
  }
  
  /* 如果没有选中内容，隐藏右侧详情，全屏显示列表 */
  .FlyChat-container.no-active-view .FlyChat-right-panel {
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
