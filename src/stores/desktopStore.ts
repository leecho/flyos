import { reactive, watch } from 'vue'

export type DesktopMode = "metro" | "desktop"

const savedStore = localStorage.getItem('desktop-store');
const initialState = savedStore ? JSON.parse(savedStore) : {
  mode: 'metro',
  iconSize: 'small',
};

// 合并状态，确保 isMobile 不被持久化误导
export const desktopStore = reactive({
  ...initialState,
  isMobile: false
})

watch(desktopStore, (newValue) => {
  localStorage.setItem('desktop-store', JSON.stringify(newValue));
});

export const setMode = (mode: DesktopMode) => {
  desktopStore.mode = mode
}
