import {reactive} from "vue";
import {closeWindow, openWindow, toggleActive} from "./windowStore";
import type {AppItem} from "./appStore.ts";

export const taskStore = reactive({
    tasks: new Map(),
})

export function startTask(app: AppItem){
    if (taskStore.tasks.has(app.id)) {
        const winId = taskStore.tasks.get(app.id);
        toggleActive(winId);
        return;
    }

    const windowItem = {
        title: app.name,
        appId: app.id,
        component: app.window.component,
        maximizable: app.window.maximizable,
        height: app.window.height,
        width: app.window.width
    }
    // 创建新窗口
    const winId = openWindow(windowItem);
    taskStore.tasks.set(app.id, winId);
}

export function stopTask(appId: string){
    const winId = taskStore.tasks.get(appId)
    closeWindow(winId)
    taskStore.tasks.delete(appId)
}
