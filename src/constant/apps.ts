import type { AppGroup, AppItem } from "../stores/appStore.ts";

/**
 * 完整应用配置列表
 */
export const apps: AppItem[] = [
    {
        id: "explorer",
        name: "文件资源管理器",
        icon: {
            type: 'svg',
            content: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 5.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"></path>',
            bgColor: "bg-gradient-to-br from-amber-400 to-orange-500"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-yellow-500",
            style: "rounded-lg text-white font-semibold",
            size: "medium",
            component: ""
        },
        window: {
            height: 600,
            width: 900,
            maximizable: true,
            component: 'Explorer'
        },
        fixed: true
    },
    {
        id: "edge",
        name: "Edge 浏览器",
        icon: {
            type: 'svg',
            content: '<path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12c0-2.42.86-4.64 2.3-6.38a1 1 0 0 1 1.5.06 9 9 0 1 0 12.4 12.42 1 1 0 0 1 .06 1.5C16.64 21.14 14.42 22 12 22s-10-4.48-10-10 10-10 10-10z"></path><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"></path>',
            bgColor: "bg-gradient-to-br from-blue-400 to-cyan-600"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-blue-600",
            style: "rounded-lg text-white",
            size: "medium",
            component: ""
        },
        window: {
            height: 700,
            width: 1100,
            maximizable: true,
            component: 'Browser'
        },
        fixed: true
    },
    {
        id: "terminal",
        name: "终端",
        icon: {
            type: 'svg',
            content: '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>',
            bgColor: "bg-gradient-to-br from-slate-700 to-slate-900"
        },
        style: "shadow-inner rounded-lg",
        tile: {
            bgColor: "bg-gray-800",
            style: "text-green-400 font-mono rounded-lg",
            size: "small",
            component: ""
        },
        window: {
            height: 500,
            width: 800,
            maximizable: true,
            component: 'Terminal'
        },
        fixed: true
    },
    {
        id: "store",
        name: "应用商店",
        icon: {
            type: 'svg',
            content: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path>',
            bgColor: "bg-gradient-to-br from-green-400 to-emerald-600"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-green-600",
            style: "rounded-lg text-white",
            size: "medium",
            component: ""
        },
        window: {
            height: 600,
            width: 900,
            maximizable: true,
            component: 'AppStore'
        },
        fixed: true
    },
    {
        id: "settings",
        name: "设置",
        icon: {
            type: 'svg',
            content: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle>',
            bgColor: "bg-gradient-to-br from-gray-400 to-blue-600"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-blue-700",
            style: "rounded-lg text-white",
            size: "small",
            component: ""
        },
        window: {
            height: 550,
            width: 800,
            maximizable: true,
            component: 'Setting'
        },
        fixed: true
    },
    {
        id: "photos",
        name: "照片",
        icon: {
            type: 'svg',
            content: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
            bgColor: "bg-gradient-to-br from-indigo-400 to-purple-500"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-indigo-600",
            style: "rounded-lg text-white",
            size: "medium",
            component: 'Photo'
        },
        window: {
            height: 650,
            width: 950,
            maximizable: true,
            component: 'Photo'
        },
        fixed: true
    },
    {
        id: "calendar",
        name: "日历",
        icon: {
            type: 'svg',
            content: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
            bgColor: "bg-gradient-to-br from-red-400 to-rose-600"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-red-600",
            style: "rounded-lg text-white",
            size: "small",
            component: "Calendar"
        },
        window: {
            height: 420,
            width: 600,
            maximizable: false,
            component: "Calendar"
        },
        fixed: true
    },
    {
        id: "weather",
        name: "天气",
        icon: {
            type: 'svg',
            content: '<path d="M12 2v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="M20 12h2"></path><path d="m19.07 4.93-1.41 1.41"></path><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"></path><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"></path>',
            bgColor: "bg-gradient-to-br from-sky-400 to-blue-500"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-sky-600",
            style: "rounded-lg text-white",
            size: "large",
            component: 'Weather'
        },
        window: {
            height: 540,
            width: 850,
            maximizable: true,
            component: 'Weather'
        },
        fixed: true
    },
    {
        id: "mail",
        name: "邮箱",
        icon: {
            type: 'svg',
            content: '<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path><rect x="2" y="5" width="20" height="14" rx="2"></rect>',
            bgColor: "bg-gradient-to-br from-blue-300 to-indigo-500"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-sky-600",
            style: "rounded-lg text-white",
            size: "medium",
            component: 'Mail'
        },
        window: {
            height: 540,
            width: 850,
            maximizable: true,
            component: 'Mail'
        }
    },
    {
        id: "news",
        name: "新闻",
        icon: {
            type: 'svg',
            content: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path>',
            bgColor: "bg-gradient-to-br from-slate-400 to-slate-600"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-sky-600",
            style: "rounded-lg text-white",
            size: "small",
            component: 'News'
        },
        window: {
            height: 540,
            width: 850,
            maximizable: true,
            component: 'News'
        }
    },
    {
        id: "music",
        name: "音乐",
        icon: {
            type: 'svg',
            content: '<circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle><path d="M9 18V5l12-2v13"></path>',
            bgColor: "bg-gradient-to-br from-purple-500 to-pink-600"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-purple-700",
            style: "rounded-lg text-white",
            size: "medium",
            component: "Music"
        },
        window: {
            height: 560,
            width: 900,
            maximizable: true,
            component: 'Music'
        }
    },
    {
        id: "notepad",
        name: "记事本",
        icon: {
            type: 'svg',
            content: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line>',
            bgColor: "bg-gradient-to-br from-orange-300 to-yellow-500"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-orange-600",
            style: "rounded-lg text-white",
            size: "small",
            component: ""
        },
        window: {
            maximizable: true,
            component: 'Notepad'
        }
    },
    {
        id: "notifier",
        name: "通知中心",
        icon: {
            type: 'svg',
            content: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
            bgColor: "bg-gradient-to-br from-indigo-500 to-purple-700"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-indigo-700",
            style: "rounded-lg text-white font-semibold",
            size: "small",
            component: "Notifier"
        },
        window: {
            height: 500,
            width: 700,
            maximizable: true,
            component: 'Notifier'
        }
    },
    {
        id: "calculator",
        name: "计算器",
        icon: {
            type: 'svg',
            content: '<rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M12 10h.01"></path><path d="M16 10h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path>',
            bgColor: "bg-gradient-to-br from-emerald-400 to-teal-600"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-teal-700",
            style: "rounded-lg text-white",
            size: "small",
            component: ""
        },
        window: {
            height: 480,
            width: 320,
            maximizable: false,
            component: 'Calculator'
        }
    },
    {
        id: "code",
        name: "代码编辑器",
        icon: {
            type: 'svg',
            content: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
            bgColor: "bg-gradient-to-br from-blue-600 to-indigo-800"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-indigo-900",
            style: "rounded-lg text-blue-300 font-mono",
            size: "medium",
            component: ""
        },
        window: {
            height: 700,
            width: 1000,
            maximizable: false,
            component: 'Editor'
        }
    },
    {
        id: "monitor",
        name: "系统监视器",
        icon: {
            type: 'svg',
            content: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
            bgColor: "bg-gradient-to-br from-green-500 to-emerald-700"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-green-900",
            style: "rounded-lg text-green-400 font-bold",
            size: "small",
            component: "Monitor"
        },
        window: {
            height: 450,
            width: 700,
            maximizable: true,
            component: 'Monitor'
        }
    },
    {
        id: "whiteboard",
        name: "协同白板",
        icon: {
            type: 'svg',
            content: '<path d="M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"></path><path d="M6 12l2 2 4-4"></path>',
            bgColor: "bg-gradient-to-br from-pink-400 to-rose-500"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-rose-500",
            style: "rounded-lg text-white",
            size: "small",
            component: ""
        },
        window: {
            height: 600,
            width: 900,
            maximizable: true,
            component: 'Whiteboard'
        }
    },
    {
        id: "recorder",
        name: "录音机",
        icon: {
            type: 'svg',
            content: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line>',
            bgColor: "bg-gradient-to-br from-red-500 to-orange-600"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-red-700",
            style: "rounded-lg text-white",
            size: "small",
            component: ""
        },
        window: {
            width: 400,
            height: 600,
            maximizable: false,
            component: 'Recorder'
        }
    },
    {
        id: "about",
        name: "系统信息",
        icon: {
            type: 'svg',
            content: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
            bgColor: "bg-gradient-to-br from-slate-300 to-slate-500"
        },
        style: "shadow-sm rounded-lg border border-slate-200",
        tile: {
            bgColor: "bg-blue-800",
            style: "rounded-lg text-slate-800",
            size: "small",
            component: ""
        },
        window: {
            width: 450,
            height: 600,
            maximizable: false,
            component: 'About'
        }
    },
    {
        id: "taskmgr",
        name: "任务管理器",
        icon: {
            type: 'svg',
            content: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>',
            bgColor: "bg-gradient-to-br from-gray-600 to-gray-800"
        },
        style: "shadow-lg rounded-lg",
        tile: {
            bgColor: "bg-blue-800",
            style: "rounded-lg text-white",
            size: "small",
            component: ""
        },
        window: {
            height: 550,
            width: 750,
            maximizable: true,
            component: 'TaskManager'
        }
    },
    {
        id: "clock",
        name: "时钟",
        icon: {
            type: 'svg',
            content: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
            bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-indigo-600",
            style: "rounded-lg text-white font-medium",
            size: "medium",
            component: "Clock"
        },
        window: {
            component: 'Clock'
        }
    },
    {
        id: "camera",
        name: "相机",
        icon: {
            type: 'svg',
            content: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>',
            bgColor: "bg-gradient-to-br from-gray-700 to-gray-900"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-gray-800",
            style: "rounded-lg text-white",
            size: "small",
            component: ""
        },
        window: {
            height: 480,
            width: 640,
            maximizable: true,
            component: 'Camera'
        }
    },
    {
        id: "maps",
        name: "地图",
        icon: {
            type: 'svg',
            content: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
            bgColor: "bg-gradient-to-br from-green-400 to-blue-500"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-green-500",
            style: "rounded-lg text-white",
            size: "large",
            component: ""
        },
        window: {
            height: 600,
            width: 800,
            maximizable: true,
            component: 'Maps'
        }
    },
    {
        id: "games",
        name: "游戏",
        icon: {
            type: 'svg',
            content: '<path d="m21 16-4-4-4 4-4-4-4 4-5-5 5-5 4 4 4-4 4 4 4-4 5 5z"></path>',
            bgColor: "bg-gradient-to-br from-purple-600 to-indigo-800"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-indigo-700",
            style: "rounded-lg text-white",
            size: "medium",
            component: ""
        },
        window: {
            height: 600,
            width: 800,
            maximizable: true,
            component: 'Games'
        }
    },
    {
        id: "video",
        name: "视频",
        icon: {
            type: 'svg',
            content: '<path d="m23 7-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>',
            bgColor: "bg-gradient-to-br from-red-500 to-pink-500"
        },
        style: "shadow-md rounded-lg",
        tile: {
            bgColor: "bg-red-600",
            style: "rounded-lg text-white",
            size: "medium",
            component: ""
        },
        window: {
            height: 600,
            width: 900,
            maximizable: true,
            component: 'Video'
        }
    }
] as AppItem[];

/**
 * 分组配置
 */
export const groups: AppGroup[] = [
    {
        id: "system",
        name: "系统管理",
        apps: ["settings", "monitor", "taskmgr", "explorer", "terminal", "about","store"]
    },
    {
        id: "work",
        name: "效率办公",
        apps: ["edge", "code", "notepad", "whiteboard", "mail", "notifier"]
    },
    {
        id: "multimedia",
        name: "多媒体生活",
        apps: ["photos", "music", "recorder", "news", "weather", "camera", "games", "video"]
    },
    {
        id: "utility",
        name: "实用工具",
        apps: ["calculator", "calendar", "clock", "maps"]
    }
];
