import { reactive } from 'vue'

export type DesktopMode = "metro" | "desktop"

export const desktopStore = reactive({
  mode: 'metro',
  iconSize: 'small'
})

export const setMode = (mode: DesktopMode) => {
  desktopStore.mode = mode
}

