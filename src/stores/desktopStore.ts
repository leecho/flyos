import { reactive } from 'vue'

export type DesktopMode = "metro" | "desktop"

export const desktopStore = reactive({
  mode: 'desktop',
  iconSize: 'small'
})

export const setMode = (mode: DesktopMode) => {
  desktopStore.mode = mode
}
