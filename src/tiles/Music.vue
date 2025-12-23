<template>
  <div class='hte-tile-inner'>
    <div class='music-panel'>
      <audio class='music-audio' autoplay></audio>
      <img class='music-pic' />
      <div class='music-info'>
        <div class='music-title'>-</div>
        <div class='music-artist'>-</div>
        <div class='music-controls'><span>下一首</span>
          <span>暂停</span> <span>播放</span>
          <span class='music-duration'>-</span> <span class='music-status'></span></div>
      </div>
    </div>
    <div class='music-copyright'>9ku.com</div>
  </div>
</template>
<script setup lang='ts'>
import { onMounted, ref } from 'vue'

const songList = ref([])
const song = ref()

onMounted(() => {

})
</script>

