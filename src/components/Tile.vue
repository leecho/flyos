<template>
  <div class="align-middle text-center
   justify-center rounded
    flex flex-col cursor-pointer
shadow-md shadow-black/50"
       :class="tileClass">
    <div v-if="!subComponent">
      <div class="h-[40px] flex align-middle justify-center mb-[5px]">
        <img :src="logo"/>
      </div>
      <div>
        {{ app.name }}
      </div>
    </div>
    <div v-if="subComponent">
      <component :is="subComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/vue.svg'
import type {AppItem} from "@/stores/appStore.ts";
import {computed, defineAsyncComponent} from "vue";

const props = defineProps({
  app: Object as AppItem
})

const colSpans = {
  'small': 1,
  'medium': 2,
  'large': 2
}

const tileClass = computed(() => {
  return [props.app.bgColor, 'tile-' + props.app.tile.size, 'col-span-' + colSpans[props.app.tile.size]]
})

const subComponent = props.app.tile.component
    ? defineAsyncComponent(() => import(`@/tiles/${props.app.tile.component}.vue`))
    : null


</script>

<style scoped>
.tile-small {
  height: 100px;
  width: 100px;
}

.tile-medium {
  height: 100px;
  width: 215px;
}

.tile-large {
  height: 215px;
  width: 215px;
}
</style>
