// utils/messageBox.ts
import { showMessageBox } from '../stores/messageBoxStore'

export function alert(message: string, targetWindowId?: string) {
    return showMessageBox({ type: 'alert', message, targetWindowId })
}

export function confirmBox(message: string, targetWindowId?: string) {
    return showMessageBox({ type: 'confirm', message, targetWindowId })
}

export function promptBox(message: string, defaultValue = '', targetWindowId?: string) {
    return showMessageBox({ type: 'prompt', message, defaultValue, targetWindowId })
}
