import { createApp } from 'vue'
import './style.css'
import './styles/tailwind.css'
import './styles/icofont.css'
import App from './App.vue'
import { themeStore } from '@/stores/themeStore'
import { appStore } from '@/stores/appStore'
import { apps, groups } from './constant/apps'

appStore.apps = apps
appStore.groups = groups
themeStore.initTheme()
createApp(App).mount('#app')

