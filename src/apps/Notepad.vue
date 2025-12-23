<template>
  <div class='flex gap-3 p-[30px]'>
    <button class='border border-gray-400 rounded p-2' @click=' alertMessage'> Alert</button>
    <button class='border border-gray-400 rounded p-2' @click="confirmBox('是否继续？')"> Confirm</button>
    <button class='border border-gray-400 rounded p-2' @click="promptBox('请输入名称：', '默认值')"> Prompt</button>
  </div>
</template>
<script setup lang='ts'>
import { alert, confirmBox, promptBox } from '../utils/messageBox'

async function alertMessage() {
  await alert('这是一个提示')
}


</script>
