<script setup lang="ts">
import { ref, onMounted } from 'vue';

const fngData = ref<{ value: number; value_classification: string } | null>(null);

onMounted(async () => {
  try {
    const res = await fetch('https://api.alternative.me/fng/');
    const json = await res.json();
    if (json && json.data && json.data.length > 0) {
      fngData.value = {
        value: parseInt(json.data[0].value),
        value_classification: json.data[0].value_classification
      };
    }
  } catch (e) {
    console.error('Failed to fetch FNG', e);
  }
});

function getFngColor(val: number) {
  if (val <= 25) return 'text-red-500';
  if (val <= 45) return 'text-orange-400';
  if (val <= 55) return 'text-yellow-400';
  if (val <= 75) return 'text-emerald-400';
  return 'text-emerald-500';
}
</script>

<template>
  <div class="bg-[var(--fly-bg-secondary)] px-4 py-4 flex flex-col justify-between">
    <p class="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1 flex justify-between">
      <span>恐慌与贪婪指数</span>
      <span class="opacity-50">24H</span>
    </p>
    
    <div v-if="fngData" class="flex items-end gap-3 mt-1">
      <p class="text-3xl font-black font-mono tabular-nums leading-none tracking-tighter" :class="getFngColor(fngData.value)">
        {{ fngData.value }}
      </p>
      <div class="flex flex-col pb-0.5">
        <span class="text-[11px] font-bold uppercase tracking-widest" :class="getFngColor(fngData.value)">
          {{ fngData.value_classification }}
        </span>
        <div class="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
          <div class="h-full bg-current rounded-full transition-all" :class="getFngColor(fngData.value)" :style="{ width: `${fngData.value}%` }"></div>
        </div>
      </div>
    </div>
    <div v-else class="text-xs opacity-30 mt-2 font-mono animate-pulse">Loading...</div>
  </div>
</template>
