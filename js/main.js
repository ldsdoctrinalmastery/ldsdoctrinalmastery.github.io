// Main initialization file

// When the document is loaded
function initializeApp() {
    // Check if Trystero loaded
    if (window.trysteroLoadFailed || !window.trysteroLoaded) {
        console.error('Trystero library failed to load. Multiplayer will not work.');
        console.log('This might be due to:');
        console.log('1. Browser blocking ES modules from CDN');
        console.log('2. Network issues loading the library');
        console.log('3. Browser not supporting modern JavaScript features');
        
        // Disable multiplayer button
        const multiplayerBtn = document.getElementById('multiplayer-btn');
        if (multiplayerBtn) {
            multiplayerBtn.disabled = true;
            multiplayerBtn.textContent = 'Multiplayer (Unavailable)';
            multiplayerBtn.title = 'Multiplayer requires modern browser features. Try Chrome or Firefox.';
        }
    } else {
        console.log('Trystero loaded successfully!');
    }
    
    // Add additional questions to existing scriptures
    addNewQuestions();
    
    initGame();
    
    // Add multiplayer event handlers
    setupMultiplayerUI();
    
    // Add play again button handler
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', function() {
            resetGame();
            const gameOverScreen = document.getElementById('game-over-screen');
            const loginScreen = document.getElementById('login-screen');
            if (gameOverScreen) gameOverScreen.style.display = 'none';
            if (loginScreen) loginScreen.style.display = 'block';
        });
    }
}

// Make initializeApp globally available
window.initializeApp = initializeApp;

// Fallback initialization if script loading takes too long
setTimeout(() => {
    if (!window.trysteroLoaded && !window.trysteroLoadFailed) {
        console.warn('Trystero loading timeout - initializing anyway');
        window.trysteroLoadFailed = true;
        initializeApp();
    }
}, 5000);
