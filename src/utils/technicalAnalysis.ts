/**
 * Quantitative Financial Math Engine
 * Calculates various technical analysis indicators with pure array looping (O(N)).
 */

// Simple Moving Average
export function getSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i, arr) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = 0; j < period; j++) sum += arr[i - j];
    return sum / period;
  });
}

// Exponential Moving Average
export function getEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const emaArr: (number | null)[] = [];
  let ema = 0;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      emaArr.push(null);
      let sum = 0;
      if (i === period - 2) {
        for (let j = 0; j <= i; j++) sum += data[j];
        ema = sum / (i + 1);
      }
    } else if (i === period - 1) {
      let sum = 0;
      for (let j = 0; j <= i; j++) sum += data[j];
      ema = sum / period;
      emaArr.push(ema);
    } else {
      ema = (data[i] - ema) * k + ema;
      emaArr.push(ema);
    }
  }
  return emaArr;
}

// Standard Deviation
export function getStdDev(data: number[], period: number, sma: (number | null)[]): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1 || sma[i] === null) return null;
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += Math.pow(data[i - j] - sma[i]!, 2);
    }
    return Math.sqrt(sum / period);
  });
}

// Bollinger Bands
// Returns middle (SMA), upper (+2 stddev), and lower (-2 stddev)
export function calculateBB(closes: number[], period = 20, stdDevs = 2) {
  const middle = getSMA(closes, period);
  const std = getStdDev(closes, period, middle);
  const upper = middle.map((m, i) => (m && std[i] ? m + stdDevs * std[i]! : null));
  const lower = middle.map((m, i) => (m && std[i] ? m - stdDevs * std[i]! : null));
  return { middle, upper, lower };
}

// MACD (Moving Average Convergence Divergence)
// Typically 12, 26, 9
export function calculateMACD(closes: number[], shortP = 12, longP = 26, sigP = 9) {
  const emaShort = getEMA(closes, shortP);
  const emaLong = getEMA(closes, longP);
  
  const macd = closes.map((_, i) => 
    (emaShort[i] !== null && emaLong[i] !== null) ? emaShort[i]! - emaLong[i]! : null
  );
  
  // To calculate EMA of MACD stream, we need to extract the continuous non-null array
  let signal: (number | null)[] = new Array(closes.length).fill(null);
  
  const firstValid = macd.findIndex(m => m !== null);
  if (firstValid !== -1) {
    const activeMacd = macd.slice(firstValid) as number[];
    const sigStream = getEMA(activeMacd, sigP);
    sigStream.forEach((val, index) => {
      signal[firstValid + index] = val;
    });
  }
  
  const histogram = macd.map((m, i) => (m !== null && signal[i] !== null ? m - signal[i]! : null));
  
  return { macd, signal, histogram };
}

// RSI (Relative Strength Index)
// Wilder's Smoothing method
export function calculateRSI(closes: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < closes.length; i++) {
    if (i === 0) {
      rsi.push(null);
      continue;
    }
    
    const diff = closes[i] - closes[i - 1];
    let gain = Math.max(0, diff);
    let loss = Math.max(0, -diff);
    
    if (i < period) {
      avgGain += gain;
      avgLoss += loss;
      rsi.push(null);
      if (i === period - 1) {
        avgGain /= period;
        avgLoss /= period;
      }
    } else if (i === period) {
      // First RSI calculation just uses the raw averages computed
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + rs)));
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const val = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
      rsi.push(val);
    }
  }
  return rsi;
}
