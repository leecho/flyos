<template>
  <div class="w-full h-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white flex flex-col font-sans">
    <header v-if="!activeGame" class="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <h1 class="text-2xl font-bold">游戏中心</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">选择一款游戏开始吧！</p>
    </header>

    <!-- Game Hub -->
    <div v-if="!activeGame" class="flex-grow p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto">
      <div v-for="game in games" :key="game.id" @click="startGame(game.id)" 
           class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center aspect-square">
        <i :class="game.icon" class="text-5xl text-blue-500 mb-4"></i>
        <h2 class="font-semibold text-lg">{{ game.name }}</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ game.description }}</p>
      </div>
    </div>

    <!-- Active Game View -->
    <div v-else class="w-full h-full flex flex-col">
      <header class="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div class="flex items-center">
           <button @click="goBackToHub" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-3">
              <i class="icofont-arrow-left text-xl"></i>
           </button>
           <div>
              <h2 class="text-lg font-bold">{{ games.find(g => g.id === activeGame).name }}</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ games.find(g => g.id === activeGame).description }}</p>
           </div>
        </div>
        <div v-if="activeGame === 'snake'" class="font-mono text-lg font-semibold">
            得分: <span class="text-green-500">{{ snakeGame.score }}</span>
        </div>
      </header>

      <!-- Tic-Tac-Toe -->
      <div v-if="activeGame === 'tictactoe'" class="flex-grow bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-col p-4">
        <div class="mb-4 text-center">
            <p class="text-xl font-semibold" v-if="!ticTacToe.winner && !ticTacToe.isDraw">当前玩家: <span :class="ticTacToe.currentPlayer === 'X' ? 'text-blue-500' : 'text-red-500'">{{ ticTacToe.currentPlayer }}</span></p>
            <p class="text-2xl font-bold text-green-500" v-if="ticTacToe.winner">玩家 {{ ticTacToe.winner }} 获胜!</p>
            <p class="text-2xl font-bold text-yellow-500" v-if="ticTacToe.isDraw">平局!</p>
        </div>
        <div class="grid grid-cols-3 gap-2 bg-gray-900 p-2 rounded-lg shadow-lg">
          <div v-for="(cell, index) in ticTacToe.board" :key="index" 
               @click="handleCellClick(index)"
               class="w-24 h-24 md:w-32 md:h-32 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-5xl font-bold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
               :class="{'text-blue-500': cell === 'X', 'text-red-500': cell === 'O'}">
            {{ cell }}
          </div>
        </div>
        <button @click="resetTicTacToe" class="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">重新开始</button>
      </div>
      
      <!-- Snake -->
      <div v-if="activeGame === 'snake'" class="flex-grow bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div :style="gridStyle" class="grid bg-black/50 border border-gray-700">
           <div v-for="i in (snakeGame.boardSize * snakeGame.boardSize)" :key="i"
                class="w-full h-full border-r border-b border-gray-800/50">
                <div v-if="isSnake(i)" class="bg-green-500 w-full h-full rounded-sm"></div>
                <div v-if="isFood(i)" class="bg-red-500 w-full h-full rounded-full"></div>
           </div>
        </div>
        <div v-if="snakeGame.isGameOver" class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center">
            <h3 class="text-4xl font-bold text-red-500">游戏结束</h3>
            <p class="text-xl mt-2">你的分数是: {{ snakeGame.score }}</p>
            <button @click="startSnakeGame" class="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">再玩一次</button>
        </div>
        <div v-if="!snakeGame.gameStarted" class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center">
            <h3 class="text-3xl font-bold">贪吃蛇</h3>
            <p class="mt-2">使用键盘方向键控制</p>
            <button @click="startSnakeGame" class="mt-6 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">开始游戏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';

const activeGame = ref<string | null>(null);
const games = ref([
  { id: 'tictactoe', name: '井字棋', description: '经典策略对战', icon: 'icofont-game' },
  { id: 'snake', name: '贪吃蛇', description: '控制小蛇吃食物', icon: 'icofont-snake' },
  // More games can be added here
]);

// --- Game Hub Logic ---
const startGame = (gameId: string) => {
  activeGame.value = gameId;
  if (gameId === 'snake') {
      setupSnakeListeners();
  }
};

const goBackToHub = () => {
  if (activeGame.value === 'snake') {
      cleanupSnakeGame();
  }
  activeGame.value = null;
};

// --- Tic-Tac-Toe Logic ---
const ticTacToe = reactive({
    board: Array(9).fill(''),
    currentPlayer: 'X',
    winner: null as string | null,
    isDraw: false,
});

const handleCellClick = (index: number) => {
    if (ticTacToe.board[index] || ticTacToe.winner) return;
    ticTacToe.board[index] = ticTacToe.currentPlayer;
    checkWinner();
    if (!ticTacToe.winner) {
        ticTacToe.currentPlayer = ticTacToe.currentPlayer === 'X' ? 'O' : 'X';
    }
};

const checkWinner = () => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (const line of lines) {
        const [a, b, c] = line;
        if (ticTacToe.board[a] && ticTacToe.board[a] === ticTacToe.board[b] && ticTacToe.board[a] === ticTacToe.board[c]) {
            ticTacToe.winner = ticTacToe.board[a];
            return;
        }
    }
    if (!ticTacToe.board.includes('')) {
        ticTacToe.isDraw = true;
    }
};

const resetTicTacToe = () => {
    ticTacToe.board = Array(9).fill('');
    ticTacToe.currentPlayer = 'X';
    ticTacToe.winner = null;
    ticTacToe.isDraw = false;
};

// --- Snake Logic ---
const snakeGame = reactive({
    boardSize: 20,
    snake: [{x: 10, y: 10}],
    food: {x: 15, y: 15},
    direction: {x: 0, y: 0},
    speed: 200, // ms
    isGameOver: false,
    score: 0,
    gameStarted: false,
});

let gameLoop: number | null = null;

const gridStyle = computed(() => ({
    'grid-template-columns': `repeat(${snakeGame.boardSize}, 1fr)`,
    width: 'min(80vh, 80vw)',
    height: 'min(80vh, 80vw)',
}));

const startSnakeGame = () => {
    resetSnakeGame();
    snakeGame.gameStarted = true;
    snakeGame.isGameOver = false;
    gameLoop = setInterval(updateSnake, snakeGame.speed);
}

const resetSnakeGame = () => {
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.food = {x: 15, y: 15};
    snakeGame.direction = {x: 0, y: 0};
    snakeGame.score = 0;
}

const updateSnake = () => {
    if (snakeGame.direction.x === 0 && snakeGame.direction.y === 0) return; // Don't move if not started

    const head = { ...snakeGame.snake[0] };
    head.x += snakeGame.direction.x;
    head.y += snakeGame.direction.y;

    // Wall collision
    if (head.x < 0 || head.x >= snakeGame.boardSize || head.y < 0 || head.y >= snakeGame.boardSize) {
        endGame();
        return;
    }

    // Self collision
    for (const segment of snakeGame.snake) {
        if (segment.x === head.x && segment.y === head.y) {
            endGame();
            return;
        }
    }

    snakeGame.snake.unshift(head);

    // Food collision
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score++;
        placeFood();
    } else {
        snakeGame.snake.pop();
    }
};

const placeFood = () => {
    let newFoodPosition;
    do {
        newFoodPosition = {
            x: Math.floor(Math.random() * snakeGame.boardSize),
            y: Math.floor(Math.random() * snakeGame.boardSize)
        };
    } while (snakeGame.snake.some(seg => seg.x === newFoodPosition.x && seg.y === newFoodPosition.y));
    snakeGame.food = newFoodPosition;
}

const endGame = () => {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = null;
    snakeGame.isGameOver = true;
}

const handleKeydown = (e: KeyboardEvent) => {
    if (!snakeGame.gameStarted || snakeGame.isGameOver) return;
    const { x, y } = snakeGame.direction;
    switch (e.key) {
        case 'ArrowUp': if(y === 0) snakeGame.direction = { x: 0, y: -1 }; break;
        case 'ArrowDown': if(y === 0) snakeGame.direction = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if(x === 0) snakeGame.direction = { x: -1, y: 0 }; break;
        case 'ArrowRight': if(x === 0) snakeGame.direction = { x: 1, y: 0 }; break;
    }
};

const cellIndexToCoords = (index: number) => {
    return {
        x: index % snakeGame.boardSize,
        y: Math.floor(index / snakeGame.boardSize)
    }
}

const isSnake = (index: number) => {
    const { x, y } = cellIndexToCoords(index-1);
    return snakeGame.snake.some(segment => segment.x === x && segment.y === y);
}

const isFood = (index: number) => {
    const { x, y } = cellIndexToCoords(index-1);
    return snakeGame.food.x === x && snakeGame.food.y === y;
}

const setupSnakeListeners = () => {
    window.addEventListener('keydown', handleKeydown);
}

const cleanupSnakeGame = () => {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = null;
    window.removeEventListener('keydown', handleKeydown);
    snakeGame.gameStarted = false;
    snakeGame.isGameOver = false;
};

onBeforeUnmount(() => {
    cleanupSnakeGame();
});

</script>

<style scoped>
/* Add any game-specific styles if needed */
</style>
