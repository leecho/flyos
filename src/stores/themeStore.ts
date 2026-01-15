
import { ref } from "vue"

export type ThemeMode = "light" | "dark" | "system"
export type AccentColor = "blue" | "purple" | "indigo" | "teal" | "emerald" | "rose" | "pink" | "orange"

const mode = ref<ThemeMode>("system")
const accentColor = ref<AccentColor>('blue')
const wallpaper = ref<string>('src/assets/wallpaper.jpg')

const accentColorMap: Record<AccentColor, string> = {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    indigo: '#4f46e5',
    teal: '#14b8a6',
    emerald: '#10b981',
    rose: '#f43f5e',
    pink: '#ec4899',
    orange: '#f97316',
};


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
    const hexColor = accentColorMap[accentColor.value];
    if (hexColor) {
        html.style.setProperty("--accent-color", hexColor);
    }
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

function setWallpaper(newWallpaper: string) {
    wallpaper.value = newWallpaper
    localStorage.setItem("wallpaper", newWallpaper)
}

function initTheme() {
    const saved = localStorage.getItem("theme-mode") as ThemeMode
    if (saved) mode.value = saved

    const savedAccent = localStorage.getItem("accent-color") as AccentColor
    if (savedAccent) accentColor.value = savedAccent

    const savedWallpaper = localStorage.getItem("wallpaper") as string
    if (savedWallpaper) wallpaper.value = savedWallpaper

    applyTheme()
    applyAccentColor()
}

export const themeStore = {
    mode,
    accentColor,
    wallpaper,
    setTheme,
    initTheme,
    setAccentColor,
    setWallpaper,
}
