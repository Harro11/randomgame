// Global variables
let gameLoop = null;
let gameEventListeners = [];

// Utility functions
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}

// Game loading functionality
function loadGame(gameType) {
    const modal = document.getElementById('game-modal');
    const gameTitle = document.getElementById('game-title');
    const gameContainer = document.getElementById('game-container');
    
    // Set the title based on the game type
    switch(gameType) {
        case 'snake': gameTitle.textContent = 'NEON SNAKE'; break;
        case 'tetris': gameTitle.textContent = 'CYBER TETRIS'; break;
        case '2048': gameTitle.textContent = 'CYBER 2048'; break;
        case 'pong': gameTitle.textContent = 'LASER PONG'; break;
        case 'breakout': gameTitle.textContent = 'BLOCK BREAKER'; break;
        case 'memory': gameTitle.textContent = 'MEMORY GRID'; break;
        case 'zombie': gameTitle.textContent = 'ZOMBIE SURVIVAL'; break;
        case 'platformer': gameTitle.textContent = 'NEON RUNNER'; break;
        case 'asteroids': gameTitle.textContent = 'SPACE ROCKS'; break;
        case 'flappy': gameTitle.textContent = 'NEON BIRD'; break;
        case 'racing': gameTitle.textContent = 'CYBER RACER'; break;
        case 'puzzle': gameTitle.textContent = 'PUZZLE SHIFT'; break;
        case 'spaceinvaders': gameTitle.textContent = 'ALIEN INVASION'; break;
        case 'fps': gameTitle.textContent = 'FPS ARENA'; break;
        case 'frogger': gameTitle.textContent = 'CYBER FROG'; break;
        default: gameTitle.textContent = gameType.toUpperCase(); 
    }
    
    // Clear previous game
    gameContainer.innerHTML = '';
    
    // Stop any existing game loops
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    // Clear event listeners
    if (gameEventListeners.length > 0) {
        gameEventListeners.forEach(listener => {
            document.removeEventListener(listener.type, listener.func);
        });
        gameEventListeners = [];
    }
    
    // Load the appropriate game
    switch(gameType) {
        case 'snake': loadSnakeGame(gameContainer); break;
        case 'tetris': loadTetrisGame(gameContainer); break;
        case '2048': load2048Game(gameContainer); break;
        case 'pong': loadPongGame(gameContainer); break;
        case 'breakout': loadBreakoutGame(gameContainer); break;
        case 'memory': loadMemoryGame(gameContainer); break;
        case 'zombie': loadZombieShooterGame(gameContainer); break;
        case 'platformer': loadPlatformerGame(gameContainer); break;
        case 'asteroids': loadAsteroidsGame(gameContainer); break;
        case 'flappy': loadFlappyBirdGame(gameContainer); break;
        case 'racing': loadRacingGame(gameContainer); break;
        case 'puzzle': loadSlidingPuzzleGame(gameContainer); break;
        case 'spaceinvaders': loadSpaceInvadersGame(gameContainer); break;
        case 'fps': loadFpsGame(gameContainer); break;
        case 'frogger': loadFroggerGame(gameContainer); break;
        default: 
            gameContainer.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:500px;flex-direction:column;">
                <h3 style="color:#00e5ff;margin-bottom:20px;">COMING SOON</h3>
                <p>This game is currently in development.</p>
            </div>`;
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Close the game modal
function closeGame() {
    const modal = document.getElementById('game-modal');
    modal.style.display = 'none';
    
    // Stop any running game loops
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    // Remove event listeners
    if (gameEventListeners.length > 0) {
        gameEventListeners.forEach(listener => {
            document.removeEventListener(listener.type, listener.func);
        });
        gameEventListeners = [];
    }
}

// Close modal if clicking outside the content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('game-modal');
    if (event.target === modal) {
        closeGame();
    }
});

// Add event listeners with tracking for easy removal
function addGameEventListener(type, func) {
    document.addEventListener(type, func);
    gameEventListeners.push({type, func});
}

// Helper function to create a canvas with context
function createGameCanvas(container, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.backgroundColor = '#0a0a0a';
    canvas.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.2)';
    canvas.style.border = '1px solid rgba(0, 229, 255, 0.2)';
    
    container.appendChild(canvas);
    return {
        canvas: canvas,
        ctx: canvas.getContext('2d')
    };
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

// Neon Snake Game
function loadSnakeGame(container) {
    container.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 600px; margin: 0 auto;">
            <canvas id="snake-canvas" width="600" height="600" style="background-color: #0a0a0a;"></canvas>
            <div id="snake-hud" class="game-hud">
                <span id="snake-score">SCORE: 0</span>
                <span id="snake-level" style="margin-left: 20px;">LEVEL: 1</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button id="snake-start-button" class="game-button">START GAME</button>
        </div>
    `;
    
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('snake-start-button');
    const scoreDisplay = document.getElementById('snake-score');
    const levelDisplay = document.getElementById('snake-level');
    
    const GRID_SIZE = 20;
    const GRID_WIDTH = canvas.width / GRID_SIZE;
    const GRID_HEIGHT = canvas.height / GRID_SIZE;
    
    // Game state
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15, type: 'normal'};
    let specialFood = null;
    let obstacles = [];
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let level = 1;
    let gameRunning = false;
    let speed = 100;
    
    // Neon colors
    const colors = {
        snake: '#00ff00',
        snakeHead: '#39ff14',
        food: '#ff3838',
        specialFood: '#ff38d5',
        obstacle: '#3877ff',
        background: '#0a0a0a',
        grid: '#111111'
    };
    
    // Initialize game
    function initGame() {
        // Reset game state
        snake = [{x: 10, y: 10}];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        level = 1;
        speed = 100;
        scoreDisplay.textContent = `SCORE: ${score}`;
        levelDisplay.textContent = `LEVEL: ${level}`;
        
        generateInitialObstacles();
        generateFood();
        specialFood = null;
        
        if (gameRunning) {
            clearInterval(window.snakeInterval);
        }
        
        gameRunning = true;
        startButton.textContent = 'GAME RUNNING';
        window.snakeInterval = setInterval(gameLoop, speed);
    }
    
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
            x = Math.floor(Math.random() * GRID_WIDTH);
            y = Math.floor(Math.random() * GRID_HEIGHT);
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
    
    // Draw snake with glow effect
    function drawSnake() {
        snake.forEach((segment, index) => {
            // Gradient color from head to tail
            const segmentColor = index === 0 ? colors.snakeHead : colors.snake;
            
            // Draw neon glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = segmentColor;
            ctx.fillStyle = segmentColor;
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
            
            // Reset shadow for other elements
            ctx.shadowBlur = 0;
            
            // Draw eyes on the head
            if (index === 0) {
                ctx.fillStyle = '#ffffff';
                let eyeX1, eyeX2, eyeY1, eyeY2;
                
                switch(direction) {
                    case 'up':
                        eyeX1 = segment.x * GRID_SIZE + 5;
                        eyeY1 = segment.y * GRID_SIZE + 5;
                        eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - 7;
                        eyeY2 = segment.y * GRID_SIZE + 5;
                        break;
                    case 'down':
                        eyeX1 = segment.x * GRID_SIZE + 5;
                        eyeY1 = segment.y * GRID_SIZE + GRID_SIZE - 7;
                        eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - 7;
                        eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - 7;
                        break;
                    case 'left':
                        eyeX1 = segment.x * GRID_SIZE + 5;
                        eyeY1 = segment.y * GRID_SIZE + 5;
                        eyeX2 = segment.x * GRID_SIZE + 5;
                        eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - 7;
                        break;
                    case 'right':
                        eyeX1 = segment.x * GRID_SIZE + GRID_SIZE - 7;
                        eyeY1 = segment.y * GRID_SIZE + 5;
                        eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - 7;
                        eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - 7;
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
    
    // Draw food with glow effect
    function drawFood() {
        if (food) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = colors.food;
            ctx.fillStyle = colors.food;
            ctx.beginPath();
            ctx.arc(food.x * GRID_SIZE + GRID_SIZE/2, food.y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2 - 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        if (specialFood) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = colors.specialFood;
            ctx.fillStyle = colors.specialFood;
            const pulseFactor = 0.8 + 0.2 * Math.sin(Date.now() / 100);
            ctx.beginPath();
            ctx.arc(
                specialFood.x * GRID_SIZE + GRID_SIZE/2, 
                specialFood.y * GRID_SIZE + GRID_SIZE/2, 
                (GRID_SIZE/2 - 1) * pulseFactor, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Add special food time animation
            ctx.strokeStyle = colors.specialFood;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                specialFood.x * GRID_SIZE + GRID_SIZE/2,
                specialFood.y * GRID_SIZE + GRID_SIZE/2,
                GRID_SIZE/2 + 3,
                0,
                Math.PI * 2 * (specialFood.timeLeft / 100)
            );
            ctx.stroke();
        }
    }
    
    // Draw obstacles with glow effect
    function drawObstacles() {
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.obstacle;
        ctx.fillStyle = colors.obstacle;
        
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x * GRID_SIZE, obstacle.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
        });
        
        ctx.shadowBlur = 0;
    }
    
    // Move the snake
    function moveSnake() {
        direction = nextDirection;
        const head = {x: snake[0].x, y: snake[0].y};
        
        // Update head position based on direction
        switch(direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Check for collision with walls (wrap around)
        if (head.x < 0) head.x = GRID_WIDTH - 1;
        if (head.x >= GRID_WIDTH) head.x = 0;
        if (head.y < 0) head.y = GRID_HEIGHT - 1;
        if (head.y >= GRID_HEIGHT) head.y = 0;
        
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
        
        // Add new head to beginning of snake array
        snake.unshift(head);
        
        // Check if food eaten
        if (food && head.x === food.x && head.y === food.y) {
            food = null;
            score += 10;
            scoreDisplay.textContent = `SCORE: ${score}`;
            
            // Check for level up
            if (score >= level * 100) {
                levelUp();
            }
            
            setTimeout(generateFood, 500);
        } else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
            // Special food gives more points
            score += specialFood.points;
            scoreDisplay.textContent = `SCORE: ${score}`;
            specialFood = null;
            
            // Check for level up
            if (score >= level * 100) {
                levelUp();
            }
        } else {
            // Remove tail segment if no food eaten
            snake.pop();
        }
        
        // Update special food timer
        if (specialFood) {
            specialFood.timeLeft--;
            if (specialFood.timeLeft <= 0) {
                specialFood = null;
            }
        }
        
        // Randomly spawn special food
        if (!specialFood && Math.random() < 0.005 * level) {
            generateSpecialFood();
        }
    }
    
    // Level up function
    function levelUp() {
        level++;
        levelDisplay.textContent = `LEVEL: ${level}`;
        
        // Make the game faster with each level
        clearInterval(window.snakeInterval);
        speed = Math.max(50, 100 - level * 5);
        window.snakeInterval = setInterval(gameLoop, speed);
        
        // Add more obstacles
        generateObstacle();
        
        // Flash the level indicator
        levelDisplay.style.color = '#ff3838';
        setTimeout(() => { levelDisplay.style.color = ''; }, 1000);
    }
    
    // Generate food
    function generateFood() {
        let x, y;
        let validPosition = false;
        
        while (!validPosition) {
            x = Math.floor(Math.random() * GRID_WIDTH);
            y = Math.floor(Math.random() * GRID_HEIGHT);
            validPosition = true;
            
            // Check if position overlaps with snake
            for (let segment of snake) {
                if (segment.x === x && segment.y === y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check if position overlaps with specialFood
            if (specialFood && specialFood.x === x && specialFood.y === y) {
                validPosition = false;
            }
            
            // Check if position overlaps with obstacles
            for (let obstacle of obstacles) {
                if (obstacle.x === x && obstacle.y === y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        food = {x, y, type: 'normal'};
    }
    
    // Generate special food
    function generateSpecialFood() {
        let x, y;
        let validPosition = false;
        
        while (!validPosition) {
            x = Math.floor(Math.random() * GRID_WIDTH);
            y = Math.floor(Math.random() * GRID_HEIGHT);
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
            
            // Check if position overlaps with obstacles
            for (let obstacle of obstacles) {
                if (obstacle.x === x && obstacle.y === y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        specialFood = {
            x, 
            y, 
            type: 'special',
            points: level * 20,
            timeLeft: 100
        };
    }
    
    // Game over function
    function gameOver() {
        clearInterval(window.snakeInterval);
        
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <h3>GAME OVER</h3>
            <p>SCORE: ${score}</p>
            <p>LEVEL: ${level}</p>
            <button id="restart-snake">PLAY AGAIN</button>
        `;
        container.querySelector('div').appendChild(overlay);
        
        document.getElementById('restart-snake').addEventListener('click', function() {
            overlay.remove();
            initGame();
        });
        
        gameRunning = false;
        startButton.textContent = 'RESTART GAME';
    }
    
    // Game loop
    function gameLoop() {
        // Clear the canvas
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < GRID_WIDTH; i++) {
            ctx.beginPath();
            ctx.moveTo(i * GRID_SIZE, 0);
            ctx.lineTo(i * GRID_SIZE, canvas.height);
            ctx.stroke();
        }
        for (let j = 0; j < GRID_HEIGHT; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * GRID_SIZE);
            ctx.lineTo(canvas.width, j * GRID_SIZE);
            ctx.stroke();
        }
        
        // Draw game elements
        drawObstacles();
        drawFood();
        moveSnake();
        drawSnake();
    }
    
    // Event listeners
    startButton.addEventListener('click', function() {
        if (!gameRunning) {
            initGame();
        }
    });
    
    const handleKeydown = function(event) {
        if (!gameRunning) return;
        
        switch(event.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    };
    
    addGameEventListener('keydown', handleKeydown);
    
    // Mobile touch controls
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = function(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    };
    
    const handleTouchMove = function(event) {
        if (!gameRunning) return;
        event.preventDefault();
        
        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Determine swipe direction
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
            // Horizontal swipe
            if (dx > 0) {
                if (direction !== 'left') nextDirection = 'right';
            } else {
                if (direction !== 'right') nextDirection = 'left';
            }
            touchStartX = touchEndX;
            touchStartY = touchEndY;
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
            // Vertical swipe
            if (dy > 0) {
                if (direction !== 'up') nextDirection = 'down';
            } else {
                if (direction !== 'down') nextDirection = 'up';
            }
            touchStartX = touchEndX;
            touchStartY = touchEndY;
        }
    };
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
}

// Asteroids Game
function loadAsteroidsGame(container) {
    container.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 800px; margin: 0 auto;">
            <canvas id="asteroids-canvas" width="800" height="600" style="background-color: #000;"></canvas>
            <div id="asteroids-hud" class="game-hud">
                <span id="asteroids-score">SCORE: 0</span>
                <span id="asteroids-lives" style="margin-left: 20px;">LIVES: 3</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button id="asteroids-start-button" class="game-button">START GAME</button>
        </div>
    `;
    
    const canvas = document.getElementById('asteroids-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('asteroids-start-button');
    const scoreDisplay = document.getElementById('asteroids-score');
    const livesDisplay = document.getElementById('asteroids-lives');
    
    // Game variables
    let ship;
    // Asteroids Game (Continued)
function loadAsteroidsGame(container) {
    container.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 800px; margin: 0 auto;">
            <canvas id="asteroids-canvas" width="800" height="600" style="background-color: #000;"></canvas>
            <div id="asteroids-hud" class="game-hud">
                <span id="asteroids-score">SCORE: 0</span>
                <span id="asteroids-lives" style="margin-left: 20px;">LIVES: 3</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button id="asteroids-start-button" class="game-button">START GAME</button>
        </div>
    `;
    
    const canvas = document.getElementById('asteroids-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('asteroids-start-button');
    const scoreDisplay = document.getElementById('asteroids-score');
    const livesDisplay = document.getElementById('asteroids-lives');
    
    // Game variables
    let ship;
    let asteroids = [];
    let bullets = [];
    let particles = [];
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = false;
    let keys = {};
    
    // Game colors
    const colors = {
        ship: '#00e5ff',
        bullet: '#ff003c',
        asteroid: '#ffffff',
        particle: '#00e5ff',
        text: '#00e5ff'
    };
    
    // Ship class
    class Ship {
        constructor(x, y, radius) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.angle = 0;
            this.thrust = false;
            this.thrustPower = 0.1;
            this.velocity = { x: 0, y: 0 };
            this.rotationSpeed = 0.1;
            this.invincible = false;
            this.invincibleTime = 0;
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            // Draw ship with neon effect
            ctx.strokeStyle = colors.ship;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.ship;
            
            // Only draw if not invincible or blinking
            if (!this.invincible || Math.floor(Date.now() / 100) % 2) {
                ctx.beginPath();
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(-this.radius, -this.radius / 2);
                ctx.lineTo(-this.radius / 2, 0);
                ctx.lineTo(-this.radius, this.radius / 2);
                ctx.lineTo(this.radius, 0);
                ctx.closePath();
                ctx.stroke();
                
                // Draw thrust flame if thrusting
                if (this.thrust) {
                    ctx.beginPath();
                    ctx.moveTo(-this.radius, 0);
                    ctx.lineTo(-this.radius * 2, Math.random() * 0.5 * (Math.random() > 0.5 ? 1 : -1));
                    ctx.lineTo(-this.radius * 1.5, 0);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }
        
        update() {
            // Update angle based on rotation
            if (keys.ArrowLeft) {
                this.angle -= this.rotationSpeed;
            }
            if (keys.ArrowRight) {
                this.angle += this.rotationSpeed;
            }
            
            // Apply thrust
            this.thrust = keys.ArrowUp;
            if (this.thrust) {
                this.velocity.x += Math.cos(this.angle) * this.thrustPower;
                this.velocity.y += Math.sin(this.angle) * this.thrustPower;
                
                // Create thruster particles
                if (Math.random() > 0.7) {
                    const particleX = this.x - Math.cos(this.angle) * this.radius;
                    const particleY = this.y - Math.sin(this.angle) * this.radius;
                    const particle = new Particle(particleX, particleY, Math.random() * 2 + 1, colors.particle, {
                        x: -Math.cos(this.angle) + (Math.random() - 0.5) * 0.5,
                        y: -Math.sin(this.angle) + (Math.random() - 0.5) * 0.5
                    });
                    particles.push(particle);
                }
            }
            
            // Apply friction
            this.velocity.x *= 0.98;
            this.velocity.y *= 0.98;
            
            // Update position
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Wrap around screen
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
            
            // Update invincibility
            if (this.invincible) {
                this.invincibleTime--;
                if (this.invincibleTime <= 0) {
                    this.invincible = false;
                }
            }
        }
        
        shoot() {
            // Create a new bullet at ship's position
            const bulletX = this.x + Math.cos(this.angle) * this.radius;
            const bulletY = this.y + Math.sin(this.angle) * this.radius;
            const bullet = new Bullet(bulletX, bulletY, 3, this.angle);
            bullets.push(bullet);
        }
        
        makeInvincible(time) {
            this.invincible = true;
            this.invincibleTime = time;
        }
    }
    
    // Bullet class
    class Bullet {
        constructor(x, y, radius, angle) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.velocity = {
                x: Math.cos(angle) * 10,
                y: Math.sin(angle) * 10
            };
            this.lifespan = 50; // Frames before disappearing
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = colors.bullet;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.bullet;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        update() {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Wrap around screen
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
            
            // Reduce lifespan
            this.lifespan--;
        }
    }
    
    // Asteroid class
    class Asteroid {
        constructor(x, y, radius, speed = 1) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.velocity = {
                x: (Math.random() - 0.5) * speed,
                y: (Math.random() - 0.5) * speed
            };
            this.vertexCount = Math.floor(Math.random() * 6) + 6;
            this.vertices = [];
            
            // Create random vertices around the center
            for (let i = 0; i < this.vertexCount; i++) {
                const angle = i * 2 * Math.PI / this.vertexCount;
                const distance = this.radius * (0.8 + Math.random() * 0.4);
                this.vertices.push({
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                });
            }
            
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.angle = 0;
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.strokeStyle = colors.asteroid;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 5;
            ctx.shadowColor = colors.asteroid;
            
            ctx.beginPath();
            ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
            for (let i = 1; i < this.vertexCount; i++) {
                ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }
        
        update() {
            this.angle += this.rotationSpeed;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Wrap around screen
            if (this.x < -this.radius) this.x = canvas.width + this.radius;
            if (this.x > canvas.width + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = canvas.height + this.radius;
            if (this.y > canvas.height + this.radius) this.y = -this.radius;
        }
    }
    
    // Particle class for explosions
    class Particle {
        constructor(x, y, radius, color, velocity) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.velocity = velocity;
            this.alpha = 1;
            this.friction = 0.98;
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = this.color;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.restore();
        }
        
        update() {
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= 0.01;
        }
    }
    
    // Initialize game
    function initGame() {
        ship = new Ship(canvas.width / 2, canvas.height / 2, 15);
        asteroids = [];
        bullets = [];
        particles = [];
        score = 0;
        lives = 3;
        level = 1;
        
        scoreDisplay.textContent = `SCORE: ${score}`;
        livesDisplay.textContent = `LIVES: ${lives}`;
        
        // Create initial asteroids
        createAsteroidWave();
        
        // Start game loop
        gameRunning = true;
        startButton.textContent = 'GAME RUNNING';
        
        if (gameLoop) {
            cancelAnimationFrame(gameLoop);
        }
        
        gameLoop = requestAnimationFrame(update);
    }
    
    // Create a wave of asteroids based on level
    function createAsteroidWave() {
        for (let i = 0; i < 2 + level; i++) {
            // Create asteroids away from ship
            let x, y;
            do {
                x = Math.random() * canvas.width;
                y = Math.random() * canvas.height;
            } while (distance(ship.x, ship.y, x, y) < 200);
            
            const radius = 40 + Math.random() * 20;
            asteroids.push(new Asteroid(x, y, radius, 1 + level * 0.2));
        }
    }
    
    // Distance between two points
    function distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    // Check collisions between game objects
    function checkCollisions() {
        // Check bullet-asteroid collisions
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = asteroids.length - 1; j >= 0; j--) {
                const dist = distance(bullets[i].x, bullets[i].y, asteroids[j].x, asteroids[j].y);
                
                if (dist < bullets[i].radius + asteroids[j].radius) {
                    // Create explosion particles
                    for (let k = 0; k < asteroids[j].radius; k++) {
                        particles.push(new Particle(
                            asteroids[j].x,
                            asteroids[j].y,
                            Math.random() * 3 + 1,
                            colors.asteroid,
                            {
                                x: (Math.random() - 0.5) * 5,
                                y: (Math.random() - 0.5) * 5
                            }
                        ));
                    }
                    
                    // Split asteroid if large enough
                    if (asteroids[j].radius > 20) {
                        for (let k = 0; k < 2; k++) {
                            asteroids.push(new Asteroid(
                                asteroids[j].x,
                                asteroids[j].y,
                                asteroids[j].radius / 2,
                                1.5 + level * 0.2
                            ));
                        }
                    }
                    
                    // Update score
                    score += Math.floor(100 / asteroids[j].radius) * 10;
                    scoreDisplay.textContent = `SCORE: ${score}`;
                    
                    // Remove asteroid and bullet
                    asteroids.splice(j, 1);
                    bullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // Check ship-asteroid collisions
        if (!ship.invincible) {
            for (let i = asteroids.length - 1; i >= 0; i--) {
                const dist = distance(ship.x, ship.y, asteroids[i].x, asteroids[i].y);
                
                if (dist < ship.radius + asteroids[i].radius) {
                    // Create explosion particles for ship
                    for (let j = 0; j < 20; j++) {
                        particles.push(new Particle(
                            ship.x,
                            ship.y,
                            Math.random() * 3 + 1,
                            colors.ship,
                            {
                                x: (Math.random() - 0.5) * 5,
                                y: (Math.random() - 0.5) * 5
                            }
                        ));
                    }
                    
                    lives--;
                    livesDisplay.textContent = `LIVES: ${lives}`;
                    
                    if (lives <= 0) {
                        gameOver();
                    } else {
                        resetShip();
                    }
                    break;
                }
            }
        }
        
        // Check if all asteroids destroyed (next level)
        if (asteroids.length === 0) {
            level++;
            ship.makeInvincible(120);
            createAsteroidWave();
        }
    }
    
    // Reset ship after death
    function resetShip() {
        ship.x = canvas.width / 2;
        ship.y = canvas.height / 2;
        ship.velocity = { x: 0, y: 0 };
        ship.angle = 0;
        ship.makeInvincible(180);
    }
    
    // Draw stars in background
    function drawStarfield() {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 1.5;
            const opacity = Math.random() * 0.8 + 0.2;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fillRect(x, y, size, size);
        }
        
        // Draw distant nebula
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.height
        );
        gradient.addColorStop(0, "rgba(0, 30, 60, 0)");
        gradient.addColorStop(1, "rgba(0, 10, 20, 0.3)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(gameLoop);
        
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <h3>GAME OVER</h3>
            <p>SCORE: ${score}</p>
            <p>LEVEL: ${level}</p>
            <button id="asteroids-restart">PLAY AGAIN</button>
        `;
        container.querySelector('div').appendChild(overlay);
        
        document.getElementById('asteroids-restart').addEventListener('click', function() {
            overlay.remove();
            initGame();
        });
        
        startButton.textContent = 'RESTART GAME';
    }
    
    // Main game loop
    function update() {
        // Clear canvas
        drawStarfield();
        
        // Update and draw ship
        ship.update();
        ship.draw();
        
        // Update and draw bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].update();
            bullets[i].draw();
            
            if (bullets[i].lifespan <= 0) {
                bullets.splice(i, 1);
            }
        }
        
        // Update and draw asteroids
        for (let i = 0; i < asteroids.length; i++) {
            asteroids[i].update();
            asteroids[i].draw();
        }
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // Check collisions
        checkCollisions();
        
        if (gameRunning) {
            gameLoop = requestAnimationFrame(update);
        }
    }
    
    // Event listeners
    const handleKeydown = function(event) {
        if (!gameRunning) return;
        keys[event.key] = true;
        
        // Shoot on spacebar
        if (event.key === ' ' || event.key === 'Space') {
            ship.shoot();
        }
    };
    
    const handleKeyup = function(event) {
        keys[event.key] = false;
    };
    
    addGameEventListener('keydown', handleKeydown);
    addGameEventListener('keyup', handleKeyup);
    
    // Mobile controls
    let touchX, touchY;
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
        
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + canvas.width / 2;
        const centerY = rect.top + canvas.height / 2;
        
        // Shoot if tapping near center
        if (Math.abs(touchX - centerX) < 50 && Math.abs(touchY - centerY) < 50) {
            if (ship) ship.shoot();
        }
        
        // Set controls based on touch quadrant
        if (touchX < centerX) {
            keys.ArrowLeft = true;
            keys.ArrowRight = false;
        } else {
            keys.ArrowLeft = false;
            keys.ArrowRight = true;
        }
        
        if (touchY < centerY) {
            keys.ArrowUp = true;
        } else {
            keys.ArrowUp = false;
        }
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
        
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + canvas.width / 2;
        const centerY = rect.top + canvas.height / 2;
        
        // Set controls based on touch quadrant
        if (touchX < centerX) {
            keys.ArrowLeft = true;
            keys.ArrowRight = false;
        } else {
            keys.ArrowLeft = false;
            keys.ArrowRight = true;
        }
        
        if (touchY < centerY) {
            keys.ArrowUp = true;
        } else {
            keys.ArrowUp = false;
        }
    });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
        keys.ArrowUp = false;
    });
    
    // Start button click handler
    startButton.addEventListener('click', function() {
        if (!gameRunning) {
            initGame();
        }
    });
    
    // Draw instructions
    drawStarfield();
    ctx.font = "20px 'Orbitron'";
    ctx.fillStyle = colors.text;
    ctx.textAlign = "center";
    ctx.fillText("PRESS START TO PLAY", canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = "16px 'Rajdhani'";
    ctx.fillText("ARROW KEYS TO CONTROL SHIP", canvas.width / 2, canvas.height / 2);
    ctx.fillText("SPACE TO SHOOT", canvas.width / 2, canvas.height / 2 + 30);
}

// Zombie Shooter Game
function loadZombieShooterGame(container) {
    container.innerHTML = `
        <div style="position: relative; width: 100%; max-width: 800px; margin: 0 auto; overflow: hidden;">
            <canvas id="zombie-canvas" width="800" height="600" style="background-color: #111;"></canvas>
            <div id="zombie-hud" class="game-hud">
                <span id="zombie-score">KILLS: 0</span>
                <span id="zombie-ammo" style="margin-left: 20px;">AMMO: 10/10</span>
                <span id="zombie-health" style="margin-left: 20px;">HEALTH: 100</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button id="zombie-start" class="game-button">START GAME</button>
        </div>
    `;
    
    const canvas = document.getElementById('zombie-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('zombie-start');
    const scoreDisplay = document.getElementById('zombie-score');
    const ammoDisplay = document.getElementById('zombie-ammo');
    const healthDisplay = document.getElementById('zombie-health');
    
    // Game variables
    let player;
    let playerImg;
    let zombies = [];
    let zombieImg;
    let bullets = [];
    let kills = 0;
    let wave = 1;
    let gameRunning = false;
    let lastTime = 0;
    let spawnCounter = 0;
    let bloodParticles = [];
    let powerUps = [];
    let mouse = { x: 0, y: 0 };
    let shooting = false;
    
    // Load images
    playerImg = new Image();
    playerImg.src = 'https://i.ibb.co/9V5FhQd/player.png'; // Player sprite
    
    zombieImg = new Image();
    zombieImg.src = 'https://i.ibb.co/DWhhzD3/zombie.png'; // Zombie sprite
    
    // Player class
    class Player {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 30;
            this.height = 50;
            this.speed = 5;
            this.angle = 0;
            this.health = 100;
            this.ammo = 10;
            this.maxAmmo = 10;
            this.reloadTime = 1500; // ms
            this.isReloading = false;
            this.reloadProgress = 0;
            this.shootCooldown = 0;
            this.shootDelay = 300; // ms between shots
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            // Draw player with neon outline
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00e5ff';
            ctx.drawImage(playerImg, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.shadowBlur = 0;
            
            ctx.restore();
            
            // Draw reload progress if reloading
            if (this.isReloading) {
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#00e5ff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 25, 0, 2 * Math.PI * (this.reloadProgress / this.reloadTime));
                ctx.stroke();
            }
        }
        
        move(direction) {
            switch (direction) {
                case 'up':
                    this.y = Math.max(this.y - this.speed, this.height / 2);
                    break;
                case 'down':
                    this.y = Math.min(this.y + this.speed, canvas.height - this.height / 2);
                    break;
                case 'left':
                    this.x = Math.max(this.x - this.speed, this.width / 2);
                    break;
                case 'right':
                    this.x = Math.min(this.x + this.speed, canvas.width - this.width / 2);
                    break;
            }
        }
        
        shoot() {
            if (this.ammo <= 0) {
                this.reload();
                return;
            }
            
            if (this.isReloading || this.shootCooldown > 0) return;
            
            // Create a new bullet
            const bullet = new Bullet(
                this.x, 
                this.y, 
                this.angle, 
                10, 
                '#ff003c'
            );
            bullets.push(bullet);
            
            // Reduce ammo
            this.ammo--;
            ammoDisplay.textContent = `AMMO: ${this.ammo}/${this.maxAmmo}`;
            
            // Set cooldown
            this.shootCooldown = this.shootDelay;
        }
        
        reload() {
            if (this.ammo === this.maxAmmo || this.isReloading) return;
            
            this.isReloading = true;
            this.reloadProgress = 0;
            
            // Timer for reload
            setTimeout(() => {
                this.ammo = this.maxAmmo;
                this.isReloading = false;
                ammoDisplay.textContent = `AMMO: ${this.ammo}/${this.maxAmmo}`;
            }, this.reloadTime);
        }
        
        update(deltaTime) {
            // Look at mouse
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            this.angle = Math.atan2(dy, dx);
            
            // Update reload progress
            if (this.isReloading) {
                this.reloadProgress += deltaTime;
            }
            
            // Update shoot cooldown
            if (this.shootCooldown > 0) {
                this.shootCooldown -= deltaTime;
            }
            
            // Auto shoot if mouse is held down
            if (shooting && this.shootCooldown <= 0) {
                this.shoot();
            }
            
            // Check for collision with power ups
            for (let i = powerUps.length - 1; i >= 0; i--) {
                const powerUp = powerUps[i];
                const dx = this.x - powerUp.x;
                const dy = this.y - powerUp.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30) {
                    powerUp.apply(this);
                    powerUps.splice(i, 1);
                }
            }
        }
        
        takeDamage(amount) {
            this.health -= amount;
            healthDisplay.
