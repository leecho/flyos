<template>
  <div class="@container flex flex-col @sm:flex-row h-full w-full bg-[var(--fly-bg-primary)] overflow-hidden text-[var(--fly-text-primary)] font-sans p-6 gap-6">
    <!-- Source Panel -->
    <div class="flex-1 flex flex-col rounded-[var(--fly-radius-md)] bg-[var(--fly-bg-glass)] border border-[var(--fly-border-system)] shadow-sm overflow-hidden transition-all duration-300 h-full focus-within:ring-4 focus-within:ring-accent/5 focus-within:border-accent/30 group">
      <!-- Toolbar -->
      <div class="flex items-center px-5 py-4 border-b border-[var(--fly-border-system)]/50 shrink-0 bg-transparent">
        <div class="relative flex items-center">
          <select 
            v-model="sourceLang" 
            class="bg-transparent appearance-none border-none text-[13px] font-black text-[var(--fly-text-primary)] focus:ring-0 cursor-pointer p-0 pr-8 outline-none z-10 uppercase tracking-wider"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code" class="text-gray-900 dark:text-white bg-white dark:bg-gray-800">{{ lang.name }}</option>
          </select>
          <ChevronDown class="w-4 h-4 opacity-30 absolute right-0 pointer-events-none" stroke-width="3" />
        </div>
        <div class="flex-1"></div>
        <button @click="sourceText = ''" class="opacity-0 group-focus-within:opacity-40 hover:opacity-100 hover:text-red-500 rounded-lg p-2 transition-all bg-transparent hover:bg-red-500/10" title="清空内容" v-if="sourceText">
          <X class="w-4 h-4" stroke-width="2.5" />
        </button>
      </div>
      
      <!-- Input Area -->
      <div class="flex-1 relative p-6 bg-transparent">
        <textarea 
          v-model="sourceText"
          placeholder="在此输入需要翻译的文本..." 
          class="w-full h-full resize-none border-none bg-transparent focus:ring-0 text-xl font-bold leading-relaxed placeholder:opacity-20 p-0 outline-none select-text no-scrollbar"
          @input="handleInput"
        ></textarea>
      </div>

      <!-- Footer -->
      <div class="px-5 py-4 flex items-center justify-between text-[11px] font-black opacity-30 bg-transparent shrink-0 border-t border-[var(--fly-border-system)]/30">
        <span class="uppercase tracking-[0.2em]">{{ sourceText.length }} / 5000</span>
        <button @click="translate" :disabled="!sourceText || isTranslating" class="px-6 py-2 rounded-full bg-accent hover:brightness-110 disabled:opacity-20 text-white text-xs font-black transition-all shadow-xl shadow-accent/20 flex items-center gap-2 active:scale-95 uppercase tracking-widest">
          <span v-if="!isTranslating">翻译内容</span>
          <Loader2 v-else class="w-4 h-4 animate-spin" />
        </button>
      </div>
    </div>

    <!-- Swap Button (Desktop) -->
    <div class="hidden @sm:flex items-center justify-center shrink-0">
      <button 
        @click="swapLanguages"
        class="p-3 rounded-full border border-[var(--fly-border-system)] bg-[var(--fly-bg-secondary)] text-accent hover:bg-accent hover:text-white shadow-2xl transition-all active:scale-90"
        title="交换语言"
      >
        <ArrowLeftRight class="w-5 h-5" stroke-width="2.5" />
      </button>
    </div>
    
    <!-- Mobile Swap Button -->
    <div class="flex items-center justify-center shrink-0 @sm:hidden -my-4 relative z-10">
      <button 
        @click="swapLanguages"
        class="p-3 rounded-full border border-[var(--fly-border-system)] bg-[var(--fly-bg-secondary)] text-accent shadow-xl transition-all"
      >
        <ArrowLeftRight class="w-5 h-5 rotate-90" stroke-width="2.5" />
      </button>
    </div>
    
    <!-- Target Panel -->
    <div class="flex-1 flex flex-col rounded-[var(--fly-radius-md)] bg-[var(--fly-bg-secondary)]/50 border border-[var(--fly-border-system)] shadow-sm overflow-hidden h-full transition-all duration-300">
      <!-- Toolbar -->
      <div class="flex items-center px-5 py-4 border-b border-[var(--fly-border-system)]/50 bg-transparent shrink-0">
        <div class="relative flex items-center">
          <select 
            v-model="targetLang" 
            class="bg-transparent appearance-none border-none text-[13px] font-black text-[var(--fly-text-primary)] focus:ring-0 cursor-pointer p-0 pr-8 outline-none z-10 uppercase tracking-wider"
          >
            <option v-for="lang in targetLanguages" :key="lang.code" :value="lang.code" class="text-gray-900 dark:text-white bg-white dark:bg-gray-800">{{ lang.name }}</option>
          </select>
          <ChevronDown class="w-4 h-4 opacity-30 absolute right-0 pointer-events-none" stroke-width="3" />
        </div>
        <div class="flex-1"></div>
        <button @click="copyTarget" class="opacity-40 hover:opacity-100 hover:text-accent p-2 rounded-lg hover:bg-accent/10 transition-all active:scale-90" title="复制结果">
          <Check v-if="isCopied" class="w-4 h-4 text-emerald-500" stroke-width="3" />
          <Copy v-else class="w-4 h-4" stroke-width="2.5" />
        </button>
      </div>
      
      <!-- Output Area -->
      <div class="flex-1 p-6 relative">
        <div v-if="isTranslating" class="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-10 text-accent">
          <Loader2 class="w-10 h-10 animate-spin opacity-20" />
        </div>
        
        <div 
          class="w-full h-full text-xl font-bold leading-relaxed overflow-y-auto whitespace-pre-wrap select-text no-scrollbar"
          :class="translatedText ? 'text-[var(--fly-text-primary)]' : 'opacity-10'"
        >
          {{ translatedText || '翻译结果将显示在这里...' }}
        </div>
      </div>
      
      <!-- Footer Optional Actions -->
      <div class="px-5 py-4 flex items-center justify-end bg-transparent shrink-0 border-t border-[var(--fly-border-glass)]/10">
        <button 
          @click="speakTarget"
          :disabled="!translatedText"
          :class="['w-10 h-10 rounded-xl transition-all flex items-center justify-center active:scale-90', isSpeaking ? 'text-accent bg-accent/10' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-30 hover:opacity-100', !translatedText ? 'opacity-10 cursor-not-allowed' : '']" 
          :title="isSpeaking ? '停止朗读' : '朗读结果'"
        >
          <Volume2 class="w-5 h-5" :class="isSpeaking ? 'animate-pulse' : ''" stroke-width="2.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, markRaw } from 'vue'
import { Languages, Settings, ArrowRight, ArrowLeftRight, X, Copy, Check, Volume2, Loader2, ChevronDown } from 'lucide-vue-next'

const languages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en', name: '英语 English' },
  { code: 'ja', name: '日语 Japanese' },
  { code: 'ko', name: '韩语 Korean' },
  { code: 'fr', name: '法语 French' },
  { code: 'es', name: '西班牙语 Spanish' },
  { code: 'ru', name: '俄语 Russian' },
  { code: 'de', name: '德语 German' },
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
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
