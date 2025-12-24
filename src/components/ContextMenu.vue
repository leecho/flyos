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
          class="absolute min-w-[180px] p-1.5 rounded-xl border shadow-2xl backdrop-blur-3xl
                 bg-[#f3f3f3]/85 text-slate-900 border-black/5
                 dark:bg-[#202020]/85 dark:text-white dark:border-white/10"
          :style="{ top: position.y + 'px', left: position.x + 'px' }"
          @click.stop
        >
          <!-- 顶部常用工具栏 -->
<!--          <div class="flex items-center justify-between px-2 py-1 mb-1 border-b border-black/5 dark:border-white/5">-->
<!--            <div v-for="icon in quickIcons" :key="icon.id"-->
<!--                 class="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"-->
<!--                 :title="icon.label">-->
<!--              <component :is="icon.svg" class="w-4 h-4" />-->
<!--            </div>-->
<!--          </div>-->

          <template v-for="(item, index) in items" :key="index">
            <!-- 分隔线 -->
            <div
              v-if="item.type === 'divider'"
              class="h-[1px] my-1 mx-2 bg-black/5 dark:bg-white/10"
            ></div>

            <!-- 菜单项 -->
            <div
              v-else
              class="relative group px-3 py-1.5 flex items-center justify-between cursor-default rounded-md transition-all duration-75
                     hover:bg-white/60 dark:hover:bg-white/10"
              @click="select(item)"
              @mouseenter="openSubMenu(item, index)"
            >
              <div class="flex items-center gap-3">
                <!-- 图标空间：统一高度和宽度占位 -->
                <div class="w-4 h-4 flex items-center justify-center opacity-70">
                  <component v-if="item.icon" :is="item.icon" class="w-4 h-4" />
                </div>
                <span class="text-[13px] leading-6">{{ item.label }}</span>
              </div>

              <!-- 快捷键/箭头提示 -->
              <div class="flex items-center gap-2">
                <span v-if="item.shortcut" class="text-[11px] opacity-40 font-sans">{{ item.shortcut }}</span>
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
                  class="absolute left-[calc(100%-2px)] top-[-6px] min-w-[180px] p-1.5 rounded-xl border shadow-2xl backdrop-blur-3xl
                         bg-[#f3f3f3]/95 text-slate-900 border-black/5
                         dark:bg-[#202020]/95 dark:text-white dark:border-white/10"
                >
                  <div
                    v-for="(subItem, subIndex) in item.children"
                    :key="subIndex"
                    class="px-3 py-1.5 flex items-center justify-between cursor-default rounded-md transition-all
                           hover:bg-white/60 dark:hover:bg-white/10"
                    @click.stop="select(subItem)"
                  >
                    <div class="flex items-center gap-3">
                      <!-- 二级菜单项高度与一级菜单完全对齐 (py-1.5 + leading-6) -->
                      <div class="w-4 h-4 flex items-center justify-center opacity-70">
                        <component v-if="subItem.icon" :is="subItem.icon" class="w-4 h-4" />
                      </div>
                      <span class="text-[13px] leading-6">{{ subItem.label }}</span>
                    </div>
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
import { ref, reactive, nextTick, shallowRef, h } from 'vue'

interface MenuItem {
  label?: string
  type?: 'item' | 'divider'
  shortcut?: string
  icon?: any
  action?: () => void
  children?: MenuItem[]
}

const visible = ref(false)
const position = reactive({ x: 0, y: 0 })
const items = ref<MenuItem[]>([])
const menuRef = ref<HTMLElement | null>(null)
const activeSubMenuIndex = ref<number | null>(null)

// 辅助函数：创建 Windows 11 风格的工具栏图标
const createIcon = (d: string) => shallowRef({
  render: () => h('svg', {
    fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: '2'
  }, [h('path', { d, strokeLinecap: 'round', strokeLinejoin: 'round' })])
})

const quickIcons = [
  { id: 'cut', label: '剪切', svg: createIcon('M7 13l-2 2m0 0l-2-2m2 2l2 2m0-2l7-7m0 0l2-2m-2 2l-2 2m2-2l7 7') },
  { id: 'copy', label: '复制', svg: createIcon('M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2') },
  { id: 'rename', label: '重命名', svg: createIcon('M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z') },
  { id: 'share', label: '共享', svg: createIcon('M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z') },
  { id: 'delete', label: '删除', svg: createIcon('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16') },
]

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

  position.x = x
  position.y = y
}

/** 关闭菜单 */
function close() {
  visible.value = false
  activeSubMenuIndex.value = null
}

/** 处理点击 */
function select(item: MenuItem) {
  if (item.action) {
    item.action()
    close()
  }
}

/** 悬停处理 */
function openSubMenu(item: MenuItem, index: number) {
  if (item.children) {
    activeSubMenuIndex.value = index
  } else {
    activeSubMenuIndex.value = null
  }
}

defineExpose({ open, close })
</script>

<style scoped>
/* Win11 风格的精致进入动画 */
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
}
</style>
