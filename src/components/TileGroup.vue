<template>
  <div class="flex flex-col gap-2 tile-group">
    <!-- ===== Group Header ===== -->
    <div class="group-header select-none cursor-move">
      <input
          v-if="editing"
          v-model="name"
          class="w-full  outline-none px-2 py-1 rounded
               border border-gray-300 dark:border-gray-700"
          @blur="saveName"
          @keydown.enter="saveName"
      />

      <div
          v-else
          class="hover:bg-white/30 hover:text-black
               dark:hover:bg-black/30 dark:hover:text-white
               rounded py-2 px-2 cursor-default"
          @click="startEdit($event)"
      >
        {{ group.name }}
      </div>
    </div>

    <!-- ===== Tiles ===== -->
    <div
        ref="groupRef"
        class="flex flex-row gap-3 flex-wrap min-h-[64px]"
    >
      <Tile
          v-for="appId in group.apps"
          :key="appId"
          :app="getAppById(appId)"
          @click="startTask(getAppById(appId))"
          @contextmenu.prevent="openContextMenu($event, getAppById(appId))"
      />
    </div>

    <ContextMenu ref="menuRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import Tile from './Tile.vue'
import ContextMenu from './ContextMenu.vue'
import { startTask } from '../stores/taskStore'
import { getAppById } from '../stores/appStore'

const startEdit = function($event){
  $event.stopPropagation()
  editing.value = true
}

const props = defineProps<{
  group: {
    id: string
    name: string
    apps: string[]
  }
}>()

/* ---------- state ---------- */
const menuRef = ref()
const groupRef = ref<HTMLElement>()
const editing = ref(false)
const name = ref(props.group.name)

/* ---------- group name ---------- */
function saveName() {
  props.group.name = name.value
  editing.value = false
}

/* ---------- context menu ---------- */
function openContextMenu(e: MouseEvent, app: any) {
  const options = [
    { label: '打开', action: () => startTask(app) },
    { type: 'divider' },
    {
      label: '调整大小',
      children: [
        { label: '大', action: () => (app.tile.size = 'large') },
        { label: '中', action: () => (app.tile.size = 'medium') },
        { label: '小', action: () => (app.tile.size = 'small') },
      ],
    },
    { label: '删除', action: () => console.log('delete') },
  ]
  e.stopPropagation()
  menuRef.value.open(e, options)
}

/* ---------- draggable ---------- */
useDraggable(groupRef, props.group.apps, {
  animation: 150,
  group: {
    name: 'tiles',
    pull: true,
    put: true,
  },
  ghostClass: 'opacity-40',
  chosenClass: 'ring-blue-400',
})
</script>

<style scoped>
.tile-group {
  min-width: 328px;
  max-width: 328px;
}
</style>
