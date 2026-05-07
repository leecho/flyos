<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowLeft, RefreshCcw, ExternalLink, TrendingUp } from 'lucide-vue-next'

// --- CONSTANTS ---
const categories = [
  { id: 'general',       name: '综合',  sub: 'worldnews' },
  { id: 'technology',    name: '科技',  sub: 'technology' },
  { id: 'business',      name: '财经',  sub: 'business' },
  { id: 'entertainment', name: '娱乐',  sub: 'entertainment' },
  { id: 'sports',        name: '体育',  sub: 'sports' },
  { id: 'health',        name: '健康',  sub: 'health' },
  { id: 'science',       name: '科学',  sub: 'science' },
]

// --- STATE ---
const activeCategoryId = ref('general')
const selectedNews = ref<any>(null)
const news = ref<Record<string, any[]>>({})
const loading = ref(true)
const error = ref<string | null>(null)

// --- API ---
// 数据源：Reddit 公开 JSON API
// 完全无需 API Key，CORS 开放，稳定可靠
async function fetchNews(categoryId: string) {
  loading.value = true
  error.value = null

  const cat = categories.find(c => c.id === categoryId)
  const subreddit = cat?.sub || 'worldnews'

  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/top.json?limit=25&t=day`,
      { headers: { Accept: 'application/json' } }
    )

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    const posts: any[] = data?.data?.children ?? []

    const items = posts
      .map((child: any, index: number) => {
        const p = child.data
        if (p.removed_by_category || p.selftext === '[removed]') return null

        // 封面图优先级：preview → thumbnail → picsum 占位
        let imageUrl = `https://picsum.photos/seed/${subreddit}${index}/800/450`
        if (p.preview?.images?.[0]?.source?.url) {
          imageUrl = p.preview.images[0].source.url.replaceAll('&amp;', '&')
        } else if (p.thumbnail?.startsWith('http')) {
          imageUrl = p.thumbnail
        }

        const upvotes = (p.ups as number)?.toLocaleString() ?? '0'
        const comments = (p.num_comments as number)?.toLocaleString() ?? '0'

        return {
          id: `${categoryId}-${p.id}`,
          title: p.title,
          summary: p.selftext?.slice(0, 200) || `↑ ${upvotes} 赞  ·  ${comments} 条评论`,
          source: `r/${p.subreddit}`,
          author: `u/${p.author}`,
          time: formatTime(p.created_utc * 1000),
          fullTime: new Date(p.created_utc * 1000).toLocaleString('zh-CN'),
          content: p.selftext
            ? p.selftext.split('\n\n').filter(Boolean)
            : [`↑ ${upvotes} 人点赞，${comments} 条讨论`, '完整内容请点击下方"阅读原文"。'],
          url: p.url,
          redditUrl: `https://reddit.com${p.permalink}`,
          imageUrl,
          upvotes: p.ups,
          comments: p.num_comments,
        }
      })
      .filter(Boolean) as any[]

    if (items.length === 0) throw new Error('该分类暂时没有内容')
    news.value[categoryId] = items
  } catch (e: any) {
    error.value = e.message ?? '未知错误'
    console.error(`[News] fetch error (${categoryId}):`, e)
  } finally {
    loading.value = false
  }
}

// --- COMPUTED ---
const currentNewsList = computed(() => news.value[activeCategoryId.value] ?? [])
const featuredNews    = computed(() => currentNewsList.value[0] ?? null)
const remainingNews   = computed(() => currentNewsList.value.slice(1))

// --- HELPERS ---
function selectCategory(id: string) {
  activeCategoryId.value = id
  selectedNews.value = null
  if (!news.value[id]) fetchNews(id)
}

function formatTime(tsMs: number) {
  const s = Math.floor((Date.now() - tsMs) / 1000)
  if (s < 60)   return `${s}秒前`
  const m = Math.floor(s / 60)
  if (m < 60)   return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}小时前`
  return `${Math.floor(h / 24)}天前`
}

// --- LIFECYCLE ---
onMounted(() => fetchNews(activeCategoryId.value))
watch(activeCategoryId, id => { if (!news.value[id]) fetchNews(id) })
</script>

<template>
  <div class="news-app @container h-full w-full bg-[var(--fly-bg-primary)] text-[var(--fly-text-primary)] font-sans overflow-hidden flex flex-col">
    <!-- Header: Tabs -->
    <header class="shrink-0 bg-[var(--fly-bg-glass)] border-b border-[var(--fly-border-system)] backdrop-blur-xl z-20">
      <!-- <div class="px-6 pt-6 pb-2 flex items-center justify-between">
        <button
          @click="fetchNews(activeCategoryId)"
          class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all duration-500"
          :class="loading ? 'animate-spin' : ''"
        >
          <RefreshCcw :size="18" class="opacity-40" />
        </button>
      </div> -->
      
      <!-- Scrollable Tabs -->
      <nav class="px-5 flex gap-2 justify-center overflow-x-auto no-scrollbar pb-3 pt-4">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          @click="selectCategory(cat.id)"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-black whitespace-nowrap transition-all uppercase tracking-widest border-2',
            activeCategoryId === cat.id 
              ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' 
              : 'border-transparent opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
          ]"
        >
          {{ cat.name }}
        </button>
      </nav>
    </header>

    <!-- Main Content List -->
    <main class="flex-1 overflow-y-auto no-scrollbar p-6">
      <!-- Loading -->
      <div v-if="loading" class="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
        <RefreshCcw class="animate-spin" :size="32" stroke-width="1.5" />
        <p class="text-xs font-black uppercase tracking-widest italic">Fetching Headlines...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="h-full flex flex-col items-center justify-center space-y-4">
        <div class="p-6 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 text-center max-w-sm space-y-2">
          <p class="font-black uppercase tracking-wider text-xs">Connection Error</p>
          <p class="text-sm opacity-80">{{ error }}</p>
        </div>
        <button
          @click="fetchNews(activeCategoryId)"
          class="text-xs font-black text-accent uppercase tracking-widest underline"
        >重试抓取</button>
      </div>
      
      <!-- Content -->
      <div v-else class="max-w-6xl mx-auto space-y-10 pb-20">
        <!-- Featured News Card -->
        <section v-if="featuredNews" @click="selectedNews = featuredNews" class="group cursor-pointer">
          <div class="relative overflow-hidden rounded-[var(--fly-radius-lg)] bg-[var(--fly-bg-glass)] border border-[var(--fly-border-glass)] shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
            <div class="aspect-[21/9] overflow-hidden relative">
              <img :src="featuredNews.imageUrl" alt="" class="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[var(--fly-bg-primary)] via-transparent to-transparent opacity-80"></div>
              <div class="absolute bottom-6 left-6 right-6">
                <span class="px-2.5 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-3 inline-block">今日头条</span>
                <h2 class="text-2xl @lg:text-4xl font-black leading-tight group-hover:text-accent transition-colors line-clamp-3">{{ featuredNews.title }}</h2>
              </div>
            </div>
            <div class="px-6 py-4 flex items-center gap-4 text-[11px] font-black opacity-30 uppercase tracking-widest">
              <span>{{ featuredNews.source }}</span>
              <span class="w-1 h-1 bg-current rounded-full"></span>
              <span>{{ featuredNews.time }}</span>
              <span class="w-1 h-1 bg-current rounded-full"></span>
              <span>↑ {{ featuredNews.upvotes?.toLocaleString() }}</span>
            </div>
          </div>
        </section>

        <!-- News Grid -->
        <section class="grid grid-cols-1 @lg:grid-cols-2 @xl:grid-cols-3 gap-6">
          <div 
            v-for="item in remainingNews" 
            :key="item.id"
            @click="selectedNews = item"
            class="group cursor-pointer flex flex-col bg-[var(--fly-bg-glass)] border border-[var(--fly-border-glass)] rounded-[var(--fly-radius-md)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
          >
            <div class="aspect-[16/9] overflow-hidden bg-[var(--fly-bg-secondary)]">
              <img :src="item.imageUrl" alt="" class="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" loading="lazy" />
            </div>
            <div class="p-5 flex flex-col flex-1">
              <h3 class="text-base font-bold leading-snug tracking-tight mb-4 group-hover:text-accent transition-colors line-clamp-3">{{ item.title }}</h3>
              <div class="mt-auto flex items-center justify-between text-[10px] font-black opacity-30 uppercase tracking-tighter">
                <span>{{ item.source }}</span>
                <span class="flex items-center gap-1">
                  <TrendingUp :size="10" />
                  {{ item.upvotes?.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <p v-if="currentNewsList.length === 0" class="text-center py-20 opacity-20 font-black uppercase tracking-widest">No News Available</p>
      </div>
    </main>

    <!-- Detail View: Sliding Overlay -->
    <Transition name="slide">
      <div v-if="selectedNews" class="absolute inset-0 z-50 bg-[var(--fly-bg-primary)] overflow-y-auto no-scrollbar flex flex-col">
        <!-- Detail Header -->
        <header class="sticky top-0 px-4 sm:px-6 py-4 flex justify-between items-center bg-[var(--fly-bg-glass)] backdrop-blur-xl z-20 border-b border-[var(--fly-border-system)]">
          <button @click="selectedNews = null" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-all">
            <ArrowLeft :size="20" stroke-width="3" />
          </button>
          <a
            :href="selectedNews.redditUrl || selectedNews.url"
            target="_blank"
            class="px-4 py-2 bg-accent/10 text-accent text-[11px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 hover:bg-accent hover:text-white transition-all"
          >
            阅读原文 <ExternalLink :size="12" stroke-width="3" />
          </a>
        </header>

        <!-- Detail Content -->
        <article class="max-w-3xl mx-auto w-full px-6 py-12 space-y-8">
          <div class="space-y-4">
            <div class="flex items-center gap-3 text-[11px] font-black opacity-40 uppercase tracking-[0.2em] flex-wrap">
              <span class="text-accent">{{ selectedNews.source }}</span>
              <span>/</span>
              <span>{{ selectedNews.author }}</span>
              <span>/</span>
              <span>{{ selectedNews.fullTime }}</span>
              <span v-if="selectedNews.upvotes" class="flex items-center gap-1">
                / ↑ {{ selectedNews.upvotes?.toLocaleString() }}
              </span>
            </div>
            <h1 class="text-3xl sm:text-5xl font-black leading-tight">{{ selectedNews.title }}</h1>
          </div>

          <img :src="selectedNews.imageUrl" alt="" class="w-full aspect-[16/9] object-cover rounded-[var(--fly-radius-md)] shadow-2xl" />

          <div class="prose-fly space-y-6">
            <p v-for="(p, i) in selectedNews.content" :key="i" class="text-lg leading-relaxed font-medium opacity-80">
              {{ p }}
            </p>
            <div class="p-6 bg-[var(--fly-bg-secondary)] rounded-[var(--fly-radius-sm)] border border-[var(--fly-border-system)] italic opacity-60 text-sm">
              内容来源于 {{ selectedNews.source }}，版权归原作者所有。FlyOS 新闻聚合不代表任何立场。
            </div>
          </div>
        </article>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }

.slide-enter-active, .slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.prose-fly p {
  line-height: 1.8;
  word-break: break-word;
}
</style>
