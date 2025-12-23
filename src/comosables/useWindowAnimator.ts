import {nextTick} from 'vue'

interface AnimatorOptions {
    id: string
    windowRef: Object
}

export function useWindowAnimator({ id, windowRef }: AnimatorOptions) {

    /* ------------------ 最小化 ------------------ */
    async function playMinimize() {
        await nextTick()

        const win = windowRef.value
        const task = document.getElementById(`taskbar-item-${id}`)
        if (!win || !task) return

        const w = win.getBoundingClientRect()
        const t = task.getBoundingClientRect()

        const dx = t.left + t.width / 2 - (w.left + w.width / 2)
        const dy = t.top + t.height / 2 - (w.top + w.height / 2)

        win.style.transition =
            'transform .35s cubic-bezier(.4,0,.2,1), opacity .25s'
        win.style.transformOrigin = 'center'
        win.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`
        win.style.opacity = '0'

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                clearStyle()
                resolve()
            }, 360)
        })
    }

    /* ------------------ 恢复（关键） ------------------ */
    function prepareRestore() {
        const win = windowRef.value
        const task = document.getElementById(`taskbar-item-${id}`)
        if (!win || !task) return

        const w = win.getBoundingClientRect()
        const t = task.getBoundingClientRect()

        const dx = t.left + t.width - (w.left + w.width / 2)
        const dy = t.top + t.height - (w.top + w.height / 2)

        win.style.transition = 'none'
        win.style.transformOrigin = 'center'
        win.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`
        win.style.opacity = '0'

        // ⚠️ 强制浏览器接受这个状态
        win.offsetHeight
    }

    function playRestore() {
        const win = windowRef.value
        if (!win) return

        win.style.transition =
            'transform .35s cubic-bezier(.4,0,.2,1), opacity .25s ease-out'
        win.style.transform = 'translate(0,0) scale(1)'
        win.style.opacity = '1'

        setTimeout(clearStyle, 360)
    }

    function clearStyle() {
        const win = windowRef.value
        if (!win) return
        win.style.transition = ''
        win.style.transform = ''
        win.style.opacity = ''
    }

    return {
        playMinimize,
        prepareRestore,
        playRestore
    }
}
