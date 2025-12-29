<template>
  <div class='flex flex-col gap-4 tile-group select-none'>
    <!-- ===== 分组标题 ===== -->
    <div class='group-header px-1 flex justify-center items-center'>
      <div class='flex-1 max-h-[30px]'>
        <input
          v-if='editing'
          v-model='name'
          ref='editInput'
          class='bg-white/10 outline-none px-2 py-1 rounded border border-white/20 w-full text-lg text-white'
          @blur='saveName'
          @keydown.enter='saveName'
        />
        <div
          v-else
          class='text-lg opacity-90 hover:opacity-100 cursor-pointer py-1 text-white'
          @click='startEdit'
        >
          {{ group.name || '未命名分组' }}
        </div>
      </div>
      <div v-if='!editing' class='flex-col opacity-50 group-handler hidden cursor-move'>
        <SquareMenuIcon />
      </div>
    </div>

    <!-- ===== 磁贴网格 (使用 CSS Grid 解决乱序) ===== -->
    <!-- 我们设定 6 列，这样可以灵活分配 1x1, 2x2, 4x2 的比例 -->
    <div
      ref='groupRef'
      class='grid grid-cols-3 auto-rows-[100px] gap-2 p-1 w-full'
      style='grid-auto-flow: dense;'
    >
      <Tile
        v-for='appId in group.apps'
        :key='appId'
        :app='getAppById(appId)'
        @click='startTask(getAppById(appId))'
        @contextmenu.prevent='openContextMenu($event, getAppById(appId))'
      />
    </div>

    <ContextMenu ref='menuRef' />
  </div>
</template>

<script setup lang='ts'>
import { ref, nextTick } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import Tile from './Tile.vue'
import ContextMenu from './ContextMenu.vue'
import { startTask } from '../stores/taskStore'
import { getAppById } from '../stores/appStore'
import { SquareMenuIcon } from 'lucide-vue-next'

const props = defineProps<{
  group: {
    id: string
    name: string
    apps: string[]
  }
}>()

const menuRef = ref()
const groupRef = ref<HTMLElement>()
const editing = ref(false)
const name = ref(props.group.name)
const editInput = ref<HTMLInputElement>()

function startEdit() {
  editing.value = true
  nextTick(() => editInput.value?.focus())
}

function saveName() {
  props.group.name = name.value
  editing.value = false
}

function openContextMenu(e: MouseEvent, app: any) {
  const options = [
    { label: '打开应用', action: () => startTask(app) },
    { type: 'divider' },
    {
      label: '尺寸',
      children: [
        { label: '小 (2x2)', action: () => (app.tile.size = 'small') },
        { label: '中 (4x2)', action: () => (app.tile.size = 'medium') },
        { label: '大 (4x4)', action: () => (app.tile.size = 'large') }
      ]
    },
    { label: '从开始屏幕取消固定', action: () => console.log('Remove', app.id) }
  ]
  e.stopPropagation()
  menuRef.value.open(e, options)
}

useDraggable(groupRef, props.group.apps, {
  animation: 200,
  ghostClass: 'opacity-20',
  group: 'tiles'
})
</script>

<style scoped>
.tile-group {
  /* 限制单组宽度，确保磁贴折行整齐 */
  min-width: 330px;
  max-width: 330px;
}
.group-header:hover .group-handler{
  display: flex;
}
</style>
