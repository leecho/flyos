<template>
  <div class="calculator-app" @keydown="handleKeyboard">
    <!-- 顶部状态栏装饰 -->
    <div class="header-decoration">
      <span class="mode-label">标准</span>
      <i class="fa-solid fa-history history-icon"></i>
    </div>

    <!-- 显示区域 -->
    <div class="display-section">
      <div class="equation-hint">{{ equation }}</div>
      <div class="main-display" :class="{ 'text-smaller': display.length > 10 }">
        {{ formatNumber(display) }}
      </div>
    </div>

    <!-- 快捷内存/功能键 (装饰性) -->
    <div class="memory-bar">
      <span>MC</span><span>MR</span><span>M+</span><span>M-</span><span>MS</span><span>M⌄</span>
    </div>

    <!-- 按键网格 -->
    <div class="keypad">
      <button class="key func-key" @click="handleOperator('%')">%</button>
      <button class="key func-key" @click="clearDisplay">CE</button>
      <button class="key func-key" @click="clearAll">C</button>
      <button class="key func-key" @click="backspace">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
      </button>

      <button class="key func-key" @click="handleSpecial('1/x')">¹/x</button>
      <button class="key func-key" @click="handleSpecial('x²')">x²</button>
      <button class="key func-key" @click="handleSpecial('√x')">²√x</button>
      <button class="key op-key" @click="handleOperator('÷')">÷</button>

      <button class="key num-key" @click="appendDigit('7')">7</button>
      <button class="key num-key" @click="appendDigit('8')">8</button>
      <button class="key num-key" @click="appendDigit('9')">9</button>
      <button class="key op-key" @click="handleOperator('×')">×</button>

      <button class="key num-key" @click="appendDigit('4')">4</button>
      <button class="key num-key" @click="appendDigit('5')">5</button>
      <button class="key num-key" @click="appendDigit('6')">6</button>
      <button class="key op-key" @click="handleOperator('-')">−</button>

      <button class="key num-key" @click="appendDigit('1')">1</button>
      <button class="key num-key" @click="appendDigit('2')">2</button>
      <button class="key num-key" @click="appendDigit('3')">3</button>
      <button class="key op-key" @click="handleOperator('+')">+</button>

      <button class="key num-key" @click="toggleSign">±</button>
      <button class="key num-key" @click="appendDigit('0')">0</button>
      <button class="key num-key" @click="appendDot">.</button>
      <button class="key accent-key" @click="calculateResult">=</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 状态
const display = ref('0')
const equation = ref('')
const firstOperand = ref<number | null>(null)
const operator = ref<string | null>(null)
const waitingForSecondOperand = ref(false)

// 格式化数字显示 (Win11 风格千分位)
const formatNumber = (val: string) => {
  if (val === '错误') return val
  const parts = val.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

// 输入数字
const appendDigit = (digit: string) => {
  if (waitingForSecondOperand.value) {
    display.value = digit
    waitingForSecondOperand.value = false
  } else {
    display.value = display.value === '0' ? digit : display.value + digit
  }
}

// 小数点
const appendDot = () => {
  if (waitingForSecondOperand.value) {
    display.value = '0.'
    waitingForSecondOperand.value = false
    return
  }
  if (!display.value.includes('.')) {
    display.value += '.'
  }
}

// 基础运算符
const handleOperator = (nextOperator: string) => {
  const inputValue = parseFloat(display.value)

  if (operator.value && waitingForSecondOperand.value) {
    operator.value = nextOperator
    equation.value = `${firstOperand.value} ${nextOperator}`
    return
  }

  if (firstOperand.value === null) {
    firstOperand.value = inputValue
  } else if (operator.value) {
    const result = performCalculation(firstOperand.value, inputValue, operator.value)
    display.value = String(result)
    firstOperand.value = result
  }

  waitingForSecondOperand.value = true
  operator.value = nextOperator
  equation.value = `${firstOperand.value} ${nextOperator}`
}

// 执行计算
const performCalculation = (first: number, second: number, op: string) => {
  switch (op) {
    case '+': return first + second
    case '-': return first - second
    case '×': return first * second
    case '÷': return second === 0 ? 0 : first / second
    default: return second
  }
}

// 等于
const calculateResult = () => {
  if (!operator.value || firstOperand.value === null) return
  const secondOperand = parseFloat(display.value)
  const result = performCalculation(firstOperand.value, secondOperand, operator.value)

  equation.value = `${firstOperand.value} ${operator.value} ${secondOperand} =`
  display.value = String(result)
  firstOperand.value = null
  operator.value = null
  waitingForSecondOperand.value = true
}

// 清除功能
const clearAll = () => {
  display.value = '0'
  equation.value = ''
  firstOperand.value = null
  operator.value = null
  waitingForSecondOperand.value = false
}

const clearDisplay = () => {
  display.value = '0'
}

const backspace = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
  } else {
    display.value = '0'
  }
}

const toggleSign = () => {
  display.value = String(parseFloat(display.value) * -1)
}

// 特殊运算
const handleSpecial = (type: string) => {
  const val = parseFloat(display.value)
  let res = 0
  switch (type) {
    case '1/x': res = 1 / val; break
    case 'x²': res = val * val; break
    case '√x': res = Math.sqrt(val); break
  }
  display.value = String(res)
  waitingForSecondOperand.value = true
}

// 键盘监听
const handleKeyboard = (e: KeyboardEvent) => {
  if (/[0-9]/.test(e.key)) appendDigit(e.key)
  if (e.key === '.') appendDot()
  if (e.key === '+') handleOperator('+')
  if (e.key === '-') handleOperator('-')
  if (e.key === '*') handleOperator('×')
  if (e.key === '/') handleOperator('÷')
  if (e.key === 'Enter' || e.key === '=') calculateResult()
  if (e.key === 'Backspace') backspace()
  if (e.key === 'Escape') clearAll()
}

onMounted(() => window.addEventListener('keydown', handleKeyboard))
onUnmounted(() => window.removeEventListener('keydown', handleKeyboard))
</script>

<style scoped>
.calculator-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: transparent;
  user-select: none;
  font-family: "Segoe UI Variable Display", "Segoe UI", sans-serif;
  color: #1a1a1a;
  padding: 8px;
  box-sizing: border-box;
}

.dark .calculator-app {
  color: #ffffff;
}

/* 装饰栏 */
.header-decoration {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  margin-bottom: 4px;
}

.mode-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
}

.history-icon {
  font-size: 12px;
  opacity: 0.6;
  cursor: pointer;
}

/* 显示区 */
.display-section {
  flex: 0 0 100px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 0 12px 16px;
}

.equation-hint {
  font-size: 14px;
  color: #666;
  height: 20px;
  margin-bottom: 4px;
}

.dark .equation-hint {
  color: #aaa;
}

.main-display {
  font-size: 46px;
  font-weight: 600;
  letter-spacing: -0.5px;
  transition: all 0.2s;
}

.main-display.text-smaller {
  font-size: 28px;
}

/* 内存栏装饰 */
.memory-bar {
  display: flex;
  gap: 16px;
  padding: 0 8px;
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 600;
}

.memory-bar span {
  cursor: default;
  opacity: 0.5;
}

/* 按键布局 */
.keypad {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 2px;
}

.key {
  border: 1px solid transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: all 0.1s ease;
  outline: none;
}

/* 亮色模式按键样式 */
.num-key {
  background: #ffffff;
}

.func-key, .op-key {
  background: #f9f9f9;
}

.num-key:hover { background: #f3f3f3; }
.func-key:hover, .op-key:hover { background: #eeeeee; }

/* 暗色模式按键样式 */
.dark .num-key {
  background: rgba(255, 255, 255, 0.06);
}

.dark .func-key, .dark .op-key {
  background: rgba(255, 255, 255, 0.03);
}

.dark .num-key:hover { background: rgba(255, 255, 255, 0.1); }
.dark .func-key:hover, .dark .op-key:hover { background: rgba(255, 255, 255, 0.08); }

/* 强调色按键 (=) */
.accent-key {
  background: var(--accent-color);
  color: white;
  font-weight: bold;
}

.accent-key:hover {
  opacity: 0.9;
}

.key:active {
  transform: scale(0.96);
  opacity: 0.8;
}

.op-key {
  font-size: 20px;
}
</style>
