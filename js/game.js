// Main game logic

// Initialize the game
function initGame() {
    // Set up canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize walls
    initWalls();
    
    // Set up joystick controls for touch devices
    setupTouchControls();
    
    // Set up keyboard controls for desktop
    setupKeyboardControls();
    
    // Set up the join game button
    joinGameBtn.addEventListener('click', function() {
        if (gameState.isMultiplayer) {
            startMultiplayerGame();
        } else {
            joinGame();
        }
    });
    
    // Return to game button
    returnToGameBtn.addEventListener('click', function() {
        battleScreen.style.display = 'none';
        gameState.inBattle = false;
        
        // Clear inBattle flag for multiplayer
        if (gameState.isMultiplayer && gameState.localPlayer) {
            gameState.localPlayer.inBattle = false;
        }
    });
}

// Start multiplayer game
function startMultiplayerGame(gameSettings) {
    const playerName = playerNameInput.value.trim() || 'Player';
    const playerColor = playerColorSelect.value;
    
    // Generate spawn position
    const spawnX = 100 + Math.random() * (CONFIG.worldWidth - 200);
    const spawnY = 100 + Math.random() * (CONFIG.worldHeight - 200);
    
    // Create local player ID
    const playerId = multiplayer.localPlayerId || 'player-' + Math.random().toString(36).substr(2, 9);
    
    // Create local player
    gameState.localPlayer = {
        id: playerId,
        name: playerName,
        x: spawnX,
        y: spawnY,
        color: playerColor,
        points: CONFIG.initialPoints,
        scriptures: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        isDead: false,
        respawnTime: 0,
        inBattle: false
    };
    
    // Add local player to players map
    gameState.players.set(playerId, gameState.localPlayer);
    
    // Add other connected players
    multiplayer.connectedPlayers.forEach((player, id) => {
        if (id !== playerId) {
            const otherSpawnX = 100 + Math.random() * (CONFIG.worldWidth - 200);
            const otherSpawnY = 100 + Math.random() * (CONFIG.worldHeight - 200);
            
            gameState.players.set(id, {
                id: id,
                name: player.name,
                x: otherSpawnX,
                y: otherSpawnY,
                color: player.color,
                points: CONFIG.initialPoints,
                scriptures: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                isDead: false,
                respawnTime: 0,
                inBattle: false
            });
        }
    });
    
    // Update player stats display
    playerNameDisplay.textContent = playerName;
    playerPointsDisplay.textContent = CONFIG.initialPoints;
    
    // Switch to game screen
    loginScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    
    // Update leaderboard
    updateLeaderboard();
    
    // Start game timer
    startGameTimer();
    
    // Start game loop
    gameState.lastUpdate = performance.now();
    requestAnimationFrame(gameLoop);
    
    // If host, notify others game has started
    if (gameState.isHost) {
        multiplayer.startGame({ gameTime: CONFIG.gameTime });
    }
}

// Setup keyboard controls
function setupKeyboardControls() {
    window.addEventListener('keydown', function(e) {
        if (gameState.keys.hasOwnProperty(e.key)) {
            gameState.keys[e.key] = true;
        }
    });
    
    window.addEventListener('keyup', function(e) {
        if (gameState.keys.hasOwnProperty(e.key)) {
            gameState.keys[e.key] = false;
        }
    });
}

// Setup touch controls
function setupTouchControls() {
    // Setup joystick touch events
    joystickArea.addEventListener('touchstart', handleJoystickStart, false);
    joystickArea.addEventListener('touchmove', handleJoystickMove, false);
    joystickArea.addEventListener('touchend', handleJoystickEnd, false);
}

// Reset the game
function resetGame() {
    // Clear game state
    gameState.players = new Map();
    gameState.inBattle = false;
    gameState.currentOpponent = null;
    gameState.battleCooldowns = new Map();
    gameState.gameOver = false;
    gameState.gameTimer = CONFIG.gameTime;
    gameState.answeredQuestions = {
        correct: new Set(),
        incorrect: new Set()
    };
    gameState.stats = {
        battlesWon: 0,
        battlesLost: 0
    };
    gameState.isMultiplayer = false;
    gameState.isHost = false;
    
    // Reset keyboard state
    Object.keys(gameState.keys).forEach(key => {
        gameState.keys[key] = false;
    });
    
    // Clear intervals
    if (gameState.aiInterval) {
        clearInterval(gameState.aiInterval);
        gameState.aiInterval = null;
    }
    
    if (gameState.gameTimerInterval) {
        clearInterval(gameState.gameTimerInterval);
        gameState.gameTimerInterval = null;
    }
    
    // Reset joystick
    resetJoystick();
    
    // Reset multiplayer
    if (multiplayer.room) {
        multiplayer.room.leave();
        multiplayer.room = null;
    }
    multiplayer.connectedPlayers.clear();
    multiplayer.isHost = false;
    multiplayer.roomCode = null;
    
    // Reset UI
    singlePlayerBtn.classList.add('active');
    multiplayerBtn.classList.remove('active');
    multiplayerOptions.style.display = 'none';
    roomCodeSection.style.display = 'none';
    joinRoomSection.style.display = 'none';
    connectedPlayers.style.display = 'none';
    roomCodeInput.value = '';
}

// Generate walls
function initWalls() {
    // Border walls
    gameState.walls = [
        // Top border
        { x: 0, y: 0, width: CONFIG.worldWidth, height: 20 },
        // Bottom border
        { x: 0, y: CONFIG.worldHeight - 20, width: CONFIG.worldWidth, height: 20 },
        // Left border
        { x: 0, y: 0, width: 20, height: CONFIG.worldHeight },
        // Right border
        { x: CONFIG.worldWidth - 20, y: 0, width: 20, height: CONFIG.worldHeight }
    ];
    
    // Add some internal walls
    gameState.walls.push(
        // Horizontal walls
        { x: 300, y: 300, width: 400, height: 20 },
        { x: 1000, y: 500, width: 500, height: 20 },
        { x: 500, y: 1200, width: 600, height: 20 },
        { x: 1200, y: 1500, width: 400, height: 20 },
        
        // Vertical walls
        { x: 800, y: 700, width: 20, height: 300 },
        { x: 1500, y: 200, width: 20, height: 400 },
        { x: 400, y: 1400, width: 20, height: 300 },
        { x: 1300, y: 800, width: 20, height: 500 }
    );
}

// Join the game (single player)
function joinGame() {
    const playerName = playerNameInput.value.trim() || 'Player';
    const playerColor = playerColorSelect.value;
    
    // Create a random spawn position
    const spawnX = 100 + Math.random() * (CONFIG.worldWidth - 200);
    const spawnY = 100 + Math.random() * (CONFIG.worldHeight - 200);
    
    // Create local player with first 12 scriptures
    gameState.localPlayer = {
        id: 'player',
        name: playerName,
        x: spawnX,
        y: spawnY,
        color: playerColor,
        points: CONFIG.initialPoints,
        scriptures: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // First 12 scriptures
        isDead: false,
        respawnTime: 0
    };
    
    // Add local player to players map
    gameState.players.set('player', gameState.localPlayer);
    
    // Generate AI players
    generateAIPlayers();
    
    // Update player stats display
    playerNameDisplay.textContent = playerName;
    playerPointsDisplay.textContent = CONFIG.initialPoints;
    
    // Switch to game screen
    loginScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    
    // Update leaderboard
    updateLeaderboard();
    
    // Start game timer
    startGameTimer();
    
    // Start AI movement
    startAIMovement();
    
    // Start game loop
    gameState.lastUpdate = performance.now();
    requestAnimationFrame(gameLoop);
}

// Start game timer
function startGameTimer() {
    // Display initial time
    gameTimerDisplay.textContent = gameState.gameTimer;
    
    // Clear previous interval if exists
    if (gameState.gameTimerInterval) {
        clearInterval(gameState.gameTimerInterval);
    }
    
    // Set new interval
    gameState.gameTimerInterval = setInterval(() => {
        // Skip timer updates if in battle
        if (gameState.inBattle) return;
        
        gameState.gameTimer--;
        gameTimerDisplay.textContent = gameState.gameTimer;
        
        // Check if game is over
        if (gameState.gameTimer <= 0) {
            endGame();
        }
    }, 1000);
}

// End the game
function endGame() {
    gameState.gameOver = true;
    
    // Clear intervals
    if (gameState.aiInterval) {
        clearInterval(gameState.aiInterval);
    }
    
    if (gameState.gameTimerInterval) {
        clearInterval(gameState.gameTimerInterval);
    }
    
    // Update final stats
    finalScoreElem.textContent = gameState.localPlayer.points;
    battlesWonElem.textContent = gameState.stats.battlesWon;
    battlesLostElem.textContent = gameState.stats.battlesLost;
    
    // Update final leaderboard
    let leaderboardHTML = '';
    gameState.leaderboard.forEach((player, index) => {
        leaderboardHTML += `<li>${index+1}. ${player.name}: ${player.points} points</li>`;
    });
    finalLeaderboardListElem.innerHTML = leaderboardHTML;
    
    // Show game over screen
    gameScreen.style.display = 'none';
    battleScreen.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    
    // Save high score to localStorage if it's higher than previous
    saveHighScore(gameState.localPlayer.name, gameState.localPlayer.points);
}

// Generate AI players
function generateAIPlayers() {
    const names = [
        'Joseph Smith', 'Emma Smith', 'Brigham Young', 'Lucy Mack Smith',
        'Martin Harris', 'Oliver Cowdery', 'Hyrum Smith', 'Moroni',
        'Nephi', 'Alma', 'Sidney Rigdon', 'Parley P. Pratt'
    ];
    
    const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#FF33F5',
        '#F5FF33', '#33FFF5', '#FF8333', '#8333FF'
    ];
    
    // Create AI players - one for each of the first 12 scriptures
    for (let i = 0; i < CONFIG.aiPlayerCount; i++) {
        // Random position away from player
        let x, y;
        const minDistance = 300; // Minimum distance from player
        
        do {
            x = 100 + Math.random() * (CONFIG.worldWidth - 200);
            y = 100 + Math.random() * (CONFIG.worldHeight - 200);
            
            const dx = x - gameState.localPlayer.x;
            const dy = y - gameState.localPlayer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance >= minDistance) break;
        } while (true);
        
        // All AIs have access to all scriptures
        // Create AI player
        const aiPlayer = {
            id: 'ai-' + i,
            name: names[i], // Use name at index i for uniqueness
            x: x,
            y: y,
            color: colors[i % colors.length],
            points: CONFIG.initialPoints,
            scriptures: Array.from({length: 12}, (_, i) => i + 1), // All 12 scriptures
            isDead: false,
            respawnTime: 0,
            direction: {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1
            }
        };
        
        // Add to players map
        gameState.players.set(aiPlayer.id, aiPlayer);
    }
}

// Start AI movement
function startAIMovement() {
    // Clear previous interval if exists
    if (gameState.aiInterval) {
        clearInterval(gameState.aiInterval);
    }
    
    // Set new interval
    gameState.aiInterval = setInterval(updateAIPlayers, CONFIG.aiUpdateInterval);
}

// Update AI players
function updateAIPlayers() {
    for (const [id, player] of gameState.players.entries()) {
        // Skip local player and dead AIs
        if (id === 'player' || player.isDead) continue;
        
        // Handle respawn for dead AI
        if (player.isDead) {
            player.respawnTime -= CONFIG.aiUpdateInterval;
            if (player.respawnTime <= 0) {
                // Respawn
                const spawnX = 100 + Math.random() * (CONFIG.worldWidth - 200);
                const spawnY = 100 + Math.random() * (CONFIG.worldHeight - 200);
                
                player.x = spawnX;
                player.y = spawnY;
                player.isDead = false;
                player.points = 1; // Respawn with 1 point
            }
            continue;
        }
        
        // Possibly change direction
        if (Math.random() < CONFIG.aiMoveChance) {
            player.direction = {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1
            };
            
            // Normalize direction
            const length = Math.sqrt(player.direction.x * player.direction.x + player.direction.y * player.direction.y);
            if (length > 0) {
                player.direction.x /= length;
                player.direction.y /= length;
            }
        }
        
        // Save old position for collision detection
        const oldX = player.x;
        const oldY = player.y;
        
        // Move the AI player
        player.x += player.direction.x * CONFIG.aiMoveSpeed;
        player.y += player.direction.y * CONFIG.aiMoveSpeed;
        
        // Check world boundaries
        player.x = Math.max(CONFIG.playerSize, Math.min(CONFIG.worldWidth - CONFIG.playerSize, player.x));
        player.y = Math.max(CONFIG.playerSize, Math.min(CONFIG.worldHeight - CONFIG.playerSize, player.y));
        
        // Check wall collisions
        for (const wall of gameState.walls) {
            if (checkCollision(player, wall)) {
                // Revert to old position and pick new direction
                player.x = oldX;
                player.y = oldY;
                
                player.direction = {
                    x: Math.random() * 2 - 1,
                    y: Math.random() * 2 - 1
                };
                
                // Normalize direction
                const length = Math.sqrt(player.direction.x * player.direction.x + player.direction.y * player.direction.y);
                if (length > 0) {
                    player.direction.x /= length;
                    player.direction.y /= length;
                }
                
                break;
            }
        }
    }
}

// Game Loop
function gameLoop(timestamp) {
    // Check if game is over
    if (gameState.gameOver) return;
    
    // Calculate delta time
    const deltaTime = timestamp - gameState.lastUpdate;
    gameState.lastUpdate = timestamp;
    
    // Update
    update(deltaTime);
    
    // Render
    render();
    
    // Loop
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
    // Skip updates if in battle
    if (gameState.inBattle) return;
    
    // Handle player respawn if dead
    if (gameState.localPlayer.isDead) {
        gameState.localPlayer.respawnTime -= deltaTime;
        if (gameState.localPlayer.respawnTime <= 0) {
            respawnPlayer();
        }
        return;
    }
    
    // Calculate movement direction from joystick or keyboard
    let moveX = 0;
    let moveY = 0;
    
    // Check touch joystick input
    if (gameState.touchJoystick.active) {
        moveX = gameState.touchJoystick.moveX;
        moveY = gameState.touchJoystick.moveY;
    }
    
    // Check keyboard input (allows both control methods simultaneously)
    if (gameState.keys.ArrowUp || gameState.keys.w) moveY -= 1;
    if (gameState.keys.ArrowDown || gameState.keys.s) moveY += 1;
    if (gameState.keys.ArrowLeft || gameState.keys.a) moveX -= 1;
    if (gameState.keys.ArrowRight || gameState.keys.d) moveX += 1;
    
    // Apply movement speed
    moveX *= CONFIG.moveSpeed;
    moveY *= CONFIG.moveSpeed;
    
    // Save old position for collision detection
    const oldX = gameState.localPlayer.x;
    const oldY = gameState.localPlayer.y;
    
    // Update position
    gameState.localPlayer.x += moveX;
    gameState.localPlayer.y += moveY;
    
    // Check world boundaries
    gameState.localPlayer.x = Math.max(CONFIG.playerSize, Math.min(CONFIG.worldWidth - CONFIG.playerSize, gameState.localPlayer.x));
    gameState.localPlayer.y = Math.max(CONFIG.playerSize, Math.min(CONFIG.worldHeight - CONFIG.playerSize, gameState.localPlayer.y));
    
    // Check wall collisions
    for (const wall of gameState.walls) {
        if (checkCollision(gameState.localPlayer, wall)) {
            // Revert to old position
            gameState.localPlayer.x = oldX;
            gameState.localPlayer.y = oldY;
            break;
        }
    }
    
    // Update camera to follow player
    gameState.camera.x = gameState.localPlayer.x - canvas.width / 2;
    gameState.camera.y = gameState.localPlayer.y - canvas.height / 2;
    
    // Clamp camera to world bounds
    gameState.camera.x = Math.max(0, Math.min(CONFIG.worldWidth - canvas.width, gameState.camera.x));
    gameState.camera.y = Math.max(0, Math.min(CONFIG.worldHeight - canvas.height, gameState.camera.y));
    
    // Update player position display
    playerPositionDisplay.textContent = `X: ${Math.round(gameState.localPlayer.x)}, Y: ${Math.round(gameState.localPlayer.y)}`;
    
    // Send position update in multiplayer
    if (gameState.isMultiplayer && multiplayer.room) {
        multiplayer.sendPlayerPosition(gameState.localPlayer);
    }
    
    // Check for battles
    if (gameState.isMultiplayer) {
        checkForMultiplayerBattles();
    } else {
        checkForBattles();
    }
}

// Respawn the player
function respawnPlayer() {
    // Find a random spawn position
    const spawnX = 100 + Math.random() * (CONFIG.worldWidth - 200);
    const spawnY = 100 + Math.random() * (CONFIG.worldHeight - 200);
    
    // Update player
    gameState.localPlayer.x = spawnX;
    gameState.localPlayer.y = spawnY;
    gameState.localPlayer.isDead = false;
    gameState.localPlayer.points = 1; // Respawn with 1 point
    
    // Update UI
    playerPointsDisplay.textContent = gameState.localPlayer.points;
}

// Check collision between a circle (player) and a rectangle (wall)
function checkCollision(player, wall) {
    // Find the closest point on the rectangle to the circle
    const closestX = Math.max(wall.x, Math.min(player.x, wall.x + wall.width));
    const closestY = Math.max(wall.y, Math.min(player.y, wall.y + wall.height));
    
    // Calculate the distance from the closest point to the circle's center
    const distanceX = player.x - closestX;
    const distanceY = player.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    // Check if the distance is less than the circle's radius squared
    return distanceSquared <= (CONFIG.playerSize * CONFIG.playerSize);
}

// Render the game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply camera transform
    ctx.save();
    ctx.translate(-gameState.camera.x, -gameState.camera.y);
    
    // Draw world background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, CONFIG.worldWidth, CONFIG.worldHeight);
    
    // Draw walls
    ctx.fillStyle = '#333333';
    for (const wall of gameState.walls) {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    }
    
    // Draw players
    for (const player of gameState.players.values()) {
        // Skip dead players
        if (player.isDead) continue;
        
        ctx.beginPath();
        ctx.arc(player.x, player.y, CONFIG.playerSize, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        
        // Draw player name
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x, player.y - CONFIG.playerSize - 5);
        
        // Draw points
        ctx.fillText(player.points + ' pts', player.x, player.y - CONFIG.playerSize - 20);
        
        // Draw battle radius for local player
        if (player.id === gameState.localPlayer.id) {
            ctx.beginPath();
            ctx.arc(player.x, player.y, CONFIG.battleRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.stroke();
        }
    }
    
    // Restore transform
    ctx.restore();
}
