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
    const constraints = { video: { facingMode: facingMode.value, width: 1920, height: 1080 }, audio: cameraMode.value === 'video' };
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
  }
};

const switchCamera = () => {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user';
  startCamera();
};

const toggleMode = () => {
  cameraMode.value = cameraMode.value === 'photo' ? 'video' : 'photo';
  if (isRecording.value) stopRecording();
  startCamera();
};

const capture = () => {
  if (cameraMode.value === 'photo') takePhoto();
  else toggleRecording();
};

const takePhoto = () => {
  if (!videoEl.value || !canvasEl.value) return;
  const { videoWidth, videoHeight } = videoEl.value;
  canvasEl.value.width = videoWidth;
  canvasEl.value.height = videoHeight;
  const context = canvasEl.value.getContext('2d');
  if (context) {
    context.drawImage(videoEl.value, 0, 0, videoWidth, videoHeight);
    const dataUrl = canvasEl.value.toDataURL('image/jpeg');
    capturedMedia.value = dataUrl;
    capturedThumbnail.value = dataUrl;
    mediaType.value = 'photo';
    stopCamera();
  }
};

const toggleRecording = () => {
  if (isRecording.value) stopRecording();
  else startRecording();
};

const generateVideoThumbnail = (videoEl: HTMLVideoElement): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    videoEl.addEventListener('loadeddata', () => {
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      canvas.getContext('2d')!.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg'));
    }, { once: true });
  });
};

const startRecording = () => {
  if (!stream.value) return;
  isRecording.value = true;
  recordedChunks.value = [];
  mediaRecorder.value = new MediaRecorder(stream.value);
  mediaRecorder.value.ondataavailable = e => e.data.size > 0 && recordedChunks.value.push(e.data);
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

const stopRecording = () => mediaRecorder.value?.stop();

const discardMedia = () => {
  if (capturedMedia.value && mediaType.value === 'video') URL.revokeObjectURL(capturedMedia.value);
  capturedMedia.value = null;
  capturedThumbnail.value = null;
  mediaType.value = null;
  startCamera();
};

const saveMedia = () => {
  if (!capturedMedia.value || !capturedThumbnail.value) return;
  gallery.value.unshift({ id: Date.now(), type: mediaType.value!, src: capturedMedia.value, thumbnail: capturedThumbnail.value });
  discardMedia();
};

const openGallery = () => { stopCamera(); showGallery.value = true; };
const closeGallery = () => { showGallery.value = false; startCamera(); };

const selectMediaForView = (media: Media) => selectedMedia.value = media;
const closeMediaViewer = () => selectedMedia.value = null;

const deleteMedia = (id: number) => {
  const media = gallery.value.find(m => m.id === id);
  if (media && media.type === 'video') URL.revokeObjectURL(media.src);
  gallery.value = gallery.value.filter(m => m.id !== id);
  selectedMedia.value = null;
}

onMounted(startCamera);
onBeforeUnmount(stopCamera);
</script>

<template>
  <div class="w-full h-full bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">

    <!-- Camera & Captured Media View -->
    <div v-if="!showGallery" class="w-full h-full flex flex-col items-center justify-center bg-gray-950">
      <video ref="videoEl" autoplay playsinline class="w-full h-full object-cover" v-show="!capturedMedia"></video>
      
      <!-- Fallback when camera is not available -->
      <div v-if="!hasCamera && !capturedMedia" class="absolute inset-0 flex items-center justify-center z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div class="text-center p-8 text-gray-900 dark:text-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-gray-400 dark:text-gray-600 mb-4"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          <h2 class="text-xl font-bold">找不到相机</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">请检查您的相机是否连接并已授予权限。</p>
          <button @click="startCamera" class="mt-6 px-5 py-2 bg-accent/10 text-accent rounded-lg font-semibold hover:bg-accent hover:text-white transition-colors">授予权限</button>
        </div>
      </div>
      
      <img :src="capturedMedia" v-if="mediaType === 'photo' && capturedMedia" class="w-full h-full object-contain"/>
      <video :src="capturedMedia" v-if="mediaType === 'video' && capturedMedia" controls autoplay class="w-full h-full object-contain"></video>
    </div>

    <!-- UI Overlays -->
    <div v-if="hasCamera && !showGallery" class="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
      <!-- Top Controls -->
      <div class="flex justify-end gap-3 pointer-events-auto">
        <button class="p-3 rounded-xl bg-black/30 backdrop-blur-md hover:bg-white/20 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.64 16.36a9 9 0 1 1-12.73-12.73A9 9 0 0 1 21.64 16.36z"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76-2.83-2.83"/></svg></button>
      </div>

      <!-- Bottom Controls -->
      <div class="pointer-events-auto">
        <div v-if="capturedMedia" class="flex items-center justify-center gap-6 p-4 bg-black/30 backdrop-blur-md rounded-2xl">
          <button @click="discardMedia" class="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>重拍</button>
          <button @click="saveMedia" class="px-8 py-3 bg-accent hover:bg-opacity-80 rounded-xl font-semibold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>保存</button>
        </div>
        <div v-else class="flex items-center justify-between w-full">
          <div @click="openGallery" class="w-28 h-16 bg-black/30 backdrop-blur-md rounded-xl cursor-pointer hover:bg-white/20 transition-all overflow-hidden flex items-center justify-center text-gray-300">
             <img v-if="gallery.length > 0" :src="gallery[0].thumbnail" class="w-full h-full object-cover"/>
             <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
          <div class="shutter-button" @click="capture" :class="{'recording': isRecording}">
              <div class="shutter-button-inner"></div>
          </div>
          <div class="flex items-center flex-col gap-2">
            <button @click="switchCamera" class="p-4 rounded-xl bg-black/30 backdrop-blur-md hover:bg-white/20 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1v6h6"/><path d="M23 23v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 1"/><path d="M3.51 15a9 9 0 0 0 14.85 3.36L23 23"/></svg></button>
            <button @click="toggleMode" class="px-4 py-2 rounded-xl bg-black/30 backdrop-blur-md hover:bg-white/20 font-semibold text-center text-sm transition-all w-28">{{ cameraMode === 'photo' ? '视频' : '照片' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery View -->
    <div v-if="showGallery" class="w-full h-full flex flex-col bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl">
      <header class="p-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-200/80 dark:border-gray-800/80">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">相册</h2>
        <button @click="closeGallery" class="px-4 py-2 bg-accent/10 text-accent rounded-lg font-semibold flex items-center gap-2 hover:bg-accent hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>返回相机</button>
      </header>
      <div v-if="gallery.length === 0" class="flex-grow flex flex-col items-center justify-center text-gray-500 dark:text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
        <p class="mt-4 font-semibold">相册是空的</p>
        <p class="text-sm">拍摄的照片或视频会显示在这里</p>
      </div>
      <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1 p-1 overflow-y-auto">
        <div v-for="media in gallery" :key="media.id" @click="selectMediaForView(media)" class="relative aspect-square cursor-pointer group rounded-lg overflow-hidden">
          <img :src="media.thumbnail" class="w-full h-full object-cover bg-gray-200 dark:bg-gray-800 transition-transform group-hover:scale-110">
          <div v-if="media.type === 'video'" class="absolute bottom-1 right-2 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Viewer -->
    <div v-if="selectedMedia" class="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
      <img v-if="selectedMedia.type === 'photo'" :src="selectedMedia.src" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl">
      <video v-if="selectedMedia.type === 'video'" :src="selectedMedia.src" controls autoplay class="max-w-full max-h-full rounded-lg shadow-2xl"></video>
      <button @click="closeMediaViewer" class="absolute top-5 right-5 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
      <button @click="deleteMedia(selectedMedia.id)" class="absolute bottom-5 right-5 p-3 rounded-full bg-accent/80 hover:bg-accent transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
    </div>

    <canvas ref="canvasEl" class="hidden"></canvas>
  </div>
</template>

<style scoped>
.shutter-button {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 4px solid white;
  transition: all 0.3s ease;
}
.shutter-button:active { transform: scale(0.9); }

.shutter-button-inner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shutter-button.recording {
  border-color: var(--accent-color);
}

.shutter-button.recording .shutter-button-inner {
  background-color: var(--accent-color);
  border-radius: 20%;
  width: 32px;
  height: 32px;
}
</style>