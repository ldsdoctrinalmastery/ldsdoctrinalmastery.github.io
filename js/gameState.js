// Game State
const gameState = {
    players: new Map(),
    walls: [],
    localPlayer: null,
    canvas: null,
    ctx: null,
    keys: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false
    },
    touchJoystick: {
        active: false,
        startX: 0,
        startY: 0,
        moveX: 0,
        moveY: 0,
        area: null,
        knob: null
    },
    camera: {
        x: 0,
        y: 0
    },
    lastUpdate: 0,
    inBattle: false,
    currentOpponent: null,
    battleCooldowns: new Map(),
    leaderboard: [],
    aiInterval: null,
    gameTimer: CONFIG.gameTime,
    gameTimerInterval: null,
    gameOver: false,
    answeredQuestions: {
        correct: new Set(),
        incorrect: new Set()
    },
    stats: {
        battlesWon: 0,
        battlesLost: 0
    },
    isMultiplayer: false,
    isHost: false
};
