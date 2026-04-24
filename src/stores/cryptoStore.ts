import { ref, watch } from 'vue';

export interface CryptoConf {
  symbol: string; // ex: BTCUSDT
  name: string;   // ex: Bitcoin
}

const STORAGE_KEY = 'flyos_crypto_watchlist_v1';

const DEFAULT_WATCHLIST: CryptoConf[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' },
];

export const cryptoWatchlist = ref<CryptoConf[]>([...DEFAULT_WATCHLIST]);

// Load from local storage
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    cryptoWatchlist.value = JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse crypto config:', e);
  }
}

// Persist automatically
watch(cryptoWatchlist, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
}, { deep: true });

// Move element
export function moveCryptoConf(index: number, direction: 'up' | 'down') {
  if (direction === 'up' && index > 0) {
    const temp = cryptoWatchlist.value[index];
    cryptoWatchlist.value[index] = cryptoWatchlist.value[index - 1];
    cryptoWatchlist.value[index - 1] = temp;
  } else if (direction === 'down' && index < cryptoWatchlist.value.length - 1) {
    const temp = cryptoWatchlist.value[index];
    cryptoWatchlist.value[index] = cryptoWatchlist.value[index + 1];
    cryptoWatchlist.value[index + 1] = temp;
  }
}

// Add/Remove element is natively done by modifying `cryptoWatchlist.value` in the apps.
