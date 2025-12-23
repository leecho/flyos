<template>
  <teleport to="body">
    <div
        v-if="visible"
        class="fixed top-0 left-0 w-full h-full z-[99999]"
        @click="close"
        @contextmenu.prevent="close"
    >
      <!-- 右键菜单面板 -->
      <div
        ref="menuRef"
          class="absolute top-0 left-full ml-1 min-w-[150px]
                        rounded-md py-1 border
                       backdrop-blur-sm
                       bg-white/70 text-black border-black/10
                       dark:bg-black/70 dark:text-white dark:border-white/10"
          :style="{ top: position.y + 'px', left: position.x + 'px' }"
        @click.stop
      >
        <template v-for="(item, index) in items">
          <!-- 分隔线 -->
          <div
              v-if="item.type === 'divider'"
              :key="'d-' + index"
              class="h-[1px] my-1 mx-1 bg-black/10 dark:bg-white/10"
          ></div>

          <!-- 普通菜单项 -->
          <div
              v-else
              :key="'item-' + index"
              class="px-3 py-1.5 flex items-center justify-between cursor-pointer transition-all
                     hover:bg-black/10 dark:hover:bg-white/10"
              @click="select(item)"
              @mouseenter="openSubMenu(item, index)"
              @mouseleave="closeSubMenu"
              :class="{ 'relative': item.children }"
          >
            <span class="pl-2">{{ item.label }}</span>

            <!-- 子菜单箭头 -->
            <span v-if="item.children"><i class="icofont-thin-right"></i></span>

            <!-- 子菜单 -->
            <div
                v-if="activeSubMenuIndex === index"
                class="absolute top-0 left-full ml-1 min-w-[150px]
                        rounded-md py-1 border
                       backdrop-blur-sm
                       bg-white/70 text-black border-black/10
                       dark:bg-black/70 dark:text-white dark:border-white/10"
            >
              <div
                  v-for="(sub, i2) in item.children"
                  :key="'sub-' + i2"
                  class="px-3 py-1.5 cursor-pointer transition-all hover:bg-black/10 dark:hover:bg-white/10"
                  @click="select(sub)"
              >
                {{ sub.label }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </teleport>
</template>
<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'

interface MenuItem {
  label?: string
  type?: 'item' | 'divider'
  action?: () => void
  children?: MenuItem[]
}

const visible = ref(false)
const position = reactive({ x: 0, y: 0 })
const items = ref<MenuItem[]>([])
const menuRef = ref<HTMLElement | null>(null)
const activeSubMenuIndex = ref<number | null>(null)

/** 打开右键菜单 */
async function open(e: MouseEvent, menuList: MenuItem[]) {
  e.preventDefault()

  items.value = menuList
  visible.value = true
  activeSubMenuIndex.value = null

  await nextTick()

  if (!menuRef.value) return

  const rect = menuRef.value.getBoundingClientRect()

  // Y 轴
  if (e.clientY + rect.height > window.innerHeight) {
    position.y = window.innerHeight - rect.height - 10
  } else {
    position.y = e.clientY
  }

  // X 轴
  if (e.clientX + rect.width > window.innerWidth) {
    position.x = window.innerWidth - rect.width - 10
  } else {
    position.x = e.clientX
  }
}

/** 关闭菜单 */
function close() {
  visible.value = false
  activeSubMenuIndex.value = null
}

/** 点击菜单项 */
function select(item: MenuItem) {
  item.action?.()
  close()
}

/** 子菜单 */
function openSubMenu(item: MenuItem, index: number) {
  if (item.children) {
    activeSubMenuIndex.value = index
  }
}

function closeSubMenu() {
  activeSubMenuIndex.value = null
}

defineExpose({ open, close })
</script>
