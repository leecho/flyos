import { reactive } from 'vue'

/* ---------------- 类型 ---------------- */

export interface WindowItem {
    id: string
    title: string
    component?: string
    width?: number | string
    height?: number | string

    zIndex: number
    isOpen: boolean
    minimized: boolean
    maximized: boolean
    maximizable: boolean
    active?: boolean
}

/* ---------------- Store ---------------- */

export const windowStore = reactive({
    windows: [] as WindowItem[],
    nextZIndex: 100,

    /** 当前激活窗口 id */
    active: null as string | null,

    /**
     * 激活栈（焦点历史）
     * 栈顶 = 当前 active
     */
    actives: [] as string[]
})

/* ---------------- 工具函数 ---------------- */

export function getWindow(id?: string): WindowItem | null {
    if (!id) return null
    return windowStore.windows.find(w => w.id === id) || null
}

/* ---------------- 打开窗口 ---------------- */

export function openWindow(
    win: Omit<WindowItem, 'id' | 'zIndex' | 'isOpen' | 'minimized' | 'maximized'>
) {
    const id = crypto.randomUUID()

    const windowItem: WindowItem = {
        ...win,
        id,
        zIndex: windowStore.nextZIndex++,
        isOpen: true,
        minimized: false,
        maximized: false,
        active: false
    }

    windowStore.windows.push(windowItem)
    activeWindow(id)

    return id
}

/* ---------------- 激活逻辑（核心） ---------------- */

export function activeWindow(id: string) {
    const win = getWindow(id)
    if (!win || win.minimized) return

    // 从 actives 中移除旧位置
    windowStore.actives = windowStore.actives.filter(wid => wid !== id)

    // 推入栈顶
    windowStore.actives.push(id)

    // 更新 active
    windowStore.active = id

    // 标记窗口状态
    windowStore.windows.forEach(w => {
        w.active = w.id === id
    })

    bringToFront(id)
}

/** 激活栈顶窗口 */
function activateTop() {
    const nextId = windowStore.actives.at(-1)
    if (nextId) {
        activeWindow(nextId)
    } else {
        windowStore.active = null
        windowStore.windows.forEach(w => (w.active = false))
    }
}

/* ---------------- TaskBar / 点击切换 ---------------- */

export function toggleActive(id: string, params: Object | null) {
    const win = getWindow(id)
    if (!win) return

    // 当前激活 → 最小化
    if (windowStore.active === id && !win.minimized) {
        toggleMinimize(id)
        return
    }

    // 已最小化 → 恢复 + 激活
    if (win.minimized) {
        toggleMinimize(id)
        return
    }

    // 普通激活
    activeWindow(id)
}

/* ---------------- 最小化 / 最大化 ---------------- */

export function toggleMinimize(id: string) {
    const win = getWindow(id)
    if (!win) return

    win.minimized = !win.minimized

    if (win.minimized) {
        // 从激活栈中移除
        windowStore.actives = windowStore.actives.filter(wid => wid !== id)

        if (windowStore.active === id) {
            activateTop()
        }
    } else {
        // 恢复时直接激活
        activeWindow(id)
    }
}

export function toggleMaximize(id: string) {
    const win = getWindow(id)
    if (!win) return

    win.maximized = !win.maximized
    activeWindow(id)
}

/* ---------------- 关闭窗口 ---------------- */

export function closeWindow(id: string) {
    windowStore.windows = windowStore.windows.filter(w => w.id !== id)
    windowStore.actives = windowStore.actives.filter(wid => wid !== id)

    if (windowStore.active === id) {
        activateTop()
    }
}

/* ---------------- ZIndex ---------------- */

export function bringToFront(id: string) {
    const win = getWindow(id)
    if (win) {
        win.zIndex = windowStore.nextZIndex++
    }
}
