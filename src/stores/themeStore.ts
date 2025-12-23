import { ref } from "vue"

export type ThemeMode = "light" | "dark" | "system"

const mode = ref<ThemeMode>("system")


const applyTheme = () => {
    const html = document.documentElement;
    if (mode.value === "dark") {
        html.classList.add("dark");
    } else if (mode.value === "light") {
        html.classList.remove("dark");
    } else {
        // system
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
    }
};

function setTheme(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem("theme-mode", newMode)
    applyTheme()
}

function initTheme() {
    const saved = localStorage.getItem("theme-mode") as ThemeMode
    if (saved) mode.value = saved

    applyTheme()


}

export const themeStore = {
    mode,
    setTheme,
    initTheme,
}
