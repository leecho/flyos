<template>
    <div
      class='flex-1 flex m-[20px] lg:m-[60px] gap-3 flex-col overflow-y-auto items-center md:items-start content-stretch text-white transition-all duration-500 ease-[cubic-bezier(0.2,1,0.5,1)] '
    >
      <div class='h-[40px] w-[40px] flex'>
        <img :src='logo' />
        <div class='text-3xl ml-[10px] leading-[40px]'>FlyOS</div>
      </div>
      <div ref='groupRef'
           class='flex md:flex-row flex-col flex-1 gap-15 mt-[20px] mb-[20px] w-full overflow-y-auto lg:overflow-x-auto items-center md:items-start'>
        <TileGroup v-for='group in appStore.groups' :group='group' />
      </div>
    </div>
</template>
<script setup lang='ts'>
import logo from '../assets/logo.svg'
import TileGroup from './TileGroup.vue'
import { appStore } from '../stores/appStore'
import { ref } from 'vue'
import { useDraggable } from 'vue-draggable-plus'


const groupRef = ref()

useDraggable(groupRef, appStore.groups, {
  animation: 150,
  handle: '.group-header',
  chosenClass: 'opacity-40'
})
</script>
