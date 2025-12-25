<template>
  <div ref='desktopRef' class='flex flex-col gap-4 m-[20px] pb-[50px] w-full h-full flex-wrap content-start'
       @contextmenu.prevent='menuRef.open($event, desktopMenu)'>
    <div v-for='app in apps'
         :title='app.name'
         :key='app.id'
         @click='startTask(app)'
         class='desktop-icon  flex flex-col p-[5px] w-[80px] h-[80px] justify-center cursor-pointer rounded hover:backdrop-blur-sm hover:bg-white/55 dark:hover:bg-black/55'>
      <div class='text-center justify-center flex'>
        <AppIcon :id='app.id' size='md'/>
      </div>
      <span class='text-center truncate w-full mt-1 text-shadow-sm h-[18px] text-white'>{{ app.name }}</span>
    </div>
  </div>

</template>
<script setup lang='ts'>
import { appStore } from '../stores/appStore.ts'
import logo from '../assets/vue.svg'
import { startTask } from '../stores/taskStore.ts'
import { ref } from 'vue'
import { themeStore } from '../stores/themeStore.ts'
import { useDraggable } from 'vue-draggable-plus'
import AppIcon from './AppIcon.vue'

const apps = appStore.apps
const desktopRef = ref()
const desktopMenu = [
  { label: '刷新', action: () => console.log('刷新') },
  { label: '显示设置', action: () => console.log('显示设置') },
  { type: 'divider' },
  {
    label: '风格',
    children: [
      { label: '浅色', action: () => themeStore.setTheme('light') },
      { label: '深色', action: () => themeStore.setTheme('dark') },
      { label: '跟随系统', action: () => themeStore.setTheme('system') }
    ]
  },
  { label: '个性化', action: () => console.log('个性化') }
]


useDraggable(desktopRef, appStore.apps, {
  animation: 150,
  group: {
    name: 'apps',
    pull: true,
    put: true
  },
  ghostClass: 'opacity-40',
  chosenClass: 'ring-blue-400'
})

</script>
