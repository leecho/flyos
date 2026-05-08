<template>
  <div class="mobile-nav-container fixed bottom-0 left-0 right-0 z-[999999] pointer-events-none">
    <div class="mobile-nav-bar w-full h-[var(--mobile-nav-height)] pointer-events-auto
                bg-white/50 dark:bg-black/30 backdrop-blur-[60px] border-t border-gray-900/5 dark:border-white/10
                shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex items-center justify-around px-6 relative overflow-hidden transition-colors duration-500">
      
      <!-- 首页 -->
      <button 
        class="nav-item group" 
        @click="handleHome"
        aria-label="首页"
      >
        <div class="nav-icon-wrapper group-active:scale-90 transition-all duration-300">
          <HomeIcon class="w-7 h-7 text-gray-900/80 dark:text-white/90 group-hover:text-gray-900 dark:group-hover:text-white" :stroke-width="1.8" />
        </div>
      </button>

      <!-- 任务清单 (App Switcher) -->
      <button 
        class="nav-item group" 
        @click="handleTasks"
        aria-label="任务清单"
      >
        <div class="nav-icon-wrapper group-active:scale-90 transition-all duration-300">
          <LayoutGridIcon class="w-7 h-7 text-gray-900/80 dark:text-white/90 group-hover:text-gray-900 dark:group-hover:text-white" :stroke-width="1.8" />
        </div>
      </button>

      <!-- 控制中心 (Notification Center) -->
      <button 
        class="nav-item group" 
        @click="handleControlCenter"
        aria-label="控制中心"
      >
        <div class="nav-icon-wrapper group-active:scale-90 transition-all duration-300">
          <Settings2Icon class="w-7 h-7 text-gray-900/80 dark:text-white/90 group-hover:text-gray-900 dark:group-hover:text-white" :stroke-width="1.8" />
        </div>
      </button>

      <!-- 底部指示条 (Home Indicator) - 贴底模式下更细长 -->
      <div class="home-indicator"></div>
    </div>
  </div>

</template>

<script setup lang="ts">
import {  minimizeAll } from '../stores/windowStore'
import { HomeIcon, LayoutGridIcon, Settings2Icon } from 'lucide-vue-next'
import { toggleControlCenter, toggleSwitcher } from '@/stores/uiStore'
import { closeAllOverlays } from '@/stores/uiStore'


const handleHome = () => {
  // 1. 最小化所有窗口
  minimizeAll()
closeAllOverlays()
}

const handleTasks = () => {
  minimizeAll()
  toggleControlCenter()
  toggleSwitcher()
}

const handleControlCenter = () => {
  minimizeAll()
  toggleSwitcher()
  toggleControlCenter()
}
</script>

<style scoped>
.mobile-nav-container {
  display: flex;
  justify-content: center;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  cursor: pointer;
  position: relative;
  padding-bottom: 4px; /* 为指示条留出极小空间 */
}

.nav-icon-wrapper {
  padding: 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item:active .nav-icon-wrapper {
  background-color: rgba(255, 255, 255, 0.1);
}

.home-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
}
.dark .home-indicator {
  background: rgba(255, 255, 255, 0.2);
}
.home-indicator {
  border-radius: 2px;
}

/* 进场动画 */
.mobile-nav-bar {
  animation: slideUpDocked 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUpDocked {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 微弱的高光扫描效果 */
.mobile-nav-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.03),
    transparent
  );
  animation: shine 8s infinite linear;
}

@keyframes shine {
  0% { left: -150%; }
  20% { left: 150%; }
  100% { left: 150%; }
}
</style>
