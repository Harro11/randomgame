// Game loading functionality
function loadGame(gameType) {
    const modal = document.getElementById('game-modal');
    const gameTitle = document.getElementById('game-title');
    const gameContainer = document.getElementById('game-container');
    
    // Set the title based on the game type
    gameTitle.textContent = gameType.charAt(0).toUpperCase() + gameType.slice(1);
    
    // Clear previous game
    gameContainer.innerHTML = '';
    
    // Load the appropriate game
    switch(gameType) {
        case 'snake':
            loadSnakeGame(gameContainer);
            break;
        case 'tetris':
            loadTetrisGame(gameContainer);
            break;
        case '2048':
            load2048Game(gameContainer);
            break;
        case 'pong':
            loadPongGame(gameContainer);
            break;
        case 'breakout':
            loadBreakoutGame(gameContainer);
            break;
        case 'memory':
            loadMemoryGame(gameContainer);
            break;
        case 'sudoku':
            loadSudokuGame(gameContainer);
            break;
        case 'chess':
            loadChessGame(gameContainer);
            break;
        case 'minesweeper':
            loadMinesweeperGame(gameContainer);
            break;
        default:
            gameContainer.innerHTML = '<p>Game coming soon!</p>';
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Close the game modal
function closeGame() {
    const modal = document.getElementById('game-modal');
    modal.style.display = 'none';
}

// Close modal if clicking outside the content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('game-modal');
    if (event.target === modal) {
        closeGame();
    }
});

// Snake Game
function loadSnakeGame(container) {
    container.innerHTML = `
        <canvas id="snake-canvas" width="400" height="400" style="background-color: #222;"></canvas>
        <div style="text-align: center; margin-top: 10px;">
            <span id="score">Score: 0</span>
            <button id="start-button" style="margin-left: 20px;">Start Game</button>
        </div>
        <div style="text-align: center; margin-top: 10px;">
            <p>Use arrow keys to control the snake. Collect the food to grow.</p>
        </div>
    `;
    
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-button');
    const scoreDisplay = document.getElementById('score');
    
    let snake = [{x: 10, y: 10}]; // Snake starting position
    let food = {x: 5, y: 5}; // Food starting position
    let direction = 'right';
    let gameInterval;
    let score = 0;
    let gameRunning = false;
    
    function drawSnake() {
        snake.forEach(segment => {
            ctx.fillStyle = '#39ff14';
            ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
        });
    }
    
    function drawFood() {
        ctx.fillStyle = '#ff3838';
        ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
    }
    
    function moveSnake() {
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch(direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check for collision with walls
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            gameOver();
            return;
        }
        
        // Check for collision with self
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                return;
            }
        }
        
        snake.unshift(head);
        
        // Check if food eaten
        if (head.x === food.x && head.y === food.y) {
            generateFood();
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
        } else {
            snake.pop();
        }
    }
    
    function generateFood() {
        food.x = Math.floor(Math.random() * 20);
        food.y = Math.floor(Math.random() * 20);
        
        // Make sure food doesn't spawn on the snake
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === food.x && snake[i].y === food.y) {
                generateFood();
                break;
            }
        }
    }
    
    function gameOver() {
        clearInterval(gameInterval);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 40);
        
        gameRunning = false;
        startButton.textContent = 'Restart Game';
    }
    
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFood();
        moveSnake();
        drawSnake();
    }
    
    function startGame() {
        if (gameRunning) return;
        
        // Reset game state
        snake = [{x: 10, y: 10}];
        direction = 'right';
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        generateFood();
        
        gameRunning = true;
        startButton.textContent = 'Game Running';
        gameInterval = setInterval(gameLoop, 100);
    }
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    
    document.addEventListener('keydown', function(event) {
        if (!gameRunning) return;
        
        switch(event.key) {
            case 'ArrowUp':
                if (direction !== 'down') direction = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') direction = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') direction = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') direction = 'right';
                break;
        }
    });
}

// Tetris Game
function loadTetrisGame(container) {
    container.innerHTML = `
        <canvas id="tetris-canvas" width="300" height="600" style="background-color: #111;"></canvas>
        <div style="display: inline-block; vertical-align: top; margin-left: 20px;">
            <div style="padding: 10px; background-color: #222; border-radius: 5px; margin-bottom: 20px;">
                <h3>Score: <span id="tetris-score">0</span></h3>
                <h3>Level: <span id="tetris-level">1</span></h3>
                <h3>Lines: <span id="tetris-lines">0</span></h3>
            </div>
            <button id="tetris-start" style="width: 100%; padding: 10px; margin-top: 10px;">Start Game</button>
            <div style="margin-top: 20px;">
                <p>Controls:</p>
                <p>← → : Move left/right</p>
                <p>↑ : Rotate</p>
                <p>↓ : Soft drop</p>
                <p>Space : Hard drop</p>
            </div>
        </div>
    `;
    
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('tetris-start');
    const scoreDisplay = document.getElementById('tetris-score');
    const levelDisplay = document.getElementById('tetris-level');
    const linesDisplay = document.getElementById('tetris-lines');
    
    // Tetris game implementation would go here
    // This is a placeholder for a full tetris implementation
    
    startButton.addEventListener('click', function() {
        startButton.textContent = 'Game Running';
        // Placeholder text instead of full implementation
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Tetris game would run here', canvas.width/2, canvas.height/2);
        ctx.fillText('with full block movement,', canvas.width/2, canvas.height/2 + 30);
        ctx.fillText('rotation, and line clearing.', canvas.width/2, canvas.height/2 + 60);
    });
}

// 2048 Game
function load2048Game(container) {
    container.innerHTML = `
        <div id="game-2048" style="width: 400px; height: 400px; margin: 0 auto; position: relative;">
            <div id="grid-container" style="width: 400px; height: 400px; background: #bbada0; border-radius: 6px; padding: 15px; position: relative; margin: 0 auto; box-sizing: border-box;"></div>
            <div style="text-align: center; margin-top: 10px;">
                <span id="score-2048" style="font-size: 18px; font-weight: bold;">Score: 0</span>
                <button id="restart-2048" style="margin-left: 20px; padding: 5px 15px;">New Game</button>
            </div>
        </div>
    `;
    
    const grid = document.getElementById('grid-container');
    const scoreDisplay = document.getElementById('score-2048');
    const restartButton = document.getElementById('restart-2048');
    
    // Create grid cells
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.style = `width: 80px; height: 80px; background: rgba(238, 228, 218, 0.35); 
                      border-radius: 3px; position: absolute; 
                      top: ${15 + Math.floor(i/4) * 97}px; 
                      left: ${15 + (i%4) * 97}px;`;
        grid.appendChild(cell);
    }
    
    // Setup event listener for the restart button
    restartButton.addEventListener('click', function() {
        // This would initialize a new 2048 game
        // Placeholder for full implementation
        alert("New 2048 game would start here!");
    });
    
    // Add some sample tiles for visualization
    const tile1 = document.createElement('div');
    tile1.textContent = '2';
    tile1.style = `width: 80px; height: 80px; line-height: 80px; background: #eee4da; 
                  border-radius: 3px; position: absolute; text-align: center; 
                  font-size: 45px; font-weight: bold; color: #776e65;
                  top: ${15 + 0 * 97}px; left: ${15 + 0 * 97}px;`;
    grid.appendChild(tile1);
    
    const tile2 = document.createElement('div');
    tile2.textContent = '4';
    tile2.style = `width: 80px; height: 80px; line-height: 80px; background: #ede0c8; 
                  border-radius: 3px; position: absolute; text-align: center; 
                  font-size: 45px; font-weight: bold; color: #776e65;
                  top: ${15 + 1 * 97}px; left: ${15 + 0 * 97}px;`;
    grid.appendChild(tile2);
    
    const tile3 = document.createElement('div');
    tile3.textContent = '8';
    tile3.style = `width: 80px; height: 80px; line-height: 80px; background: #f2b179; 
                  border-radius: 3px; position: absolute; text-align: center; 
                  font-size: 45px; font-weight: bold; color: #f9f6f2;
                  top: ${15 + 0 * 97}px; left: ${15 + 1 * 97}px;`;
    grid.appendChild(tile3);
}

// Placeholder functions for other games
function loadPongGame(container) {
    container.innerHTML = `
        <canvas id="pong-canvas" width="600" height="400" style="background-color: #222;"></canvas>
        <div style="text-align: center; margin-top: 10px;">
            <button id="pong-start">Start Game</button>
        </div>
        <div style="text-align: center; margin-top: 10px;">
            <p>Use W/S or Up/Down arrows to control the paddle.</p>
        </div>
    `;
    
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pong Game', canvas.width/2, 50);
    
    // Draw paddles
    ctx.fillRect(20, 150, 10, 100);  // Left paddle
    ctx.fillRect(570, 150, 10, 100);  // Right paddle
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(300, 200, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    
    // Draw center line
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.closePath();
}

function loadBreakoutGame(container) {
    container.innerHTML = `
        <canvas id="breakout-canvas" width="480" height="320" style="background-color: #111;"></canvas>
        <div style="text-align: center; margin-top: 10px;">
            <span id="breakout-lives">Lives: 3</span>
            <span id="breakout-score" style="margin-left: 20px;">Score: 0</span>
            <button id="breakout-start" style="margin-left: 20px;">Start Game</button>
        </div>
        <div style="text-align: center; margin-top: 10px;">
            <p>Use Left/Right arrows to move the paddle.</p>
        </div>
    `;
    
    const canvas = document.getElementById('breakout-canvas');
    const ctx = canvas.getContext('2d');
    
    // Draw bricks
    for (let c = 0; c < 8; c++) {
        for (let r = 0; r < 5; r++) {
            ctx.fillStyle = `hsl(${c*45 + r*15}, 100%, 50%)`;
            ctx.fillRect(c * 60 + 5, r * 20 + 30, 55, 15);
        }
    }
    
    // Draw paddle
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(200, 310, 80, 10);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(240, 290, 8, 0, Math.PI*2);
    ctx.fillStyle = '#0
