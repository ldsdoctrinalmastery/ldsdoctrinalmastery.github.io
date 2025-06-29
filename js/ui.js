// DOM Elements
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const battleScreen = document.getElementById('battle-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const playerNameInput = document.getElementById('player-name');
const playerColorSelect = document.getElementById('player-color');
const joinGameBtn = document.getElementById('join-game');
const leaderboardList = document.getElementById('leaderboard-list');
const gameTimerDisplay = document.getElementById('game-timer');
const playerNameDisplay = document.getElementById('player-name-display');
const playerPointsDisplay = document.getElementById('player-points');
const playerPositionDisplay = document.getElementById('player-position');
const battlePhase1 = document.getElementById('battle-phase-1');
const battlePhase2 = document.getElementById('battle-phase-2');
const player1NameElem = document.getElementById('player1-name');
const player2NameElem = document.getElementById('player2-name');
const player1PointsElem = document.getElementById('player1-points');
const player2PointsElem = document.getElementById('player2-points');
const questionTextElem = document.getElementById('question-text');
const scriptureReferenceElem = document.getElementById('scripture-reference');
const answersContainerElem = document.getElementById('answers-container');
const battleTimerElem = document.getElementById('battle-timer');
const resultMessageElem = document.getElementById('result-message');
const returnToGameBtn = document.getElementById('return-to-game');
const finalScoreElem = document.getElementById('final-score');
const battlesWonElem = document.getElementById('battles-won');
const battlesLostElem = document.getElementById('battles-lost');
const finalLeaderboardListElem = document.getElementById('final-leaderboard-list');
const playAgainBtn = document.getElementById('play-again-btn');
const joystickArea = document.getElementById('joystick-area');
const joystickKnob = document.getElementById('joystick-knob');

// Multiplayer UI Elements
const singlePlayerBtn = document.getElementById('single-player-btn');
const multiplayerBtn = document.getElementById('multiplayer-btn');
const multiplayerOptions = document.getElementById('multiplayer-options');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const roomCodeSection = document.getElementById('room-code-section');
const joinRoomSection = document.getElementById('join-room-section');
const roomCodeDisplay = document.getElementById('room-code-display');
const roomCodeInput = document.getElementById('room-code-input');
const copyCodeBtn = document.getElementById('copy-code-btn');
const connectBtn = document.getElementById('connect-btn');
const connectedPlayers = document.getElementById('connected-players');
const playerList = document.getElementById('player-list');

// Initialize canvas and joystick references
gameState.canvas = canvas;
gameState.ctx = ctx;
gameState.touchJoystick.area = joystickArea;
gameState.touchJoystick.knob = joystickKnob;

// Setup multiplayer UI handlers
function setupMultiplayerUI() {
    // Mode selection
    singlePlayerBtn.addEventListener('click', function() {
        multiplayerBtn.classList.remove('active');
        this.classList.add('active');
        multiplayerOptions.style.display = 'none';
        gameState.isMultiplayer = false;
    });
    
    multiplayerBtn.addEventListener('click', function() {
        singlePlayerBtn.classList.remove('active');
        this.classList.add('active');
        multiplayerOptions.style.display = 'block';
        gameState.isMultiplayer = true;
    });
    
    // Create room
    createRoomBtn.addEventListener('click', function() {
        const playerName = playerNameInput.value.trim() || 'Player';
        const playerColor = playerColorSelect.value;
        
        joinRoomSection.style.display = 'none';
        multiplayer.createRoom(playerName, playerColor);
        gameState.isHost = true;
    });
    
    // Join room
    joinRoomBtn.addEventListener('click', function() {
        roomCodeSection.style.display = 'none';
        joinRoomSection.style.display = 'block';
    });
    
    // Connect to room
    connectBtn.addEventListener('click', function() {
        const roomCode = roomCodeInput.value.trim().toUpperCase();
        if (roomCode.length !== 6) {
            alert('Please enter a valid 6-character room code');
            return;
        }
        
        const playerName = playerNameInput.value.trim() || 'Player';
        const playerColor = playerColorSelect.value;
        
        multiplayer.joinRoom(roomCode, playerName, playerColor);
    });
    
    // Auto-uppercase room code input
    const roomCodeInputElement = document.getElementById('room-code-input');
    if (roomCodeInputElement) {
        roomCodeInputElement.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }
    
    // Copy room code
    copyCodeBtn.addEventListener('click', function() {
        const code = roomCodeDisplay.textContent;
        navigator.clipboard.writeText(code).then(() => {
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = 'Copy Code';
            }, 2000);
        }).catch(() => {
            // Fallback for mobile
            const textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = 'Copy Code';
            }, 2000);
        });
    });
}

// Update the leaderboard
function updateLeaderboard() {
    // Sort players by points
    const sortedPlayers = Array.from(gameState.players.values())
        .sort((a, b) => b.points - a.points)
        .slice(0, 5); // Top 5
    
    // Update leaderboard UI
    let html = '';
    sortedPlayers.forEach(player => {
        html += `<li>${player.name}: ${player.points} points</li>`;
    });
    leaderboardList.innerHTML = html;
    
    // Store sorted leaderboard
    gameState.leaderboard = sortedPlayers;
}

// Handle joystick touch start
function handleJoystickStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = joystickArea.getBoundingClientRect();
    
    gameState.touchJoystick.active = true;
    gameState.touchJoystick.startX = rect.left + rect.width / 2;
    gameState.touchJoystick.startY = rect.top + rect.height / 2;
    
    updateJoystickPosition(touch.clientX, touch.clientY);
}

// Handle joystick touch move
function handleJoystickMove(event) {
    event.preventDefault();
    if (gameState.touchJoystick.active) {
        const touch = event.touches[0];
        updateJoystickPosition(touch.clientX, touch.clientY);
    }
}

// Handle joystick touch end
function handleJoystickEnd(event) {
    event.preventDefault();
    resetJoystick();
}

// Update joystick position
function updateJoystickPosition(clientX, clientY) {
    const areaRect = joystickArea.getBoundingClientRect();
    const centerX = areaRect.left + areaRect.width / 2;
    const centerY = areaRect.top + areaRect.height / 2;
    
    // Calculate distance from center
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Limit joystick movement to area bounds
    const maxDistance = areaRect.width / 2;
    if (distance > maxDistance) {
        dx = dx * maxDistance / distance;
        dy = dy * maxDistance / distance;
    }
    
    // Update knob position
    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    
    // Update movement values
    gameState.touchJoystick.moveX = dx / maxDistance;
    gameState.touchJoystick.moveY = dy / maxDistance;
}

// Reset joystick position
function resetJoystick() {
    gameState.touchJoystick.active = false;
    gameState.touchJoystick.moveX = 0;
    gameState.touchJoystick.moveY = 0;
    joystickKnob.style.transform = 'translate(-50%, -50%)';
}

// Save high score to localStorage
function saveHighScore(name, score) {
    try {
        let highScores = [];
        const savedScores = localStorage.getItem('scriptureRoyaleHighScores');
        
        if (savedScores) {
            highScores = JSON.parse(savedScores);
        }
        
        // Add new score
        highScores.push({ name, score, date: new Date().toISOString() });
        
        // Sort by score (highest first)
        highScores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        highScores = highScores.slice(0, 10);
        
        // Save back to localStorage
        localStorage.setItem('scriptureRoyaleHighScores', JSON.stringify(highScores));
    } catch (e) {
        console.error('Error saving high score:', e);
    }
}

// Resize canvas to fit window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
