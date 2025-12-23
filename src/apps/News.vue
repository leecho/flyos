<template>
  <div class="news-app h-full flex flex-col bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-900 dark:text-zinc-100 overflow-hidden">
    <!-- 顶部导航栏 -->
    <header class="flex items-center justify-between px-6 py-4 border-b border-zinc-500/10">
      <div class="flex items-center gap-2">
        <div class="p-1.5 bg-sky-500 rounded-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
        </div>
        <h1 class="text-lg font-bold tracking-tight">FlyOS 新闻</h1>
      </div>

      <nav class="flex gap-4 overflow-x-auto no-scrollbar max-w-md">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap',
            activeCategory === cat ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'hover:bg-black/5 dark:hover:bg-white/10 opacity-70'
          ]"
        >
          {{ cat }}
        </button>
      </nav>
    </header>

    <!-- 内容区域 -->
    <main class="flex-1 overflow-y-auto custom-scrollbar relative">
      <!-- 新闻列表 -->
      <div v-if="!selectedNews" class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 今日焦点 (首位大卡片) -->
        <div
          @click="openNews(featuredNews)"
          class="md:col-span-2 group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-xl transition-transform active:scale-[0.98]"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-sky-900/40 group-hover:scale-105 transition-transform duration-700">
            <div class="w-full h-full flex items-center justify-center text-4xl opacity-20">🌍</div>
          </div>
          <div class="absolute bottom-0 left-0 p-6 z-20 text-white">
            <span class="bg-red-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 inline-block">热点</span>
            <h2 class="text-2xl font-bold mb-2">{{ featuredNews.title }}</h2>
            <p class="text-sm opacity-80 line-clamp-2">{{ featuredNews.summary }}</p>
          </div>
        </div>

        <!-- 普通新闻卡片 -->
        <div
          v-for="item in filteredNews"
          :key="item.id"
          @click="openNews(item)"
          class="bg-white/40 dark:bg-white/5 border border-zinc-500/10 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] flex flex-col gap-3"
        >
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm">
              {{ item.source[0] }}
            </div>
            <div class="text-xs font-semibold opacity-60">{{ item.source }} · {{ item.time }}</div>
          </div>
          <h3 class="font-bold leading-snug group-hover:text-sky-500">{{ item.title }}</h3>
          <p class="text-xs opacity-70 line-clamp-3 leading-relaxed">{{ item.summary }}</p>
          <div class="mt-auto pt-2 flex items-center justify-between text-[10px] opacity-40">
            <span>{{ item.readTime }} 分钟阅读</span>
            <span>#{{ item.category }}</span>
          </div>
        </div>
      </div>

      <!-- 阅读详情页 -->
      <transition name="slide-up">
        <div v-if="selectedNews" class="absolute inset-0 bg-white dark:bg-zinc-950 z-50 overflow-y-auto">
          <div class="max-w-2xl mx-auto px-6 py-12">
            <button
              @click="selectedNews = null"
              class="mb-8 flex items-center gap-2 text-sky-500 font-medium hover:underline"
            >
              ← 返回新闻列表
            </button>
            <div class="flex items-center gap-2 mb-4 text-sm opacity-60 font-medium">
              <span>{{ selectedNews.source }}</span>
              <span>·</span>
              <span>{{ selectedNews.time }}</span>
            </div>
            <h1 class="text-3xl font-black mb-6 leading-tight">{{ selectedNews.title }}</h1>
            <div class="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl mb-8 flex items-center justify-center text-6xl italic opacity-20">
              News Image
            </div>
            <div class="space-y-4 text-lg leading-relaxed opacity-90">
              <p v-for="(p, i) in selectedNews.content" :key="i">{{ p }}</p>
            </div>
            <div class="mt-12 pt-8 border-t border-zinc-500/10 flex justify-between items-center opacity-60">
              <div class="flex gap-4">
                <button class="hover:text-sky-500">👍 赞</button>
                <button class="hover:text-sky-500">💬 评论</button>
              </div>
              <button class="hover:text-sky-500">🔗 分享</button>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeCategory = ref('推荐')
const selectedNews = ref<any>(null)

const categories = ['推荐', '科技', '财经', '娱乐', '体育', '国际']

const featuredNews = {
  id: 0,
  title: 'FlyOS 2.0 预览版正式发布：重塑跨端协同体验',
  summary: '全新的分布式架构让应用在不同设备间无缝流转，UI/UX 迎来重大更新，不仅更美，而且更快。',
  source: 'FlyOS 官方',
  time: '1小时前',
  category: '科技',
  readTime: 5,
  content: [
    '今天，FlyOS 团队向开发者推送了 2.0 版本的首个预览。这一代系统最核心的改变在于底层的分布式引擎。',
    '用户现在可以将正在平板上编辑的文档，通过简单的手势滑向桌面端，实现毫秒级的状态同步。',
    '在视觉上，2.0 引入了全新的“光影材质”，能够根据窗口背后的内容自动调节色温与对比度，让操作界面更具沉浸感。'
  ]
}

const newsList = [
  {
    id: 1,
    title: '量子计算取得重大突破，加密技术面临新挑战',
    summary: '研究机构宣布在量子纠错方面取得进展，这意味着商用量子计算机离我们更近了一步，现有加密协议可能需要升级。',
    source: '科技日报',
    time: '3小时前',
    category: '科技',
    readTime: 4,
    content: ['量子计算的算力正呈指数级增长...', '专家建议企业开始评估后量子加密方案。']
  },
  {
    id: 2,
    title: '全球股市收涨，投资者对经济增长持乐观态度',
    summary: '纳斯达克指数创下历史新高，科技股领涨市场。分析师认为通胀压力正在缓解。',
    source: '财经周刊',
    time: '5小时前',
    category: '财经',
    readTime: 3,
    content: ['市场普遍预计央行将维持利率不变...', '半导体板块表现尤为出色。']
  },
  {
    id: 3,
    title: '2024 夏季运动会开幕式：光影与文化的盛宴',
    summary: '令人惊叹的无人机表演与现代舞结合，展现了主办城市的历史底蕴与未来视野。',
    source: '体育新闻',
    time: '12小时前',
    category: '体育',
    readTime: 6,
    content: ['开幕式在市中心体育场举行...', '超过 200 个国家和地区的运动员参加了入场仪式。']
  },
  {
    id: 4,
    title: '新型固态电池研发成功，续航能力提升 50%',
    summary: '该电池不仅充电速度更快，且在极端温度下表现更稳定，有望解决电动车续航焦虑。',
    source: '汽车前沿',
    time: '1天前',
    category: '科技',
    readTime: 4,
    content: ['实验室数据表明，该电池循环寿命可达 2000 次以上。']
  }
]

const filteredNews = computed(() => {
  if (activeCategory.value === '推荐') return newsList
  return newsList.filter(item => item.category === activeCategory.value)
})

const openNews = (item: any) => {
  selectedNews.value = item
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}

/* 动画效果 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(100%);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
