<template>
  <div class="tile-group flex flex-col items-start mr-8 min-w-[308px]">
    <!-- ===== 分组标题 (可拖动的手柄) ===== -->
    <div class="group-handler cursor-move">
      <div class="group-title text-xl text-white font-light antialiased ml-1 mb-2">
        {{ group.name }}
      </div>
    </div>

    <!-- ===== 磁贴网格 (磁贴的拖放区域) ===== -->
    <div
      ref="tileGridRef"
      class="grid grid-cols-3 auto-rows-[100px] gap-2 p-1 w-full min-h-[100px]"
      style="grid-auto-flow: dense;"
    >
      <Tile
        v-for="appId in localApps"
        :key="appId"
        :app="getAppById(appId)"
        @click="startTask(getAppById(appId)!)"
        @contextmenu.prevent="$emit('select-tile', $event, getAppById(appId))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDraggable } from 'vue-draggable-plus';
import Tile from './Tile.vue';
import type { AppGroup } from '../stores/appStore';
import { getAppById, updateGroupApps } from '../stores/appStore';
import { startTask } from '../stores/taskStore';

const props = defineProps<{
  group: AppGroup;
}>();

defineEmits(['select-tile']);

const tileGridRef = ref<HTMLElement | null>(null);

// 为 vue-draggable-plus 创建一个本地的、可响应的应用列表副本
const localApps = ref<string[]>([]);

// 同步 localApps 与 prop
watch(() => props.group.apps, (newApps) => {
  localApps.value = [...newApps];
}, { immediate: true, deep: true });

useDraggable(tileGridRef, localApps, {
  animation: 150,
  group: 'tiles', // 共享的组名，允许跨组拖动
  onEnd: () => {
    // onEnd 事件在列表内部或跨列表的拖动操作完成后触发。
    // 我们用它来持久化列表的最终状态。
    updateGroupApps(props.group.id, localApps.value);
  },
});
</script>

<style scoped>
.tile-group {
  min-height: 200px; /* 保证有一定高度，方便拖入 */
}
</style>
