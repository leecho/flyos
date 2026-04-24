<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Activity } from 'lucide-vue-next';

const loading = ref(false);
const tokens = ref<any[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await fetch(`/api/binance/api/v3/ticker/24hr`);
    const data = await res.json();
    let usdt = data.filter((s:any) => s.symbol.endsWith('USDT') && parseFloat(s.volume) > 100);
    // Sort by quoteVolume (Total Trade Value basically maps to market weight loosely)
    usdt.sort((a:any, b:any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
    tokens.value = usdt.slice(0, 100); // Top 100
  } catch (e) {
  } finally {
    loading.value = false;
  }
});

// A very simple slice-based flex visualization approximation of a squarified treemap.
// We map the tokens into absolute percentages but rendering an exact squarified treemap 
// requires a complex algorithm. Flex-wrap with flex-grow creates a beautiful mosaic.
const maxVol = computed(() => tokens.value.length ? parseFloat(tokens.value[0].quoteVolume) : 1);

function getColor(changeStr: string) {
  const c = parseFloat(changeStr);
  if (c > 10) return 'bg-emerald-600';
  if (c > 5) return 'bg-emerald-500';
  if (c > 0) return 'bg-emerald-500/60';
  if (c === 0) return 'bg-gray-500/50';
  if (c > -5) return 'bg-red-500/60';
  if (c > -10) return 'bg-red-500';
  return 'bg-red-600';
}
</script>

<template>
  <div class="w-full h-full p-4 flex flex-col bg-[var(--fly-bg-primary)]">
    <div class="mb-4">
      <h2 class="text-xl font-black tracking-tight flex items-center gap-2">全景热力图 <span class="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full border border-accent/30 vertical-align-middle">Top 100</span></h2>
      <p class="text-xs opacity-50 font-bold uppercase tracking-widest mt-1">Market Treemap by Volume & 24H Change</p>
    </div>

    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center opacity-30">
       <Activity :size="48" class="animate-spin mb-4" />
       <p class="text-xs font-black uppercase tracking-widest">扫描全市场...</p>
    </div>

    <!-- Container for mosaic -->
    <div v-else class="flex-1 flex flex-wrap content-start overflow-y-auto no-scrollbar gap-1 relative border border-[var(--fly-border-system)] p-1 rounded-[var(--fly-radius-md)] bg-black/10 dark:bg-white/10">
       <div v-for="t in tokens" :key="t.symbol" 
            class="flex flex-col items-center justify-center text-white p-1 rounded overflow-hidden shadow-sm hover:brightness-125 transition-all cursor-crosshair border border-black/10 dark:border-white/10"
            :class="getColor(t.priceChangePercent)"
            :style="{
              flexGrow: parseFloat(t.quoteVolume) / maxVol * 100, // Makes bigger volume blocks take more flex space
              flexShrink: 1,
              flexBasis: `${Math.max(8, (parseFloat(t.quoteVolume) / maxVol) * 20)}%`, // Base size
              minHeight: `${Math.max(40, (parseFloat(t.quoteVolume) / maxVol) * 120)}px`,
            }">
          <span class="font-black mix-blend-overlay opacity-90 shadow-black" :style="{ fontSize: `${Math.max(10, (parseFloat(t.quoteVolume)/maxVol) * 20)}px` }">
            {{ t.symbol.replace('USDT','') }}
          </span>
          <span class="font-mono mix-blend-overlay font-bold opacity-80" :style="{ fontSize: `${Math.max(8, (parseFloat(t.quoteVolume)/maxVol) * 14)}px` }">
            {{ parseFloat(t.priceChangePercent) > 0 ? '+' : '' }}{{ parseFloat(t.priceChangePercent).toFixed(2) }}%
          </span>
       </div>
    </div>
  </div>
</template>
