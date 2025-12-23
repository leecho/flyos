import type {AppGroup, AppItem} from "../stores/appStore.ts";

export const apps: AppItem[] = [
    {
        id: "explorer",
        name: "文件资源管理器",
        icon: "/icons/explorer.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-yellow-400",
        tile: {
            bgColor: "bg-yellow-500",
            style: "rounded-lg text-white font-semibold",
            size: "medium"
        },
        window: {
            height: 600,
            width: 900,
            maximizable: 1
        }
    },
    {
        id: "edge",
        name: "Edge 浏览器",
        icon: "/icons/edge.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-blue-500",
        tile: {
            bgColor: "bg-blue-600",
            style: "rounded-lg text-white",
            size: "large"
        },
        window: {
            height: 700,
            width: 1100,
            maximizable: 1
        }
    },
    {
        id: "terminal",
        name: "终端",
        icon: "/icons/terminal.png",
        style: "shadow-inner rounded-lg",
        bgColor: "bg-gray-900",
        tile: {
            bgColor: "bg-gray-800",
            style: "text-green-400 font-mono rounded-lg",
            size: "small"
        },
        window: {
            height: 500,
            width: 800,
            maximizable: 1
        }
    },
    {
        id: "store",
        name: "应用商店",
        icon: "/icons/store.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-green-500",
        tile: {
            bgColor: "bg-green-600",
            style: "rounded-lg text-white",
            size: "medium"
        },
        window: {
            height: 600,
            width: 900,
            maximizable: 1,
            component: 'AppStore'
        }
    },
    {
        id: "settings",
        name: "设置",
        icon: "/icons/settings.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-blue-600",
        tile: {
            bgColor: "bg-blue-700",
            style: "rounded-lg text-white",
            size: "small"
        },
        window: {
            height: 550,
            width: 800,
            component: 'Setting'
        }
    },
    {
        id: "photos",
        name: "照片",
        icon: "/icons/photos.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-indigo-500",
        tile: {
            bgColor: "bg-indigo-600",
            style: "rounded-lg text-white",
            size: "medium",
            component: 'Photo'
        },
        window: {
            height: 650,
            width: 950,
            maximizable: 1,
            component: 'Photo'
        }
    },
    {
        id: "calendar",
        name: "日历",
        icon: "/icons/calendar.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-red-500",
        tile: {
            bgColor: "bg-red-600",
            style: "rounded-lg text-white",
            size: "small",
            component: "Calendar"
        },
        window: {
            height: 420,
            width: 600,
            maximizable: 0,
            component: "Calendar"
        }
    },
    {
        id: "weather",
        name: "天气",
        icon: "/icons/weather.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-sky-500",
        tile: {
            bgColor: "bg-sky-600",
            style: "rounded-lg text-white",
            size: "large",
            component: 'Weather'
        },
        window: {
            height: 540,
            width: 850,
            maximizable: 1,
            component: 'Weather'
        }
    },{
        id: "mail",
        name: "邮箱",
        icon: "/icons/mail.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-sky-500",
        tile: {
            bgColor: "bg-sky-600",
            style: "rounded-lg text-white",
            size: "medium",
            component: 'Mail'
        },
        window: {
            height: 540,
            width: 850,
            maximizable: 1,
            component: 'Mail'
        }
    },{
        id: "news",
        name: "新闻",
        icon: "/icons/mail.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-sky-500",
        tile: {
            bgColor: "bg-sky-600",
            style: "rounded-lg text-white",
            size: "small",
            component: 'News'
        },
        window: {
            height: 540,
            width: 850,
            maximizable: 1,
            component: 'News'
        }
    },
    {
        id: "music",
        name: "音乐",
        icon: "/icons/music.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-purple-600",
        tile: {
            bgColor: "bg-purple-700",
            style: "rounded-lg text-white",
            size: "medium",
            component: "Music"
        },
        window: {
            height: 560,
            width: 900,
            maximizable: 1,
            component: 'Music'
        }
    },
    {
        id: "notepad",
        name: "记事本",
        icon: "/icons/note.png",
        style: "shadow-md rounded-lg",
        bgColor: "bg-orange-500",
        tile: {
            bgColor: "bg-orange-600",
            style: "rounded-lg text-white",
            size: "small"
        },
        window: {
            height: 300,
            width: 500,
            maximizable: 0,
            component: 'Notepad'
        }
    }
] as AppItem[]


export const groups = [{
    id: "1",
    name: "Group1",
    apps: ["explorer","terminal","edge","store","settings"]
},{
    id: "2",
    name: "Group2",
    apps: ["photos","calendar","mail","news"]
},{
    id: "3",
    name: "Group3",
    apps: ["music","notepad","weather"]
}] as AppGroup[]
