import {reactive} from "vue";

export interface AppItem {
    id: string           // 唯一 id
    name: string
    icon: string
    style: string
    bgColor: string
    tile: TileConfig
    window: WindowConfig
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
    return appStore.apps.find(w => w.id === id)
}
