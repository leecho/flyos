import {reactive} from "vue";

export type IconType = 'svg' | 'image'

export interface AppItem {
    id: string           // 唯一 id
    name: string
    icon: AppIcon
    style: string
    tile: TileConfig
    window: WindowConfig
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
    return appStore.apps.find(w => w.id === id)
}
