<template>
  <div class="settings-app flex h-full bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl text-gray-900 dark:text-gray-100 font-sans overflow-hidden">

    <!-- 侧边导航栏 -->
    <div class="w-64 border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col p-4 space-y-2 overflow-y-auto">
      <div class="flex items-center gap-3 px-3 py-4 mb-4">
        <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          G
        </div>
        <div>
          <h2 class="text-sm font-bold truncate">Gemini User</h2>
          <p class="text-[10px] opacity-50 truncate">gemini@google.com</p>
        </div>
      </div>

      <button
        v-for="item in navItems"
        :key="item.id"
        @click="currentCategory = item.id"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative"
        :class="currentCategory === item.id ? 'bg-white/50 dark:bg-white/10 shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'"
      >
        <div v-if="currentCategory === item.id" class="absolute left-0 w-1 h-5 bg-blue-500 rounded-full"></div>
        <component :is="item.icon" :size="18" :class="currentCategory === item.id ? 'text-blue-500' : 'opacity-70'" />
        <span class="text-xs font-medium">{{ item.label }}</span>
      </button>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <header class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight">{{ activeCategoryLabel }}</h1>
      </header>

      <!-- 动态分类内容 -->
      <div class="max-w-3xl space-y-6">

        <!-- 系统设置 -->
        <template v-if="currentCategory === 'system'">
          <section class="space-y-4">
            <h3 class="text-sm font-bold opacity-60 px-1 uppercase tracking-wider">常用设置</h3>
            <div class="grid gap-3">
              <div class="p-4 bg-white/40 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 rounded-xl flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Monitor :size="20" /></div>
                  <div>
                    <p class="text-sm font-semibold">屏幕亮度</p>
                    <p class="text-xs opacity-50">调整显示器亮度以适应环境</p>
                  </div>
                </div>
                <input type="range" class="w-32 accent-blue-500" v-model="settings.brightness" />
              </div>

              <div class="p-4 bg-white/40 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 rounded-xl flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Volume2 :size="20" /></div>
                  <div>
                    <p class="text-sm font-semibold">主音量</p>
                    <p class="text-xs opacity-50">控制系统整体输出音量</p>
                  </div>
                </div>
                <input type="range" class="w-32 accent-purple-500" v-model="settings.volume" />
              </div>
            </div>
          </section>

          <section class="space-y-4 pt-4">
            <h3 class="text-sm font-bold opacity-60 px-1 uppercase tracking-wider">关于系统</h3>
            <div class="p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10 rounded-2xl">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>
                </div>
                <div>
                  <h4 class="text-lg font-bold">FlyOS Pro</h4>
                  <p class="text-xs opacity-60">版本 2025.12.0 (Build 4096)</p>
                </div>
              </div>
              <button class="text-xs font-bold text-blue-500 hover:underline">检查更新...</button>
            </div>
          </section>
        </template>

        <!-- 个性化设置 -->
        <template v-else-if="currentCategory === 'personalization'">
          <section class="space-y-4">
            <h3 class="text-sm font-bold opacity-60 px-1 uppercase tracking-wider">外观模式</h3>
            <div class="grid grid-cols-2 gap-4">
              <button
                @click="settings.darkMode = false"
                class="p-4 rounded-xl border transition-all"
                :class="!settings.darkMode ? 'border-blue-500 bg-blue-500/5' : 'border-gray-200/50 dark:border-white/5 bg-white/20'"
              >
                <Sun class="mb-2" :class="!settings.darkMode ? 'text-blue-500' : 'opacity-40'" />
                <p class="text-sm font-bold">浅色</p>
              </button>
              <button
                @click="settings.darkMode = true"
                class="p-4 rounded-xl border transition-all"
                :class="settings.darkMode ? 'border-blue-500 bg-blue-500/5' : 'border-gray-200/50 dark:border-white/5 bg-white/20'"
              >
                <Moon class="mb-2" :class="settings.darkMode ? 'text-blue-500' : 'opacity-40'" />
                <p class="text-sm font-bold">深色</p>
              </button>
            </div>
          </section>

          <section class="space-y-4 pt-4">
            <h3 class="text-sm font-bold opacity-60 px-1 uppercase tracking-wider">主题色</h3>
            <div class="flex gap-3">
              <button
                v-for="color in themeColors"
                :key="color.name"
                @click="settings.accentColor = color.hex"
                class="w-8 h-8 rounded-full border-2 transition-transform active:scale-90"
                :style="{ backgroundColor: color.hex }"
                :class="settings.accentColor === color.hex ? 'border-white ring-2 ring-blue-500' : 'border-transparent'"
              ></button>
            </div>
          </section>
        </template>

        <!-- 其他分类占位 -->
        <template v-else>
          <div class="h-64 flex flex-col items-center justify-center opacity-30">
            <Settings :size="48" class="animate-spin-slow mb-4" />
            <p class="text-sm">此配置模块正在开发中...</p>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue';
import {
  Settings,
  Monitor,
  Volume2,
  Palette,
  ShieldCheck,
  Wifi,
  Smartphone,
  Grid,
  User,
  Sun,
  Moon,
  Database
} from 'lucide-vue-next';

// 导航配置
const navItems = [
  { id: 'system', label: '系统', icon: markRaw(Monitor) },
  { id: 'personalization', label: '个性化', icon: markRaw(Palette) },
  { id: 'network', label: '网络和 Internet', icon: markRaw(Wifi) },
  { id: 'apps', label: '应用', icon: markRaw(Grid) },
  { id: 'accounts', label: '账户', icon: markRaw(User) },
  { id: 'privacy', label: '隐私和安全', icon: markRaw(ShieldCheck) },
  { id: 'storage', label: '存储空间', icon: markRaw(Database) },
];

const currentCategory = ref('system');

const activeCategoryLabel = computed(() => {
  return navItems.find(item => item.id === currentCategory.value)?.label || '设置';
});

// 应用设置状态
const settings = ref({
  brightness: 80,
  volume: 45,
  darkMode: true,
  accentColor: '#3b82f6'
});

const themeColors = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Teal', hex: '#14b8a6' },
];
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

/* 简单的滑块自定义样式 */
input[type=range] {
  -webkit-appearance: none;
  background: transparent;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: rgba(155, 155, 155, 0.2);
  border-radius: 2px;
}
input[type=range]::-webkit-slider-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: currentColor;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
</style>
