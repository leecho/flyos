import { reactive, watch } from 'vue'

export type DesktopMode = "metro" | "desktop"

const savedStore = localStorage.getItem('desktop-store');
const initialState = savedStore ? JSON.parse(savedStore) : {
  mode: 'metro',
  iconSize: 'small',
};

export const desktopStore = reactive(initialState)

watch(desktopStore, (newValue) => {
  localStorage.setItem('desktop-store', JSON.stringify(newValue));
});

export const setMode = (mode: DesktopMode) => {
  desktopStore.mode = mode
}
