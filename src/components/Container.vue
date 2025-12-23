<template>
  <div class='h-full w-full flex flex-col bg-gray-200/0'
       v-show='!userStore.user.locked'
       @contextmenu.prevent="menuRef.open($event, desktopMenu)">
    <Desktop v-if="desktopStore.mode == 'desktop'" />
    <Metro v-if="desktopStore.mode == 'metro'" />
    <TaskBar />
    <ContextMenu ref="menuRef"/>
  </div>
</template>
<script setup lang='ts'>
import { userStore } from '../stores/userStore.ts'
import { desktopStore } from '../stores/desktopStore.ts'
import Metro from './Metro.vue'
import TaskBar from './TaskBar.vue'
import Desktop from './Desktop.vue'
import ContextMenu from './ContextMenu.vue'
import { themeStore } from '../stores/themeStore.ts'
import { ref } from 'vue'
import Wallpaper from './Wallpaper.vue'
const  menuRef = ref()
const desktopMenu = [
  {label: "刷新", action: () => console.log("刷新")},
  {label: "显示设置", action: () => console.log("显示设置")},
  {type: "divider"},
  {
    label: "风格",
    children: [
      {label: "浅色", action: () => themeStore.setTheme('light')},
      {label: "深色", action: () => themeStore.setTheme('dark')},
      {label: "跟随系统", action: () => themeStore.setTheme('system')},
    ],
  },
  {label: "个性化", action: () => console.log("个性化")},
];

</script>
