<template>
  <teleport to='body'>
    <div
      v-show='visible'
      class='fixed top-0 left-0 w-full h-full z-[999] flex justify-center items-center'
      @click='close'
      @contextmenu.prevent='close'
    >
      <div
        ref='menuRef'
        class=' w-[800] h-[800] p-[40px]
       rounded-2xl border border-gray-400/50 dark:border-gray-700/60
       flex flex-col gap-5
       text-black dark:text-white
       backdrop-blur-xl bg-white/80 dark:bg-black/70 shadow-2xl shadow-black/50
        ease-in-out duration-300 '
        :style='menuStyle'
        @click.stop>
        <div class='flex'>
          <div class='flex items-center gap-3'>
            <div class='rounded-full border border-gray-400/50 justify-center overflow-hidden'>
              <img :src='userStore.user.avatar' class='w-[36px] h-[36px]' />
            </div>
            <div class='text-lg font-bold text-black/80 dark:text-white/80'>FlyOS User</div>
          </div>
          <div class='flex flex-1 justify-end gap-3'>
            <button @click='lockUser'
                    class='border border-gray-400/50 px-[15px] py-[5px]  rounded hover:bg-gray-400/50 cursor-pointer'>锁定
            </button>
            <button class='border border-gray-400/50 px-[15px] py-[5px]  rounded hover:bg-gray-400/50 cursor-pointer'>
              退出
            </button>
          </div>
        </div>
        <div class='p-[20px] text-center'>
          <input v-model='keyword'
                 class='border bg-white/50 dark:bg-gray-400/50 outline-0 border-gray-400/50 dark:border-gray-700/60 rounded p-2 w-[90%]' />
        </div>
        <div class='grid grid-cols-4 gap-3 '>
          <div v-for='app in apps'
               :title='app.name'
               :key='app.id'
               @click='openApp(app)'
               @contextmenu.prevent='openContextMenu($event, app)'
               class='desktop-icon flex flex-col justify-center p-[15px] cursor-pointer rounded hover:bg-white/10 dark:hover:bg-black/30'>
            <div class='text-center justify-center flex pb-[5px]'>
              <img :src='logo' class='w-[32px] h-[32px]'>
            </div>
            <div class='text-center truncate w-full h-[18px]'>{{ app.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
<script setup lang='ts'>
import { startTask } from '../stores/taskStore.ts'
import logo from '../assets/vue.svg'
import { appStore } from '../stores/appStore.ts'
import { computed, reactive, ref } from 'vue'
import { userStore } from '../stores/userStore.ts'

const menuRef = ref()
const visible = ref(false)
const keyword = ref('')

const position = reactive({
  x: 120,
  y: 120,
  width: 800,
  height: 600
})

position.x = (window.innerWidth - position.width) / 2
position.y = (window.innerHeight - position.height) / 2

const menuStyle = computed(() => {
  return {
    top: position.y + 'px',
    left: position.x + 'px',
    width: position.width + 'px',
    height: position.height + 'px'
  }
})

const apps = computed(() => {
  if (!keyword.value) return appStore.apps
  return appStore.apps.filter((app) => app.name.indexOf(keyword.value) >= 0)
})

const lockUser = () => {
  userStore.user.locked = true
  close()
}

const toggleOpen = () => {
  visible.value = !visible.value
}

const close = () => {
  visible.value = false
}

const openApp = (app: any) => {
  startTask(app)
  close()
}

defineExpose({ toggleOpen })
</script>
