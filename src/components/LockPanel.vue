<template>
  <teleport to='body'>
      <div
        v-show='visible'
        ref="menuRef"
        class=" absolute left-0 top-0 z-[99999] w-full h-full p-[40px]
       rounded-2xl border border-gray-400/50 dark:border-gray-700/60
       flex flex-col gap-5
       text-black dark:text-white
       backdrop-blur-sm bg-white/20 dark:bg-black/20 shadow-2xl shadow-black/50
        ease-in-out duration-300 "
        @click.stop>
        <div class="flex items-center justify-center w-full h-full">
          <div class='flex flex-col items-center gap-3'>
            <div class='rounded-full border border-gray-400/50 justify-center overflow-hidden'>
              <img :src='userStore.user.avatar' class='w-[120px] h-[120px]' />
            </div>
            <div class='text-lg font-bold text-black/80 dark:text-white/80'>FlyOS User</div>
            <div class=' text-center'>
              <input v-model='keyword' type='password' class="border bg-white/50 dark:bg-gray-400/50 outline-0 border-gray-400/50 dark:border-gray-700/60 rounded p-2" />
            </div>
            <div class="flex flex-1 justify-end gap-3 pt-[10px]">
              <button @click='unlock' class='border border-gray-400/50 px-[15px] py-[5px]  rounded hover:bg-gray-400/50 cursor-pointer'>登录</button>
            </div>
          </div>
        </div>
      </div>
  </teleport>
</template>
<script setup lang='ts'>
import { computed, reactive, ref, watch } from 'vue'
import { userStore } from '../stores/userStore.ts'
const menuRef = ref()
const visible = ref(false)
const keyword = ref('')

watch(
  () => userStore.user.locked,
  (newValue) => {
    visible.value = newValue
  },
  { immediate: true }
)

const unlock = () => {
  userStore.user.locked = false
}

window.setInterval(() => {
  if(userStore.user.locked){
    visible.value = true
  }
}, 500)

</script>
