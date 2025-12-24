<template>
  <div
    class="terminal-wrapper w-full h-full flex flex-col font-mono text-sm overflow-hidden bg-black/90 text-green-400 p-2 selection:bg-green-800 selection:text-white"
    @click="focusInput"
  >
    <!-- 终端历史输出区 -->
    <div ref="outputRef" class="flex-1 overflow-y-auto space-y-1 mb-2 scrollbar-terminal">
      <!-- 欢迎词 -->
      <div class="mb-4">
        <p class="text-white">FlyOS Terminal [Version 1.0.42]</p>
        <p class="text-xs text-gray-500">(c) FlyOS Corporation. All rights reserved.</p>
        <p class="mt-2">输入 <span class="text-yellow-400 underline decoration-dotted">help</span> 查看可用命令列表。</p>
      </div>

      <!-- 历史条目 -->
      <div v-for="(line, index) in history" :key="index" class="break-all whitespace-pre-wrap">
        <div v-if="line.type === 'command'" class="flex items-start gap-2">
          <span class="text-blue-400 font-bold shrink-0">➜</span>
          <span class="text-gray-400 shrink-0">{{ currentPath }}</span>
          <span class="text-white">{{ line.content }}</span>
        </div>
        <div v-else-if="line.type === 'output'" class="pl-4 py-0.5 text-green-300 opacity-90">
          {{ line.content }}
        </div>
        <div v-else-if="line.type === 'error'" class="pl-4 py-0.5 text-red-400 italic">
          {{ line.content }}
        </div>
      </div>
    </div>

    <!-- 当前输入行 -->
    <div class="flex items-center gap-2 border-t border-green-900/30 pt-2 pb-1 shrink-0">
      <span class="text-blue-400 font-bold">➜</span>
      <span class="text-gray-400">{{ currentPath }}</span>
      <div class="relative flex-1">
        <input
          ref="inputRef"
          v-model="inputBuffer"
          type="text"
          class="w-full bg-transparent border-none outline-none text-white focus:ring-0 p-0"
          autofocus
          @keydown.enter="handleEnter"
        />
        <!-- 模拟光标效果（如果 input 失去焦点） -->
        <div v-if="!isFocused" class="absolute left-0 top-0 h-full w-2 bg-green-500/50 animate-pulse"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'

interface HistoryItem {
  type: 'command' | 'output' | 'error'
  content: string
}

const inputBuffer = ref('')
const currentPath = ref('~')
const history = ref<HistoryItem[]>([])
const outputRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(true)

// 命令逻辑映射
const commands: Record<string, (args: string[]) => string | void> = {
  help: () => {
    return `可用命令:
  help      - 显示帮助信息
  ls        - 列出当前目录文件
  clear     - 清空终端屏幕
  cd [path] - 切换目录
  echo [msg]- 打印文本
  whoami    - 显示当前用户信息
  date      - 显示当前系统时间
  exit      - 关闭终端`
  },
  ls: () => {
    return 'Documents/  Downloads/  Desktop/  Projects/  Secret_Keys.txt  README.md'
  },
  clear: () => {
    history.value = []
  },
  whoami: () => 'flyos_user',
  date: () => new Date().toLocaleString(),
  echo: (args) => args.join(' '),
  cd: (args) => {
    if (!args[0] || args[0] === '~') {
      currentPath.value = '~'
      return
    }
    currentPath.value = `~/${args[0].replace(/^\/+|\/+$/g, '')}`
    return `已切换至: ${currentPath.value}`
  },
  exit: () => {
    // 这里通常需要调用 windowStore 的关闭逻辑，演示中仅打印
    return '正在退出会话...'
  }
}

const handleEnter = () => {
  const fullCommand = inputBuffer.value.trim()
  if (!fullCommand) return

  // 记录输入的命令
  history.value.push({ type: 'command', content: fullCommand })

  const [cmd, ...args] = fullCommand.split(' ')

  // 执行命令
  if (commands[cmd]) {
    const result = commands[cmd](args)
    if (result) {
      history.value.push({ type: 'output', content: result })
    }
  } else {
    history.value.push({
      type: 'error',
      content: `终端: 找不到命令 "${cmd}"。请输入 "help" 查看可用命令。`
    })
  }

  // 重置并滚动
  inputBuffer.value = ''
  scrollToBottom()
}

const scrollToBottom = async () => {
  await nextTick()
  if (outputRef.value) {
    outputRef.value.scrollTop = outputRef.value.scrollHeight
  }
}

const focusInput = () => {
  inputRef.value?.focus()
  isFocused.value = true
}

// 监听焦点状态
onMounted(() => {
  window.addEventListener('focusin', () => isFocused.value = true)
  window.addEventListener('focusout', () => isFocused.value = false)
})
</script>

<style scoped>
/* 滚动条美化 */
.scrollbar-terminal::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-terminal::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-terminal::-webkit-scrollbar-thumb {
  background: rgba(34, 197, 94, 0.2);
  border-radius: 10px;
}
.scrollbar-terminal::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 197, 94, 0.4);
}

.terminal-wrapper {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

/* 简单的文字阴影增强对比度 */
.text-white {
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
}

.text-green-400 {
  text-shadow: 0 0 5px rgba(74, 222, 128, 0.2);
}
</style>
