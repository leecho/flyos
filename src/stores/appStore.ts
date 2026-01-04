import {reactive} from "vue";

export type IconType = 'svg' | 'image'

export interface AppItem {
    id: string           // 唯一 id
    name: string
    icon: AppIcon
    style: string
    tile: TileConfig
    window: WindowConfig
    fixed: boolean
}

export interface AppIcon {
    type: IconType
    content: string
    bgColor: string
}

export interface TileConfig{
    bgColor: string
    style: string
    size: string
    component: string
}

export interface WindowConfig{
    height: number
    width: number
    maximizable: boolean
    component: any       // Vue 组件
}

export interface AppGroup {
    id: string           // 唯一 id
    name: string
    apps: string[]
}


export const  appStore = reactive({
    apps: [] as AppItem[],
    groups: [] as AppGroup[]
})

export function getAppById(id: string) {
    return appStore.apps.find(w => w.id === id) as AppItem
}

/**
 * 更新指定分组的应用列表
 * @param groupId 分组ID
 * @param appIds 新的应用ID列表
 */
export function updateGroupApps(groupId: string, appIds: string[]) {
    const group = appStore.groups.find(g => g.id === groupId);
    if (group) {
        group.apps = appIds;
    }
}

/**
 * 从所有分组中移除一个应用
 * @param appId 要移除的应用ID
 */
export function removeAppFromGroups(appId: string) {
    appStore.groups.forEach(group => {
        const index = group.apps.indexOf(appId);
        if (index > -1) {
            group.apps.splice(index, 1);
        }
    });
}

/**
 * 创建一个包含单个应用的新分组
 * @param appId 要添加到新分组的应用ID
 */
export function createNewGroupWithApp(appId: string) {
    // 1. 从旧分组中移除该应用
    removeAppFromGroups(appId);

    // 2. 创建一个新分组
    const newGroup: AppGroup = {
        id: `group-${Date.now()}`,
        name: '新建分组',
        apps: [appId]
    };

    // 3. 将新分组添加到 store
    appStore.groups.push(newGroup);
}
