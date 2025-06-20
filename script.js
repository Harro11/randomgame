// Game loading functionality
function loadGame(gameType) {
    const modal = document.getElementById('game-modal');
    const gameTitle = document.getElementById('game-title');
    const gameContainer = document.getElementById('game-container');
    
    // Set the title based on the game type
    const capitalizedTitle = gameType.charAt(0).toUpperCase() + gameType.slice(1);
    gameTitle.textContent = capitalizedTitle === 'Fps' ? 'FPS Arena' : 
                           (capitalizedTitle === 'Spaceinvaders' ? 'Space Invaders' : capitalizedTitle);
    
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
        case 'flappy':
            loadFlappyBirdGame(gameContainer);
            break;
        case 'zombie':
            loadZombieShooterGame(gameContainer);
            break;
        case 'platformer':
            loadPlatformerGame(gameContainer);
            break;
        case 'ninja':
            loadNinjaRunGame(gameContainer);
            break;
        case 'pacman':
            loadPacmanGame(gameContainer);
            break;
        case 'puzzle':
            loadSlidingPuzzleGame(gameContainer);
            break;
        case 'tower':
            loadTowerDefenseGame(gameContainer);
            break;
        case 'tictactoe':
            loadTicTacToeGame(gameContainer);
            break;
        case 'spaceinvaders':
            loadSpaceInvadersGame(gameContainer);
            break;
        case 'fps':
            loadFpsGame(gameContainer);
            break;
        case 'asteroids':
            loadAsteroidsGame(gameContainer);
            break;
        case 'racing':
            loadRacingGame(gameContainer);
            break;
        case 'frogger':
            loadFroggerGame(gameContainer);
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
    
    // Stop any running game loops
    if (window.gameLoop) {
        cancelAnimationFrame(window.gameLoop);
        window.gameLoop = null;
    }
    
    // Remove event listeners
    if (window.gameEventListeners) {
        window.gameEventListeners.forEach(listener => {
            document.removeEventListener(listener.type, listener.func);
        });
        window.gameEventListeners = [];
    }
}

// Close modal if clicking outside the content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('game-modal');
    if (event.target === modal) {
        closeGame();
    }
});

// Helper function to create a canvas with context
function createGameCanvas(container, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.backgroundColor = '#222';
    
    container.appendChild(canvas);
    return {
        canvas: canvas,
        ctx: canvas.getContext('2d')
    };
}

// Helper function to add event listeners with tracking
function addGameEventListener(type, func) {
    document.addEventListener(type, func);
    if (!window.gameEventListeners) {
        window.gameEventListeners = [];
    }
    window.gameEventListeners.push({type, func});
}

// Helper function for blood effect
function createBloodSplatter(container, x, y, amount = 10) {
    for (let i = 0; i < amount; i++) {
        const blood = document.createElement('div');
        blood.className = 'blood-effect';
        
        const size = 5 + Math.random() * 20;
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 100;
        
        blood.style.width = `${size}px`;
        blood.style.height = `${size}px`;
        blood.style.left = `${x - size/2}px`;
        blood.style.top = `${y - size/2}px`;
        
        container.appendChild(blood);
        
        // Animate blood splatter
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;
        
        const animation = blood.animate([
            { transform: 'scale(1)', opacity: 0.8 },
            { transform: 'scale(0.5)', opacity: 0, left: `${targetX - size/2}px`, top: `${targetY - size/2}px` }
        ], {
            duration: 500 + Math.random() * 1000,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
        });
        
        animation.onfinish = () => blood.remove();
    }
}

// Snake Game - Enhanced with obstacles and special food
function loadSnakeGame(container) {
    container.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 600px; margin: 0 auto;">
            <canvas id="snake-canvas" width="600" height="600" style="background-color: #222;"></canvas>
            <div id="snake-hud" class="game-hud">
                <span id="snake-score">Score: 0</span>
                <span id="snake-level" style="margin-left: 20px;">Level: 1</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 10px;">
            <button id="snake-start-button">Start Game</button>
        </div>
    `;
    
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('snake-start-button');
    const scoreDisplay = document.getElementById('snake-score');
    const levelDisplay = document.getElementById('snake-level');
    
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    let snake = [{x: 10, y: 10}]; // Snake starting position
    let food = {x: 15, y: 15, type: 'normal'}; // Food starting position
    let specialFood = null;
    let obstacles = [];
    let direction = 'right';
    let nextDirection = 'right';
    let gameInterval;
    let score = 0;
    let level = 1;
    let gameRunning = false;
    let speed = 100;
    
    // Snake game colors
    const colors = {
        snake: '#39ff14',
        food: '#ff3838',
        specialFood: '#ff38d5',
        obstacle: '#3877ff',
        background: '#222'
    };
    
    // Generate initial obstacles
    function generateInitialObstacles() {
        obstacles = [];
        const numObstacles = level * 2;
        
        for (let i = 0; i < numObstacles; i++) {
            generateObstacle();
        }
    }
    
    // Generate a new obstacle
    function generateObstacle() {
        let x, y;
        let validPosition = false;
        
        while (!validPosition) {
            x = Math.floor(Math.random() * gridWidth);
            y = Math.floor(Math.random() * gridHeight);
            validPosition = true;
            
            // Check if position overlaps with snake
            for (let segment of snake) {
                if (segment.x === x && segment.y === y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check if position overlaps with food
            if (food && food.x === x && food.y === y) {
                validPosition = false;
            }
            
            // Check if position overlaps with specialFood
            if (specialFood && specialFood.x === x && specialFood.y === y) {
                validPosition = false;
            }
            
            // Check if position overlaps with existing obstacles
            for (let obstacle of obstacles) {
                if (obstacle.x === x && obstacle.y === y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Add a buffer zone around the snake head
            if (Math.abs(x - snake[0].x) < 3 && Math.abs(y - snake[0].y) < 3) {
                validPosition = false;
            }
        }
        
        obstacles.push({x, y});
    }
    
    function drawSnake() {
        snake.forEach((segment, index) => {
            // Gradient color from head to tail
            const green = Math.floor(57 + (200 - 57) * (index / snake.length));
            ctx.fillStyle = index === 0 ? '#39ff14' : `rgb(0, ${green}, 0)`;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
            
            // Draw eyes on the head
            if (index === 0) {
                ctx.fillStyle = '#000';
                let eyeX1, eyeX2, eyeY1, eyeY2;
                
                switch(direction) {
                    case 'up':
                        eyeX1 = segment.x * gridSize + 5;
                        eyeY1 = segment.y * gridSize + 5;
                        eyeX2 = segment.x * gridSize + gridSize - 7;
                        eyeY2 = segment.y * gridSize + 5;
                        break;
                    case 'down':
                        eyeX1 = segment.x * gridSize + 5;
                        eyeY1 = segment.y * gridSize + gridSize - 7;
                        eyeX2 = segment.x * gridSize + gridSize - 7;
                        eyeY2 = segment.y * gridSize + gridSize - 7;
                        break;
                    case 'left':
                        eyeX1 = segment.x * gridSize + 5;
                        eyeY1 = segment.y * gridSize + 5;
                        eyeX2 = segment.x * gridSize + 5;
                        eyeY2 = segment.y * gridSize + gridSize - 7;
                        break;
                    case 'right':
                        eyeX1 = segment.x * gridSize + gridSize - 7;
                        eyeY1 = segment.y * gridSize + 5;
                        eyeX2 = segment.x * gridSize + gridSize - 7;
                        eyeY2 = segment.y * gridSize + gridSize - 7;
                        break;
                }
                
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    function drawFood() {
        if (food) {
            ctx.fillStyle = colors.food;
            ctx.beginPath();
            ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        if (specialFood) {
            ctx.fillStyle = colors.specialFood;
            const pulseFactor = 0.8 + 0.2 * Math.sin(Date.now() / 100);
            ctx.beginPath();
            ctx.arc(
                specialFood.x * gridSize + gridSize/2, 
                specialFood.y * gridSize + gridSize/2, 
                (gridSize/2 - 1) * pulseFactor, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            
            // Add special food time animation
            ctx.strokeStyle = colors.specialFood;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                specialFood.x * gridSize + gridSize/2,
                specialFood.y * gridSize + gridSize/2,
                gridSize/2 + 3,
                0,
                Math.PI * 2 * (specialFood.timeLeft / 100)
            );
            ctx.stroke();
        }
    }
    
    function drawObstacles() {
        ctx.fillStyle = colors.obstacle;
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize - 1, gridSize - 1);
        });
    }
    
    function moveSnake() {
        direction = nextDirection;
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch(direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check for collision with walls (wrap around)
        if (head.x < 0) head.x = gridWidth - 1;
        if (head.x >= gridWidth) head.x = 0;
        if (head.y < 0) head.y = gridHeight - 1;
        if (head.y >= gridHeight) head.y = 0;
        
        // Check for collision with self
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                return;
            }
        }
        
        // Check for collision with obstacles
        for (let obstacle of obstacles) {
            if (obstacle.x === head.x && obstacle.y === head.y) {
                gameOver();
                return;
            }
        }
        
        snake.unshift(head);
        
        // Check if food eaten
        if (food && head.x === food.x && head.y === food.y) {
            food = null;
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            
            // Check for level up
            if (score >= level * 100) {
                levelUp();
            }
            
            setTimeout(generateFood, 500);
        } else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
            // Special food gives more points
            score += specialFood.points;
            scoreDisplay.textContent = `Score: ${score}`;
            specialFood = null;
            
            // Check for level up
            if (score >= level * 100) {
                levelUp();
            }
        } else {
            
