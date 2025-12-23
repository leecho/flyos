interface MessageBoxOptions {
    type: 'alert' | 'confirm' | 'prompt'
    message: string
    defaultValue?: string
    targetWindowId?: string  // 如果指定了窗口ID，遮罩只覆盖这个窗口
}

interface MessageBoxState extends MessageBoxOptions {
    visible: boolean
    resolve?: (value: any) => void
}

// stores/messageBoxStore.ts
import { reactive } from 'vue'

export const messageBoxStore = reactive<{
    queue: MessageBoxState[]
}>({
    queue: []
})

export function showMessageBox(options: MessageBoxOptions) {
    return new Promise<any>((resolve) => {
        messageBoxStore.queue.push({
            ...options,
            visible: true,
            resolve
        })
    })
}

export function closeMessageBox(box: MessageBoxState, result?: any) {
    box.visible = false
    if (box.resolve) box.resolve(result)
    const index = messageBoxStore.queue.indexOf(box)
    if (index >= 0) messageBoxStore.queue.splice(index, 1)
}
