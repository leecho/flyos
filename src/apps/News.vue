<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowLeft, Book, Clock } from 'lucide-vue-next'

// --- STATE ---
const activeCategory = ref('科技')
const selectedNews = ref<any>(null)
const news = ref<any>({})
const loading = ref(true)
const error = ref<string | null>(null)

// 在 newsapi.org 注册免费账户并在此处替换您的 API 密钥
const apiKey = 'fa76fb22c2ff4da684fd65a0f165e146'

const categories = ['科技', '财经', '娱乐', '体育', '综合']
const categoryMap: Record<string, string> = {
  '科技': 'technology',
  '财经': 'business',
  '娱乐': 'entertainment',
  '体育': 'sports',
  '综合': 'general'
}

// --- API ---
async function fetchNews(category: string) {
  if (apiKey === 'YOUR_API_KEY') {
    error.value = '请在 src/apps/News.vue 文件中设置您的 NewsAPI 密钥。'
    loading.value = false
    return
  }

  const categoryParam = categoryMap[category]
  if (!categoryParam) return

  loading.value = true
  error.value = null

  try {
    const res = await fetch(`/api/news?country=us&category=${categoryParam}&apiKey=${apiKey}`)
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || `HTTP 错误！状态: ${res.status}`)
    }
    if (data.status === 'error') {
      throw new Error(data.message)
    }

    news.value[category] = data.articles.map((article: any, index: number) => ({
      id: `${category}-${index}`,
      title: article.title,
      summary: article.description || '暂无摘要',
      source: article.source.name,
      time: formatTime(article.publishedAt),
      fullTime: new Date(article.publishedAt).toLocaleString('zh-CN'),
      content: article.content ? [article.content.split('[+')[0]] : ['暂无内容，请访问原文链接查看详情。'],
      url: article.url,
      imageUrl: article.urlToImage
    }))
  } catch (e: any) {
    error.value = e.message
    console.error(`无法获取 '${category}' 分类的新闻:`, e)
  } finally {
    loading.value = false
  }
}

// --- COMPUTED ---
const featuredNews = computed(() => {
  const list = news.value[activeCategory.value] || []
  return list.length > 0 ? list[0] : null
})

const newsList = computed(() => {
  const list = news.value[activeCategory.value] || []
  return list.length > 1 ? list.slice(1) : []
})

// --- LIFECYCLE & WATCHERS ---
onMounted(() => {
  fetchNews(activeCategory.value)
})

watch(activeCategory, (newCategory) => {
  if (!news.value[newCategory]) {
    fetchNews(newCategory)
  }
})

// --- HELPERS ---
function selectCategory(category: string) {
  activeCategory.value = category
  selectedNews.value = null
}

function formatTime(isoString: string) {
  const date = new Date(isoString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffInSeconds < 60) return `${diffInSeconds}秒前`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}小时前`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}天前`
}

</script>

<template>
  <div class="news-app flex h-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- News List View -->
      <div class="w-full overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <!-- New Header & Tab Navigation -->
          <header class="flex items-baseline mb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-8">新闻</h1>
            <nav class="-mb-px flex space-x-4" aria-label="Categories">
                <a v-for="category in categories"
                   :key="category"
                   href="#"
                   @click.prevent="selectCategory(category)"
                   :class="[
                    activeCategory === category
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600',
                    'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors'
                   ]"
                >
                  {{ category }}
                </a>
            </nav>
          </header>

          <!-- Content Area -->
          <main>
            <div v-if="loading" class="flex items-center justify-center h-64 text-gray-500">正在加载最新内容...</div>
            <div v-else-if="error" class="m-4 p-4 bg-red-100 text-red-700 rounded-lg">错误: {{ error }}</div>
            
            <div v-else-if="featuredNews">
                <!-- Featured News -->
                <div 
                  @click="selectedNews = featuredNews" 
                  class="featured-card group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 mb-6 flex flex-col md:flex-row overflow-hidden"
                >
                    <div v-if="featuredNews.imageUrl" class="md:w-1/2 h-48 md:h-auto">
                        <img :src="featuredNews.imageUrl" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div class="md:w-1/2 p-5 flex flex-col justify-between">
                        <div>
                           <h2 class="text-2xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ featuredNews.title }}</h2>
                           <p class="text-sm text-gray-600 dark:text-gray-400">{{ featuredNews.summary }}</p>
                        </div>
                        <div class="text-xs text-gray-400 dark:text-gray-500 mt-4">{{ featuredNews.source }} · {{ featuredNews.time }}</div>
                    </div>
                </div>

                <!-- News Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div
                        v-for="item in newsList"
                        :key="item.id"
                        @click="selectedNews = item"
                        class="news-card group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                    >
                        <div v-if="item.imageUrl" class="aspect-[16/9] overflow-hidden">
                            <img :src="item.imageUrl" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div class="p-4 flex flex-col flex-grow">
                           <h3 class="font-semibold flex-grow mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ item.title }}</h3>
                           <div class="text-xs text-gray-400 dark:text-gray-500 mt-2">{{ item.source }} · {{ item.time }}</div>
                        </div>
                    </div>
                </div>
            </div>
             <div v-else class="text-center py-10 text-gray-500">该分类下暂无新闻。</div>
          </main>
        </div>
      </div>

      <!-- News Detail View (Slide-in Panel) -->
      <transition name="slide-fade">
          <div
            v-if="selectedNews"
            class="absolute inset-0 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm overflow-y-auto"
          >
            <div class="max-w-4xl mx-auto p-4 sm:p-8">
              <button @click="selectedNews = null" class="flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <ArrowLeft :size="16" /> 返回列表
              </button>
              
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div v-if="selectedNews.imageUrl" class="w-full h-64 bg-gray-200">
                    <img :src="selectedNews.imageUrl" alt="" class="w-full h-full object-cover" />
                </div>
                <div class="p-6 sm:p-10">
                    <h1 class="text-3xl lg:text-4xl font-bold mb-4">{{ selectedNews.title }}</h1>
                    <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 border-y dark:border-gray-700 py-3">
                        <div class="flex items-center gap-1.5"><Book :size="14"/><span>{{ selectedNews.source }}</span></div>
                        <div class="flex items-center gap-1.5"><Clock :size="14"/><span>{{ selectedNews.fullTime }}</span></div>
                    </div>
                    <div class="prose dark:prose-invert max-w-none text-base leading-relaxed">
                        <p>{{ (selectedNews.content || []).join('\n\n') }}</p>
                    </div>
                    <a :href="selectedNews.url" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline mt-6 inline-block">阅读原文 &rarr;</a>
                </div>
              </div>
            </div>
          </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.prose {
  color: #374151;
}
.dark .prose {
  color: #d1d5db;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
