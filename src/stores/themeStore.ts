
import { ref } from "vue"

export type ThemeMode = "light" | "dark" | "system"
export type AccentColor = "blue" | "purple" | "indigo" | "teal" | "emerald" | "rose"

const mode = ref<ThemeMode>("system")
const accentColor = ref<AccentColor>('blue')


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

const applyAccentColor = () => {
    const html = document.documentElement;
    html.style.setProperty("--accent-color", `var(--${accentColor.value})`);
}

function setTheme(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem("theme-mode", newMode)
    applyTheme()
}

function setAccentColor(newColor: AccentColor) {
    accentColor.value = newColor
    localStorage.setItem("accent-color", newColor)
    applyAccentColor()
}

function initTheme() {
    const saved = localStorage.getItem("theme-mode") as ThemeMode
    if (saved) mode.value = saved

    const savedAccent = localStorage.getItem("accent-color") as AccentColor
    if (savedAccent) accentColor.value = savedAccent

    applyTheme()
    applyAccentColor()
}

export const themeStore = {
    mode,
    accentColor,
    setTheme,
    initTheme,
    setAccentColor,
}
