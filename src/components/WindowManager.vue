<!-- WindowManager.vue -->
<template>
  <Window
    v-for='win in windowStore.windows'
    :key='win.id'
    :z-index='win.zIndex'
    :title='win.title'
    @mousedown='activeWindow(win.id)'
    @close='stopTask(win.appId)'
    @minimize='toggleMinimize(win.id)'
    @maximize='toggleMaximize(win.id)'
    @contextmenu='openWindowContextMenu($event, win)'
    :maximizable='win.maximizable'
    :height='win.height'
    :width='win.width'
    :id=win.id
    :appId=win.appId
    visible='true'
    :minimized='win.minimized'
    :maximized='win.maximized'
    :params='win.params'
    :component='win.component'></Window>
  <ContextMenu ref='menuRef' />
</template>

<script setup lang='ts'>
import { windowStore, toggleMinimize, toggleMaximize, activeWindow, WindowItem } from '../stores/windowStore'
import { stopTask } from '../stores/taskStore.ts'
import Window from './Window.vue'
import ContextMenu from './ContextMenu.vue'
import { ref } from 'vue'

const menuRef = ref()


const openWindowContextMenu = ($event, win: WindowItem) => {
  $event.stopPropagation()
  const options = [
    { label: '最大化', disabled: win.maximized , action: () => toggleMaximize(win.id) },
    { label: '最小化', action: () => toggleMinimize(win.id) },
    { label: '恢复', disabled: !win.maximized ,action: () => toggleMaximize(win.id) },
    { label: '关闭', action: () => stopTask(win.appId) }
  ]
  menuRef.value.open($event, options)
}

</script>
