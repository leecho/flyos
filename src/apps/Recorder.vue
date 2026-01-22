<template>
  <!-- 根容器：支持系统级深色模式切换 -->
  <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-y-auto transition-colors duration-300">

    <!-- 顶部状态栏 -->
    <div class="p-6 flex flex-col items-center justify-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
      <div
        :class="[
          'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 shadow-sm',
          isRecording
            ? 'bg-red-100 dark:bg-red-500/20 animate-pulse'
            : 'bg-indigo-100 dark:bg-indigo-500/20'
        ]"
      >
        <component
          :is="isRecording ? Mic : Disc"
          :class="[
            isRecording ? 'text-red-500 dark:text-red-400' : 'text-indigo-500 dark:text-indigo-400',
            'w-8 h-8'
          ]"
        />
      </div>

      <div class="text-4xl font-mono font-bold tracking-wider mb-2 text-slate-900 dark:text-white tabular-nums">
        {{ formatTime(duration) }}
      </div>

      <div class="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
        <template v-if="isRecording">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            {{ isPaused ? '录音已暂停' : '正在录音...' }}
          </span>
        </template>
        <template v-else>
          准备就绪
        </template>
      </div>
    </div>

    <!-- 波形可视化区域 -->
    <div v-show='isRecording' class="flex-1 relative bg-slate-900 dark:bg-black flex items-center justify-center overflow-hidden min-h-[120px]">
      <canvas
        ref="canvasRef"
        width="800"
        height="150"
        class="w-full h-48 opacity-90 transition-opacity"
      ></canvas>
      <div v-if="!isRecording && recordings.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-slate-500/50">
        <Volume2 class="w-12 h-12 mb-2 opacity-20" />
        <p class="text-sm font-medium tracking-wide">点击下方按钮开始录制声音</p>
      </div>
    </div>

    <!-- 控制中心 -->
    <div class="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
      <div class="flex items-center justify-center gap-8">
        <template v-if="isRecording">
          <button
            @click="togglePause"
            class="w-12 h-12 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <component :is="isPaused ? Play : Pause" class="w-5 h-5 fill-slate-600 dark:fill-slate-400 text-slate-600 dark:text-slate-400" />
          </button>

          <button
            @click="stopRecording"
            class="w-16 h-16 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-red-900/40 hover:bg-red-600 dark:hover:bg-red-700 transition-transform active:scale-95"
          >
            <Square class="text-white fill-white w-6 h-6" />
          </button>

          <div class="w-12"></div>
        </template>

        <button
          v-else
          @click="startRecording"
          class="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-xl shadow-accent/20 dark:shadow-accent/20 hover:bg-accent/90 dark:hover:bg-accent/80 transition-all hover:scale-105 active:scale-95 group relative"
        >
          <div class="w-16 h-16 rounded-full border-2 border-accent/90 dark:border-accent/30 border-dashed animate-spin-slow absolute group-hover:opacity-100 opacity-0 transition-opacity"></div>
          <Mic class="text-white w-8 h-8" />
        </button>
      </div>
    </div>

    <!-- 录音列表 -->
    <div class="flex-[1.5] min-h-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto px-4 py-4">
      <div class="flex items-center gap-2 mb-3 px-2 text-slate-400 dark:text-slate-500 uppercase text-xs font-bold tracking-widest">
        <ListMusic size="14" />
        历史录音
      </div>

      <div v-if="recordings.length === 0" class="py-12 text-center text-slate-400 dark:text-slate-600 text-sm italic">
        暂无录音记录
      </div>

      <div v-else class="space-y-2 pb-6">
        <!-- 修复点：添加了 dark:bg-slate-900 以及深色模式下的边框适配 -->
        <div
          v-for="rec in recordings"
          :key="rec.id"
          class="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all group"
        >
          <div
            @click="playAudio(rec.url)"
            class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          >
            <Play size="18" class="fill-current" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{{ rec.name }}</div>
            <div class="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Clock size="10" /> {{ rec.date }} · {{ formatTime(rec.duration) }}
            </div>
          </div>

          <!-- 操作按钮组 -->
          <div class="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="downloadRecording(rec)"
              class="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
              title="下载"
            >
              <Download size="16" />
            </button>
            <button
              @click="deleteRecording(rec.id)"
              class="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <audio ref="audioPlayer" class="hidden"></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import {
  Mic, Square, Play, Pause, Trash2,
  Download, Clock, Volume2, ListMusic, Disc
} from 'lucide-vue-next';

// 状态定义
const isRecording = ref(false);
const isPaused = ref(false);
const duration = ref(0);
const recordings = ref([]);
const canvasRef = ref(null);
const audioPlayer = ref(null);

let mediaRecorder = null;
let audioChunks = [];
let timerInterval = null;
let audioContext = null;
let analyser = null;
let animationFrame = null;
let stream = null;

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 绘制波形图
const drawWaveform = () => {
  if (!analyser || !canvasRef.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // 主题感应颜色
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const strokeColor = isDarkMode ? '#818cf8' : '#6366f1';

  const renderFrame = () => {
    animationFrame = requestAnimationFrame(renderFrame);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  renderFrame();
};

// 开始录音
const startRecording = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);

      recordings.value.unshift({
        id: Date.now(),
        url: url,
        duration: duration.value,
        name: `新录音 ${new Date().toLocaleDateString()}`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    };

    mediaRecorder.start();
    isRecording.value = true;
    isPaused.value = false;
    duration.value = 0;

    timerInterval = setInterval(() => {
      duration.value++;
    }, 1000);

    drawWaveform();
  } catch (err) {
    console.error("无法启动录音:", err);
  }
};

// 停止录音
const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop();
    isRecording.value = false;
    isPaused.value = false;

    clearInterval(timerInterval);
    cancelAnimationFrame(animationFrame);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
  }
};

// 暂停/恢复录音
const togglePause = () => {
  if (!mediaRecorder) return;

  if (isPaused.value) {
    mediaRecorder.resume();
    isPaused.value = false;
    timerInterval = setInterval(() => duration.value++, 1000);
  } else {
    mediaRecorder.pause();
    isPaused.value = true;
    clearInterval(timerInterval);
  }
};

// 播放录音
const playAudio = (url) => {
  if (audioPlayer.value) {
    audioPlayer.value.src = url;
    audioPlayer.value.play();
  }
};

// 下载录音
const downloadRecording = (rec) => {
  const link = document.createElement('a');
  link.href = rec.url;
  link.download = `${rec.name}.wav`;
  link.click();
};

// 删除录音
const deleteRecording = (id) => {
  const index = recordings.value.findIndex(r => r.id === id);
  if (index !== -1) {
    URL.revokeObjectURL(recordings.value[index].url);
    recordings.value.splice(index, 1);
  }
};

// 销毁时清理
onUnmounted(() => {
  stopRecording();
  recordings.value.forEach(rec => URL.revokeObjectURL(rec.url));
});
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

/* 深色模式下的滚动条 */
@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
