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

// ─── Price Alerts ────────────────────────────────────────────────────────────
export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  threshold: number;
}

const ALERTS_KEY = 'flyos_crypto_alerts_v1';
export const cryptoAlerts = ref<PriceAlert[]>([]);

const savedAlerts = localStorage.getItem(ALERTS_KEY);
if (savedAlerts) {
  try { cryptoAlerts.value = JSON.parse(savedAlerts); } catch (e) {}
}

watch(cryptoAlerts, (val) => {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(val));
  updateAlertsDaemon();
}, { deep: true });

export function addAlert(symbol: string, condition: 'above'|'below', threshold: number) {
  cryptoAlerts.value.push({ id: Math.random().toString(36).substring(2), symbol, condition, threshold });
}

export function removeAlert(id: string) {
  cryptoAlerts.value = cryptoAlerts.value.filter(a => a.id !== id);
}

// ─── Daemon for Background Alerts ─────────────────────────────────────────────
let alertWs: WebSocket | null = null;
let notifierPush: any = null;
let lastTriggered: Record<string, number> = {}; // { alertId: timestamp }

export function initCryptoAlertsDaemon(pushFn: any) {
  notifierPush = pushFn;
  updateAlertsDaemon();
}

function updateAlertsDaemon() {
  if (alertWs) { alertWs.close(); alertWs = null; }
  if (cryptoAlerts.value.length === 0) return;

  const symbols = [...new Set(cryptoAlerts.value.map(a => a.symbol.toLowerCase()))];
  alertWs = new WebSocket('wss://stream.binance.com:9443/ws');
  
  alertWs.onopen = () => {
    alertWs!.send(JSON.stringify({
      method: "SUBSCRIBE",
      params: symbols.map(s => `${s}@ticker`),
      id: 999
    }));
  };
  
  alertWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.e === '24hrTicker') {
        const sym = data.s;
        const price = parseFloat(data.c);
        
        cryptoAlerts.value.filter(a => a.symbol === sym).forEach(alert => {
          const triggered = (alert.condition === 'above' && price >= alert.threshold) || 
                            (alert.condition === 'below' && price <= alert.threshold);
          
          if (triggered) {
            const now = Date.now();
            // Debounce matching alerts (1 minute)
            if (!lastTriggered[alert.id] || now - lastTriggered[alert.id] > 60000) {
              lastTriggered[alert.id] = now;
              if (notifierPush) {
                notifierPush({
                  appName: '加密货币',
                  title: '价格预警触发',
                  content: `${alert.symbol} 价格已${alert.condition === 'above' ? '突破' : '跌破'} ${alert.threshold}，当前价格: ${price}`,
                  type: 'warning',
                  duration: 8000
                });
              }
            }
          }
        });
      }
    } catch {}
  };
  
  alertWs.onclose = () => {
    if (cryptoAlerts.value.length > 0) {
      setTimeout(updateAlertsDaemon, 5000);
    }
  };
}
