
import { ref, onMounted, onUnmounted } from 'vue';

export function useFullscreen() {
  const isFullscreen = ref(document.fullscreenElement !== null);

  const update = () => {
    isFullscreen.value = document.fullscreenElement !== null;
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      }
    } else {
      if (document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
        }
      }
    }
  };

  onMounted(() => {
    document.addEventListener('fullscreenchange', update);
  });

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', update);
  });

  return { isFullscreen, toggleFullscreen };
}
