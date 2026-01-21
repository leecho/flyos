<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[99999] pointer-events-auto"
      @click="close"
      @contextmenu.prevent="close"
    >
      <!-- 主菜单面板 -->
      <Transition name="win11-menu">
        <div
          v-if="visible"
          ref="menuRef"
          class="absolute min-w-[200px] p-1.5 rounded-md border shadow-2xl backdrop-blur-3xl
                 bg-[#f3f3f3]/85 text-slate-900 border-black/5
                 dark:bg-[#202020]/85 dark:text-white dark:border-white/10"
          :style="{ top: position.y + 'px', left: position.x + 'px' }"
          @click.stop
        >
          <template v-for="(item, index) in items" :key="index">
            <!-- 分隔线 -->
            <div
              v-if="item.type === 'divider'"
              class="h-[1px] my-1 mx-2 bg-black/5 dark:bg-white/10"
            ></div>

            <!-- 菜单项 -->
            <div
              v-else
              class="relative group px-3 py-1.5 flex items-center justify-between rounded-md transition-all duration-75"
              :class="[
                item.disabled
                  ? 'opacity-40 cursor-default'
                  : 'cursor-default hover:bg-white/60 dark:hover:bg-white/10'
              ]"
              @click="!item.disabled && select(item)"
              @mouseenter="!item.disabled && openSubMenu(item, index)"
            >
              <div class="flex items-center gap-3">
                <!-- 图标空间 -->
                <div class="w-4 h-4 flex items-center justify-center opacity-70">
                  <component v-if="item.icon" :is="item.icon" class="w-4 h-4" />
                </div>
                <span class="text-[13px] leading-6">{{ item.label }}</span>
              </div>

              <!-- 快捷键/箭头提示 -->
              <div class="flex items-center gap-2">
                <span v-if="item.shortcut" class="text-[11px] opacity-40 font-sans tracking-tight">{{ item.shortcut }}</span>
                <svg
                  v-if="item.children"
                  class="w-3 h-3 opacity-40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              <!-- 子菜单 (递归) -->
              <Transition name="win11-menu">
                <div
                  v-if="item.children && activeSubMenuIndex === index"
                  class="absolute left-[calc(100%+4px)] top-[-6px] min-w-[180px] p-1.5 rounded-md border shadow-2xl backdrop-blur-3xl
                         bg-[#f3f3f3]/95 text-slate-900 border-black/5
                         dark:bg-[#202020]/95 dark:text-white dark:border-white/10"
                >
                  <div
                    v-for="(subItem, subIndex) in item.children"
                    :key="subIndex"
                    class="px-3 py-1.5 flex items-center justify-between rounded-md transition-all"
                    :class="[
                      subItem.disabled
                        ? 'opacity-40 cursor-default'
                        : 'cursor-default hover:bg-white/60 dark:hover:bg-white/10'
                    ]"
                    @click.stop="!subItem.disabled && select(subItem)"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-4 h-4 flex items-center justify-center opacity-70">
                        <component v-if="subItem.icon" :is="subItem.icon" class="w-4 h-4" />
                      </div>
                      <span class="text-[13px] leading-6">{{ subItem.label }}</span>
                    </div>
                    <span v-if="subItem.shortcut" class="text-[11px] opacity-40 font-sans">{{ subItem.shortcut }}</span>
                  </div>
                </div>
              </Transition>
            </div>
          </template>
        </div>
      </Transition>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'

interface MenuItem {
  label?: string
  type?: 'item' | 'divider'
  shortcut?: string
  icon?: any
  disabled?: boolean  // 新增：禁用状态
  action?: () => void
  selected: boolean
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
  let x = e.clientX
  let y = e.clientY

  // 边界溢出检测
  if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 10
  if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 10

  // 确保不会超出左侧边界
  if (x < 10) x = 10

  position.x = x
  position.y = y
}

function close() {
  visible.value = false
  activeSubMenuIndex.value = null
}

function select(item: MenuItem) {
  if (item.disabled) return // 双重保险
  if (item.action) {
    item.action()
    close()
  }
}

function openSubMenu(item: MenuItem, index: number) {
  if (item.disabled) return
  if (item.children) {
    activeSubMenuIndex.value = index
  } else {
    activeSubMenuIndex.value = null
  }
}

defineExpose({ open, close })
</script>

<style scoped>
.win11-menu-enter-active {
  transition: opacity 0.1s ease-out, transform 0.1s cubic-bezier(0.1, 0.9, 0.2, 1);
}
.win11-menu-leave-active {
  transition: opacity 0.08s ease-in;
}
.win11-menu-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(-2px);
}
.win11-menu-leave-to {
  opacity: 0;
}

span {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  user-select: none;
}
</style>
