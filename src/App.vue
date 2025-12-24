<script setup lang='ts'>
import Wallpaper from './components/Wallpaper.vue'
import WindowManager from './components/WindowManager.vue'
import MessageBox from './components/MessageBox.vue'
import LockPanel from './components/LockPanel.vue'
import Container from './components/Container.vue'
import NotificationSystem from './components/NotificationSystem.vue'

</script>

<template>
  <MessageBox />
  <NotificationSystem />
  <Wallpaper />
  <Container />
  <LockPanel />
  <WindowManager />
</template>
