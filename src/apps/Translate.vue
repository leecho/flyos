<template>
  <div class="@container flex flex-col @sm:flex-row h-full w-full bg-white dark:bg-gray-900 overflow-hidden text-gray-800 dark:text-gray-200 font-sans p-6 gap-6">
    <!-- Source Panel -->
    <div class="flex-1 flex flex-col rounded-2xl bg-gray-50/60 dark:bg-black/20 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-300 h-full focus-within:ring-1 focus-within:ring-blue-400/50 dark:focus-within:ring-blue-500/30">
      <!-- Toolbar -->
      <div class="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-transparent">
        <div class="relative flex items-center">
          <select 
            v-model="sourceLang" 
            class="bg-transparent appearance-none border-none text-sm font-semibold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer p-0 pr-6 outline-none z-10"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code" class="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">{{ lang.name }}</option>
          </select>
          <ChevronDown class="w-4 h-4 text-gray-500 absolute right-0 pointer-events-none" />
        </div>
        <div class="flex-1"></div>
        <button @click="sourceText = ''" class="text-gray-400 hover:text-red-500 rounded-md p-1.5 transition-colors bg-transparent hover:bg-gray-200/50 dark:hover:bg-gray-700/50" title="清空内容" v-if="sourceText">
          <X class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Input Area -->
      <div class="flex-1 relative p-4 bg-transparent">
        <textarea 
          v-model="sourceText"
          placeholder="输入要翻译的文本..." 
          class="w-full h-full resize-none border-none bg-transparent focus:ring-0 text-lg font-medium leading-relaxed placeholder-gray-400 dark:placeholder-gray-600 p-0 outline-none select-text text-gray-800 dark:text-gray-200"
          @input="handleInput"
        ></textarea>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 flex items-center justify-between text-gray-400 dark:text-gray-500 bg-transparent shrink-0">
        <span class="text-xs font-medium">{{ sourceText.length }} / 5000</span>
        <button @click="translate" :disabled="!sourceText || isTranslating" class="px-4 py-1.5 rounded-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:hover:bg-accent text-white text-sm font-medium transition-all outline-none disabled:shadow-none flex items-center gap-2">
          <span v-if="!isTranslating">翻译</span>
          <Loader2 v-else class="w-4 h-4 animate-spin" />
        </button>
      </div>
    </div>

    <!-- Swap Button (Desktop) -->
    <div class="hidden @sm:flex items-center justify-center shrink-0">
      <button 
        @click="swapLanguages"
        class="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
        title="交换语言"
      >
        <ArrowLeftRight class="w-4 h-4" />
      </button>
    </div>
    
    <!-- Mobile Swap Button -->
    <div class="flex items-center justify-center shrink-0 @sm:hidden -my-3 relative z-10">
      <button 
        @click="swapLanguages"
        class="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-blue-500 shadow-sm transition-all"
      >
        <ArrowLeftRight class="w-4 h-4 rotate-90" />
      </button>
    </div>

    <!-- Target Panel -->
    <div class="flex-1 flex flex-col rounded-2xl bg-gray-50/60 dark:bg-black/20 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden h-full transition-all duration-300">
      <!-- Toolbar -->
      <div class="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-transparent shrink-0">
        <div class="relative flex items-center">
          <select 
            v-model="targetLang" 
            class="bg-transparent appearance-none border-none text-sm font-semibold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer p-0 pr-6 outline-none z-10"
          >
            <option v-for="lang in targetLanguages" :key="lang.code" :value="lang.code" class="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">{{ lang.name }}</option>
          </select>
          <ChevronDown class="w-4 h-4 text-gray-500 absolute right-0 pointer-events-none" />
        </div>
        <div class="flex-1"></div>
        <button @click="copyTarget" class="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors" title="复制结果">
          <Check v-if="isCopied" class="w-4 h-4 text-green-500" />
          <Copy v-else class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Output Area -->
      <div class="flex-1 p-4 relative">
        <div v-if="isTranslating" class="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 z-10 text-blue-500">
          <Loader2 class="w-6 h-6 animate-spin mb-2" />
        </div>
        
        <div 
          class="w-full h-full text-lg font-medium leading-relaxed overflow-y-auto whitespace-pre-wrap select-text"
          :class="translatedText ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'"
        >
          {{ translatedText || '翻译结果将显示在这里...' }}
        </div>
      </div>
      
      <!-- Footer Optional Actions -->
      <div class="px-4 py-3 flex items-center justify-end text-gray-400 shrink-0 bg-transparent">
        <button 
          @click="speakTarget"
          :disabled="!translatedText"
          :class="['p-1.5 rounded-md transition-colors flex items-center justify-center', isSpeaking ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-200/50 dark:hover:bg-gray-800', !translatedText ? 'opacity-50 cursor-not-allowed' : '']" 
          :title="isSpeaking ? '停止朗读' : '朗读结果'"
        >
          <Volume2 class="w-4 h-4" :class="isSpeaking ? 'animate-pulse' : ''" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { Languages, Settings, ArrowRight, ArrowLeftRight, X, Copy, Check, Volume2, Loader2, ChevronDown } from 'lucide-vue-next'

const languages = [
  { code: 'zh-CN', name: '简体中文 (Chinese)' },
  { code: 'en', name: '英语 (English)' },
  { code: 'ja', name: '日语 (Japanese)' },
  { code: 'ko', name: '韩语 (Korean)' },
  { code: 'fr', name: '法语 (French)' },
  { code: 'es', name: '西班牙语 (Spanish)' },
  { code: 'ru', name: '俄语 (Russian)' },
  { code: 'de', name: '德语 (German)' },
]

const targetLanguages = [...languages]

const sourceLang = ref('zh-CN')
const targetLang = ref('en')
const sourceText = ref('')
const translatedText = ref('')
const isTranslating = ref(false)
const isCopied = ref(false)
const isSpeaking = ref(false)

let debounceTimeout: number | ReturnType<typeof setTimeout> | null = null

const handleInput = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    if (sourceText.value.trim()) {
      translate()
    } else {
      translatedText.value = ''
    }
  }, 600)
}

const swapLanguages = () => {
  const temp = sourceLang.value
  sourceLang.value = targetLang.value
  targetLang.value = temp
  
  if (translatedText.value && !sourceText.value) {
    sourceText.value = translatedText.value
  } else {
    const tempText = sourceText.value
    sourceText.value = translatedText.value
    translatedText.value = tempText
  }
  
  if (sourceText.value) {
    translate()
  }
}

const translate = async () => {
  const text = sourceText.value.trim()
  if (!text) return

  isTranslating.value = true
  
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0,500))}&langpair=${sourceLang.value}|${targetLang.value}`)
    const data = await response.json()
    if (data && data.responseData && data.responseData.translatedText) {
      translatedText.value = data.responseData.translatedText
    } else {
      translatedText.value = '翻译失败，请检查网络或稍后再试。'
    }
  } catch (err) {
    console.error('Translation error:', err)
    translatedText.value = '请求失败，可能是网络问题。'
  } finally {
    isTranslating.value = false
  }
}

watch([sourceLang, targetLang], () => {
  if (sourceText.value.trim()) {
    translate()
  }
})

const copyTarget = () => {
  if (translatedText.value) {
    navigator.clipboard.writeText(translatedText.value).then(() => {
      isCopied.value = true
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    }).catch(err => {
      console.error('Failed to copy', err)
    })
  }
}

const speakTarget = () => {
  if (!translatedText.value) return
  
  if (isSpeaking.value) {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
    return
  }
  
  const utterance = new SpeechSynthesisUtterance(translatedText.value)
  utterance.lang = targetLang.value
  
  utterance.onend = () => {
    isSpeaking.value = false
  }
  
  utterance.onerror = () => {
    isSpeaking.value = false
  }
  
  isSpeaking.value = true
  window.speechSynthesis.speak(utterance)
}

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
})
</script>

<style scoped>
/* Optional custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.6);
}
</style>
