<template>
  <div class="flex h-full text-gray-900 dark:text-gray-100 overflow-hidden">
    <!-- 左侧导航 -->
    <aside
        :class="[
        'bg-gray-100 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 transition-all duration-300 flex-shrink-0 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      ]"
    >
      <!-- 顶部用户卡片 -->
      <div class="flex items-center gap-3 p-4 border-b border-gray-300 dark:border-gray-700">
        <img v-if="sidebarOpen" :src="userStore.user.avatar" class="w-12 h-12 rounded-full" />
        <div v-if="sidebarOpen" class="flex flex-col min-w-0">
          <div class="font-semibold truncate">{{ userStore.user.name }}</div>
          <div class="text-xs text-gray-500 truncate">本地账户</div>
        </div>
        <button
            class="ml-auto w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-800"
            @click="toggleSidebar"
        >
          <span v-if="sidebarOpen">⏴</span>
          <span v-else>⏵</span>
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex flex-col mt-2 gap-2 flex-1 overflow-auto">
        <div
            v-for="item in navs"
            :key="item.key"
            class="px-4 py-2 mx-2 cursor-pointer flex items-center rounded gap-2 transition-colors truncate"
            :class="{
            'bg-blue-500 text-white ': current === item.key,
            'hover:bg-gray-200 dark:hover:bg-gray-800': current !== item.key,
            'justify-center': !sidebarOpen
          }"
            @click="current = item.key"
        >
          <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
          <span v-if="sidebarOpen" class="truncate">{{ item.label }}</span>
        </div>
      </nav>
    </aside>

    <!-- 右侧内容区 -->
    <section class="flex-1 flex flex-col overflow-auto p-4 bg-white dark:bg-gray-950 transition-all duration-300">
      <!-- 个人信息 -->
      <div v-if="current === 'profile'" class="flex flex-col gap-4 w-full">
        <h2 class="text-xl font-semibold">你的信息</h2>
        <div class="flex flex-col sm:flex-row gap-4 p-4 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0 min-w-0 w-full">
          <img :src="userStore.user.avatar" class="w-20 h-20 rounded-full flex-shrink-0" />
          <div class="flex flex-col flex-1 min-w-0">
            <div class="text-sm text-gray-500 truncate">用户名</div>
            <input
                v-model="userStore.user.name"
                class="mt-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 w-full"
            />
          </div>
        </div>
      </div>

      <!-- 个性化 -->
      <div v-if="current === 'theme'" class="flex flex-col gap-4 w-full mt-4">
        <Style />
      </div>

      <!-- 系统 -->
      <div v-if="current === 'system'" class="flex flex-col gap-4 w-full mt-4">
        <h2 class="text-xl font-semibold">系统</h2>
        <div class="mt-4 p-4 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0 min-w-0 w-full">
          <div class="text-sm text-gray-500">版本</div>
          <div class="text-sm">FlyOS 0.1.0</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Style from "./setting/Style.vue";
import { userStore } from '../stores/userStore.ts'

const user = ref({
  name: 'Fly User',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
})

const navs = [
  { key: 'profile', label: '你的信息', icon: '👤' },
  { key: 'theme', label: '个性化', icon: '🎨' },
  { key: 'system', label: '系统', icon: '⚙️' }
]

const current = ref('profile')
const sidebarOpen = ref(true)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<style scoped>
/* 滚动条样式 */
section::-webkit-scrollbar {
  width: 6px;
}
section::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 3px;
}

/* 自动换行和缩放 */
input {
  min-width: 0;
}

h2 {
  flex-shrink: 0;
}
</style>
