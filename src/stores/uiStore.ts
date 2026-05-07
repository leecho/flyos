import { reactive } from 'vue'

export const uiStore = reactive({
  /** 移动端多任务切换器可见性 */
  switcherVisible: false,

  /** 移动端控制中心可见性 */
  controlCenterVisible: false
})

/** 切换多任务视图 */
export function toggleSwitcher() {
  uiStore.switcherVisible = !uiStore.switcherVisible
  if (uiStore.switcherVisible) uiStore.controlCenterVisible = false
}

/** 切换移动端控制中心 */
export function toggleControlCenter() {
  uiStore.controlCenterVisible = !uiStore.controlCenterVisible
  if (uiStore.controlCenterVisible) uiStore.switcherVisible = false
}

/** 关闭所有系统级浮层 */
export function closeAllOverlays() {
  uiStore.switcherVisible = false
  uiStore.controlCenterVisible = false
}
