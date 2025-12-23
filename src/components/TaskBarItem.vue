<template>
  <div :id="'taskbar-item-' + window.id"
       @click="emits('click')"
       @contextmenu.prevent="onContextmenu"
       :class="itemClass"
       class="cursor-pointer select-none w-8 leading-8 h-8  rounded">
  </div>
</template>
<script setup lang="ts">
import type {WindowItem} from "../stores/windowStore.ts";
import {computed} from "vue";

const props = defineProps({
  window: Object as WindowItem
})
const itemClass = computed(() => {
  return props.window.active ? 'bg-blue-200/80 dark:bg-blue-400/80' : 'bg-gray-300/40 dark:bg-gray-700/40'
})
const emits = defineEmits(['click','contextmenu'])
const onContextmenu = function($event){
  emits('contextmenu', $event)
}

</script>
