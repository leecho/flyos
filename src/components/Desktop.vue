<template>
  <div class="w-full flex h-full justify-center md:justify-start p-[20px] pb-[50px]">
  <div ref='desktopRef' class='flex flex-row md:flex-col gap-4 flex-wrap content-start items-center'>
    <div v-for='app in apps'
         :title='app.name'
         :key='app.id'
         @click='startTask(app)'
         @contextmenu.prevent='openContextMenu($event, app)'
         class='desktop-icon  flex flex-col p-[5px] w-[80px] h-[80px] justify-center cursor-pointer items-center rounded-md hover:backdrop-blur-sm hover:bg-accent/55 '>
      <div class='text-center justify-center flex'>
        <AppIcon :id='app.id' size='md'/>
      </div>
      <span class='text-sm text-center truncate w-full mt-1 text-shadow-lg h-[18px] text-white'>{{ app.name }}</span>
    </div>
    <ContextMenu ref='menuRef' />
  </div>
</div>

</template>
<script setup lang='ts'>
import { appStore } from '../stores/appStore.ts'
import { startTask } from '../stores/taskStore.ts'
import { ref } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import AppIcon from './AppIcon.vue'
import ContextMenu from './ContextMenu.vue'

const apps = appStore.apps
const desktopRef = ref<HTMLElement>()
const menuRef = ref()
function openContextMenu(e: MouseEvent, app: any) {
  const options = [
    { label: '打开应用', action: () => startTask(app) },
    { type: 'divider' },
    { label: '从开始屏幕' + (app.fixed ? '取消' : '') + '固定', action: () => app.fixed = !app.fixed }
  ]
  e.stopPropagation()
  menuRef.value.open(e, options)
}


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
