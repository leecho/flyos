import {reactive} from "vue";
// 导入的函数将进行更新，用一个更强大的 activateWindow 替代 toggleActive
import {activeWindow, closeWindow, openWindow, toggleActive} from "./windowStore";
import type {AppItem} from "./appStore.ts";

export const taskStore = reactive({
    // Map<appId, winId>
    tasks: new Map(),
})

/**
 * 启动一个新任务或激活一个现有任务。
 * @param app - 要启动的应用的应用对象。
 * @param params - [可选] 要传递给应用窗口的任意数据，用于实现打开窗口后执行特定操作等功能。
 */
export function startTask(app: AppItem, params?: any){
    // 检查任务是否已在运行
    if (taskStore.tasks.has(app.id)) {
        const winId = taskStore.tasks.get(app.id);
        // 如果是，则激活现有窗口，并传递新的参数。
        // 这对于处理通知点击等场景至关重要。
        toggleActive(winId, params);
        return;
    }

    // 如果任务未运行，则创建一个新的窗口配置
    const windowItem = {
        title: app.name,
        appId: app.id,
        component: app.window.component,
        maximizable: app.window.maximizable,
        height: app.window.height,
        width: app.window.width,
        params: params, // 在创建时包含初始参数
    }
    
    // 创建新窗口（`openWindow` 也需要被更新以处理 `params`）
    const winId = openWindow(windowItem);
    // 将新任务记录到 taskStore
    taskStore.tasks.set(app.id, winId);
}

/**
 * 停止一个正在运行的任务并关闭其窗口。
 * @param appId - 要停止的应用的 ID。
 */
export function stopTask(appId: string){
    const winId = taskStore.tasks.get(appId)
    closeWindow(winId)
    taskStore.tasks.delete(appId)
}

/**
 * 发送一个“通知”，通过激活一个应用并向其传递数据。
 * 这是 `startTask` 的一个语义化别名，使得从系统其他部分调用意图更清晰。
 * 例如：从通知中心点击一条消息时调用。
 * @param app - 目标应用。
 * @param params - 要传递给应用的数据。
 */
export function notify(app: AppItem, params: any) {
    console.log(`向应用 '${app.name}' 发送通知，参数:`, params);
    startTask(app, params);
}
