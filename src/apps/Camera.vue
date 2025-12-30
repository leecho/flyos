<template>
  <div class="w-full h-full bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
    <!-- Camera View -->
    <div v-if="!showGallery" class="w-full h-full flex flex-col">
      <video ref="videoEl" autoplay playsinline class="w-full h-full object-cover" v-show="!capturedMedia"></video>

      <div v-if="!hasCamera && !capturedMedia" class="absolute inset-0 flex items-center justify-center z-10">
        <div class="text-center p-4 bg-black/50 rounded-lg">
          <i class="icofont-camera text-7xl"></i>
          <p class="text-lg mt-4">Camera Not Found</p>
          <p class="text-sm text-gray-400">Please check if your camera is connected and permissions are granted.</p>
          <button @click="startCamera" class="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Grant Permission</button>
        </div>
      </div>
      
      <img :src="capturedMedia" v-if="mediaType === 'photo' && capturedMedia" class="w-full h-full object-contain"/>
      <video :src="capturedMedia" v-if="mediaType === 'video' && capturedMedia" controls autoplay class="w-full h-full object-contain"></video>

      <!-- Camera UI Overlays -->
      <div v-if="!capturedMedia" class="absolute top-0 left-0 right-0 p-4 flex justify-end bg-gradient-to-b from-black/50 to-transparent">
        <div class="flex items-center space-x-4 text-2xl">
          <i class="icofont-flash-off cursor-pointer p-2 rounded-full hover:bg-white/10"></i>
          <i class="icofont-gear cursor-pointer p-2 rounded-full hover:bg-white/10"></i>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
        <div v-if="capturedMedia" class="flex items-center justify-center space-x-8 w-full">
          <button @click="discardMedia" class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full font-semibold flex items-center"><i class="icofont-close-line mr-2"></i>Retake</button>
          <button @click="saveMedia" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold flex items-center"><i class="icofont-save mr-2"></i>Save</button>
        </div>
        <div v-else class="flex items-center justify-between w-full">
          <div @click="openGallery" class="w-16 h-12 bg-gray-800 rounded-lg cursor-pointer ring-2 ring-transparent hover:ring-white transition-all overflow-hidden">
             <img v-if="gallery.length > 0" :src="gallery[gallery.length - 1].thumbnail" class="w-full h-full object-cover"/>
             <div v-else class="w-full h-full flex items-center justify-center text-gray-400"><i class="icofont-photos text-2xl"></i></div>
          </div>
          <div class="shutter-button" @click="capture">
              <div class="shutter-button-inner" :class="{'recording': isRecording}"></div>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="switchCamera" class="p-3 rounded-full bg-white/20 hover:bg-white/30">
              <i class="icofont-retweet text-xl"></i>
            </button>
             <button @click="toggleMode" class="p-3 rounded-full bg-white/20 hover:bg-white/30 font-semibold w-20 text-center">
              {{ cameraMode === 'photo' ? 'Video' : 'Photo' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery View -->
    <div v-else class="w-full h-full flex flex-col bg-gray-900">
      <header class="p-4 flex items-center justify-between bg-gray-800/80 backdrop-blur-sm sticky top-0 z-20">
        <h2 class="text-xl font-semibold">Gallery</h2>
        <button @click="closeGallery" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center"><i class="icofont-camera mr-2"></i>Back to Camera</button>
      </header>
      <div v-if="gallery.length === 0" class="flex-grow flex flex-col items-center justify-center text-gray-500">
        <i class="icofont-photos text-7xl"></i>
        <p class="mt-4">Your gallery is empty.</p>
        <p class="text-sm">Take photos or videos to see them here.</p>
      </div>
      <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 p-2 overflow-y-auto">
        <div v-for="media in gallery" :key="media.id" @click="selectMediaForView(media)" class="relative aspect-square cursor-pointer group">
          <img :src="media.thumbnail" class="w-full h-full object-cover rounded-md bg-gray-800">
          <div v-if="media.type === 'video'" class="absolute bottom-1 right-1 text-white">
            <i class="icofont-ui-play text-lg"></i>
          </div>
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <i class="icofont-eye-alt text-3xl text-white"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Viewer -->
    <div v-if="selectedMedia" class="absolute inset-0 bg-black/90 z-30 flex items-center justify-center p-4">
      <img v-if="selectedMedia.type === 'photo'" :src="selectedMedia.src" class="max-w-full max-h-full object-contain">
      <video v-if="selectedMedia.type === 'video'" :src="selectedMedia.src" controls autoplay class="max-w-full max-h-full"></video>
      <button @click="closeMediaViewer" class="absolute top-4 right-4 p-3 rounded-full bg-white/20 hover:bg-white/30"><i class="icofont-close-line text-2xl"></i></button>
      <button @click="deleteMedia(selectedMedia.id)" class="absolute bottom-4 right-4 p-3 rounded-full bg-red-600/80 hover:bg-red-700"><i class="icofont-trash text-2xl"></i></button>
    </div>

    <canvas ref="canvasEl" class="hidden"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

interface Media {
  id: number;
  type: 'photo' | 'video';
  src: string;
  thumbnail: string;
}

const videoEl = ref<HTMLVideoElement | null>(null);
const canvasEl = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);

const hasCamera = ref(false);
const isRecording = ref(false);
const facingMode = ref<'user' | 'environment'>('user');
const cameraMode = ref<'photo' | 'video'>('photo');
const mediaType = ref<'photo' | 'video' | null>(null);
const capturedMedia = ref<string | null>(null);
const capturedThumbnail = ref<string | null>(null);

const gallery = ref<Media[]>([]);
const showGallery = ref(false);
const selectedMedia = ref<Media | null>(null);

const startCamera = async () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
  }
  
  try {
    const constraints = { video: { facingMode: facingMode.value }, audio: cameraMode.value === 'video' };
    stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoEl.value) {
      videoEl.value.srcObject = stream.value;
      hasCamera.value = true;
    }
  } catch (err) {
    console.error("Error accessing camera:", err);
    hasCamera.value = false;
  }
};

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
    hasCamera.value = false;
  }
};

const switchCamera = () => {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user';
  startCamera();
};

const toggleMode = () => {
  cameraMode.value = cameraMode.value === 'photo' ? 'video' : 'photo';
  if(isRecording.value) {
    stopRecording();
  }
  // Re-acquire stream with or without audio
  startCamera();
};

const capture = () => {
  if (cameraMode.value === 'photo') {
    takePhoto();
  } else {
    toggleRecording();
  }
};

const takePhoto = () => {
  if (!videoEl.value || !canvasEl.value) return;
  const video = videoEl.value;
  const canvas = canvasEl.value;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  if (context) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    capturedMedia.value = dataUrl;
    capturedThumbnail.value = dataUrl;
    mediaType.value = 'photo';
    stopCamera();
  }
};

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

const generateVideoThumbnail = (videoEl: HTMLVideoElement): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        videoEl.addEventListener('loadeddata', () => {
            canvas.width = videoEl.videoWidth;
            canvas.height = videoEl.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg'));
            } else {
                resolve(''); // resolve with empty string if context is not available
            }
        }, { once: true });
    });
};


const startRecording = () => {
  if (!stream.value) return;
  isRecording.value = true;
  recordedChunks.value = [];
  mediaRecorder.value = new MediaRecorder(stream.value);
  mediaRecorder.value.ondataavailable = (event) => {
    if (event.data.size > 0) recordedChunks.value.push(event.data);
  };
  mediaRecorder.value.onstop = async () => {
    const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    capturedMedia.value = url;

    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    capturedThumbnail.value = await generateVideoThumbnail(tempVideo);

    mediaType.value = 'video';
    isRecording.value = false;
    stopCamera();
  };
  mediaRecorder.value.start();
};

const stopRecording = () => {
  mediaRecorder.value?.stop();
};

const discardMedia = () => {
  if(capturedMedia.value && mediaType.value === 'video') {
    URL.revokeObjectURL(capturedMedia.value);
  }
  capturedMedia.value = null;
  capturedThumbnail.value = null;
  mediaType.value = null;
  startCamera();
};

const saveMedia = () => {
  if (!capturedMedia.value || !capturedThumbnail.value) return;
  
  gallery.value.push({
    id: Date.now(),
    type: mediaType.value!,
    src: capturedMedia.value,
    thumbnail: capturedThumbnail.value,
  });

  discardMedia();
};

const openGallery = () => { 
  stopCamera();
  showGallery.value = true;
};
const closeGallery = () => {
  showGallery.value = false;
  startCamera();
};

const selectMediaForView = (media: Media) => {
  selectedMedia.value = media;
};
const closeMediaViewer = () => {
  selectedMedia.value = null;
};

const deleteMedia = (id: number) => {
  const media = gallery.value.find(m => m.id === id);
  if(media && media.type === 'video') {
    URL.revokeObjectURL(media.src);
  }
  gallery.value = gallery.value.filter(m => m.id !== id);
  selectedMedia.value = null;
}

onMounted(startCamera);
onBeforeUnmount(stopCamera);
</script>

<style scoped>
.shutter-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 4px solid white;
  box-shadow: 0 0 0 4px rgba(0,0,0,0.2);
  transition: transform 0.2s, border-color 0.3s;
}

.shutter-button:active {
    transform: scale(0.9);
}

.shutter-button-inner {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: white;
  transition: all 0.3s ease-in-out;
}

.shutter-button-inner.recording {
  background-color: #ef4444; /* red-500 */
  border-radius: 12px;
  width: 28px;
  height: 28px;
}
</style>
