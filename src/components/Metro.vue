<template>
  <div
    class='h-full flex p-[20px] lg:p-[60px] gap-3 flex-col overflow-y-auto items-center md:items-start content-stretch text-white transition-all duration-500 ease-[cubic-bezier(0.2,1,0.5,1)] '
  >
    <div class='h-[40px] w-[40px] flex'>
      <img :src='logo' />
      <div class='text-3xl ml-[10px] leading-[40px]'>FlyOS</div>
    </div>
    <div ref='groupRef'
         class='flex md:flex-row flex-col flex-1 gap-15 mt-[20px] mb-[20px] w-full overflow-y-auto lg:overflow-x-auto items-center md:items-start'>
      <TileGroup v-for='group in appStore.groups' :group='group' @select-tile='openContextMenu' />
    </div>
  </div>
  <ContextMenu ref='menuRef' />
</template>
<script setup lang='ts'>
import logo from '../assets/logo.svg'
import TileGroup from './TileGroup.vue'
import { appStore, type AppItem } from '../stores/appStore'
import { ref } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import ContextMenu from './ContextMenu.vue'
import { startTask } from '../stores/taskStore.ts'
import { CheckIcon } from 'lucide-vue-next'
const menuRef = ref()

function openContextMenu(e: MouseEvent, app: any) {
  const options = [
    { label: '打开应用', action: () => startTask(app) },
    { type: 'divider' },
    {
      label: '尺寸',
      children: [
        { label: '小', icon: getSizeMenuIcon(app,'small') , action: () => (app.tile.size = 'small') },
        { label: '中', icon: getSizeMenuIcon(app,'medium') ,action: () => (app.tile.size = 'medium') },
        { label: '大', icon: getSizeMenuIcon(app,'large') ,action: () => (app.tile.size = 'large') }
      ]
    },
    { label: '从开始屏幕' + (app.fixed ? '取消' : '') + '固定', action: () => app.fixed = !app.fixed }
  ]
  e.stopPropagation()
  menuRef.value.open(e, options)
}

const getSizeMenuIcon = (app: AppItem, size: string) => {
  if(app.tile.size == size) return CheckIcon
  return null
}


const groupRef = ref()

useDraggable(groupRef, appStore.groups, {
  animation: 150,
  handle: '.group-handler',
  chosenClass: 'opacity-40'
})
</script>
