// Battle-related functions

// Select battle question for multiplayer
function selectBattleQuestion() {
    // Get all available questions (first 12 scriptures)
    let allQuestions = [];
    
    for (let i = 0; i < 12; i++) {
        const scripture = doctrinalMasteryScriptures[i];
        
        scripture.questions.forEach((question, qIndex) => {
            const questionId = `${scripture.id}-${qIndex}`;
            
            if (!gameState.answeredQuestions.correct.has(questionId)) {
                allQuestions.push({
                    question,
                    scripture,
                    questionId
                });
            }
        });
    }
    
    // If all questions have been answered correctly, reset the pool
    if (allQuestions.length === 0) {
        gameState.answeredQuestions.correct = new Set();
        
        for (let i = 0; i < 12; i++) {
            const scripture = doctrinalMasteryScriptures[i];
            
            scripture.questions.forEach((question, qIndex) => {
                allQuestions.push({
                    question,
                    scripture,
                    questionId: `${scripture.id}-${qIndex}`
                });
            });
        }
    }
    
    // Choose a random question
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    return allQuestions[randomIndex];
}

// Start multiplayer battle
function startMultiplayerBattle(data) {
    gameState.inBattle = true;
    gameState.currentOpponent = data.player1Id === gameState.localPlayer.id ? data.player2Id : data.player1Id;
    gameState.currentBattleId = data.battleId;
    
    const player1 = gameState.players.get(data.player1Id);
    const player2 = gameState.players.get(data.player2Id);
    
    if (!player1 || !player2) return;
    
    // Set up battle UI
    setupBattleUI(player1, player2, data.question, data.scripture);
    
    // Show battle screen
    battleScreen.style.display = 'flex';
}

// Process multiplayer battle result
function processBattleResultMultiplayer(data) {
    const player1 = gameState.players.get(data.player1Id);
    const player2 = gameState.players.get(data.player2Id);
    
    if (!player1 || !player2) return;
    
    // Update points based on winner
    if (data.winnerId) {
        const winner = data.winnerId === data.player1Id ? player1 : player2;
        const loser = data.winnerId === data.player1Id ? player2 : player1;
        
        // Transfer points
        winner.points += loser.points;
        loser.points = 1;
        loser.isDead = true;
        loser.respawnTime = CONFIG.respawnTime;
        
        // Update local stats if involved
        if (data.winnerId === gameState.localPlayer.id) {
            gameState.stats.battlesWon++;
        } else if (gameState.localPlayer.id === data.player1Id || gameState.localPlayer.id === data.player2Id) {
            gameState.stats.battlesLost++;
        }
    }
    
    // Clear battle flags
    player1.inBattle = false;
    player2.inBattle = false;
    
    // Show results if local player was involved
    if (gameState.localPlayer.id === data.player1Id || gameState.localPlayer.id === data.player2Id) {
        const wonBattle = data.winnerId === gameState.localPlayer.id;
        const correctAnswer = gameState.localPlayer.id === data.player1Id ? data.player1Correct : data.player2Correct;
        
        let resultMessage = '';
        if (wonBattle) {
            resultMessage = 'You won! ';
            resultMessage += correctAnswer ? 'You answered correctly.' : 'Your opponent answered incorrectly.';
        } else if (data.winnerId === null) {
            resultMessage = 'Draw! Both players answered incorrectly.';
        } else {
            resultMessage = 'You lost! ';
            resultMessage += correctAnswer ? 'Your opponent was faster.' : 'Your answer was incorrect.';
        }
        
        resultMessageElem.textContent = resultMessage;
        battlePhase1.classList.add('hidden');
        battlePhase2.classList.remove('hidden');
        
        // Update UI
        playerPointsDisplay.textContent = gameState.localPlayer.points;
        updateLeaderboard();
    }
}

// Check for multiplayer battles
function checkForMultiplayerBattles() {
    if (gameState.inBattle || gameState.localPlayer.inBattle) return;
    
    for (const [id, player] of gameState.players.entries()) {
        // Skip self, dead players, or players in battle
        if (id === gameState.localPlayer.id ||
            player.isDead ||
            gameState.localPlayer.isDead ||
            player.inBattle ||
            (gameState.battleCooldowns.has(id) &&
             Date.now() - gameState.battleCooldowns.get(id) < CONFIG.battleCooldown)) {
            continue;
        }
        
        // Calculate distance
        const dx = player.x - gameState.localPlayer.x;
        const dy = player.y - gameState.localPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= CONFIG.battleRadius) {
            // Request battle
            multiplayer.requestBattle(gameState.localPlayer.id, id);
            
            // Set cooldown immediately to prevent multiple requests
            gameState.battleCooldowns.set(id, Date.now());
            break;
        }
    }
}

// Check for potential battles with nearby players
function checkForBattles() {
    if (gameState.inBattle) return;
    
    for (const [id, player] of gameState.players.entries()) {
        // Skip self, dead players, and players on cooldown
        if (id === 'player' ||
            player.isDead ||
            gameState.localPlayer.isDead ||
            (gameState.battleCooldowns.has(id) &&
             Date.now() - gameState.battleCooldowns.get(id) < CONFIG.battleCooldown)) {
            continue;
        }
        
        // Calculate distance
        const dx = player.x - gameState.localPlayer.x;
        const dy = player.y - gameState.localPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= CONFIG.battleRadius) {
            // Initiate battle
            startBattle(id);
            break;
        }
    }
}

// Start a battle with another player
function startBattle(opponentId) {
    gameState.inBattle = true;
    gameState.currentOpponent = opponentId;
    
    // Get opponent data
    const opponent = gameState.players.get(opponentId);
    
    // Get all available questions (first 12 scriptures)
    let allQuestions = [];
    
    for (let i = 0; i < 12; i++) {
        const scripture = doctrinalMasteryScriptures[i];
        
        scripture.questions.forEach((question, qIndex) => {
            // Create a unique ID for each question
            const questionId = `${scripture.id}-${qIndex}`;
            
            // Only add questions that:
            // 1. Haven't been answered correctly, OR
            // 2. Have been answered incorrectly (these can repeat)
            if (!gameState.answeredQuestions.correct.has(questionId)) {
                allQuestions.push({
                    question,
                    scripture,
                    questionId
                });
            }
        });
    }
    
    // If all questions have been answered correctly, reset the pool
    if (allQuestions.length === 0) {
        gameState.answeredQuestions.correct = new Set();
        
        // Rebuild the question pool
        for (let i = 0; i < 12; i++) {
            const scripture = doctrinalMasteryScriptures[i];
            
            scripture.questions.forEach((question, qIndex) => {
                allQuestions.push({
                    question,
                    scripture,
                    questionId: `${scripture.id}-${qIndex}`
                });
            });
        }
    }
    
    // Choose a random question from the pool
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    const { question, scripture, questionId } = allQuestions[randomIndex];
    
    // Store the current question ID for tracking
    gameState.currentQuestionId = questionId;
    
    // Set up battle UI
    setupBattleUI(gameState.localPlayer, opponent, question, scripture);
    
    // Show battle screen
    battleScreen.style.display = 'flex';
}

// Set up the battle UI
function setupBattleUI(player1, player2, question, scripture) {
    // Display player names and points
    player1NameElem.textContent = player1.name;
    player2NameElem.textContent = player2.name;
    player1PointsElem.textContent = player1.points;
    player2PointsElem.textContent = player2.points;
    
    // Display question
    questionTextElem.textContent = question.question;
    
    // Determine if we should show the scripture reference
    // Hide for reference questions, show for content and doctrine questions
    if (question.type === 'reference') {
        scriptureReferenceElem.classList.add('hidden');
    } else {
        scriptureReferenceElem.classList.remove('hidden');
        scriptureReferenceElem.textContent = scripture.reference;
    }
    
    // Generate answer buttons
    answersContainerElem.innerHTML = '';
    question.answers.forEach((answer, index) => {
        const answerBtn = document.createElement('button');
        answerBtn.className = 'answer-btn';
        answerBtn.textContent = answer;
        answerBtn.dataset.index = index;
        answerBtn.addEventListener('click', function() {
            handleAnswerSelection(parseInt(this.dataset.index), question.correctAnswer);
        });
        answersContainerElem.appendChild(answerBtn);
    });
    
    // Reset battle phases
    battlePhase1.classList.remove('hidden');
    battlePhase2.classList.add('hidden');
    
    // Start timer
    startBattleTimer();
}

// Start the battle timer
let battleTimerInterval;
function startBattleTimer() {
    let timeLeft = CONFIG.questionTime;
    battleTimerElem.textContent = timeLeft;
    
    clearInterval(battleTimerInterval);
    battleTimerInterval = setInterval(() => {
        timeLeft--;
        battleTimerElem.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(battleTimerInterval);
            // Time's up, count as incorrect
            handleAnswerSelection(-1, 0);
        }
    }, 1000);
}

// Handle answer selection
function handleAnswerSelection(selectedIndex, correctIndex) {
    clearInterval(battleTimerInterval);
    
    // Disable all buttons
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Highlight correct and selected answers
    answerButtons.forEach((btn, index) => {
        if (index === correctIndex) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== correctIndex) {
            btn.classList.add('incorrect');
        }
    });
    
    // Determine if the answer was correct
    const isCorrect = selectedIndex === correctIndex;
    
    // In multiplayer, send answer to host
    if (gameState.isMultiplayer) {
        multiplayer.submitAnswer(gameState.currentBattleId, gameState.localPlayer.id, selectedIndex, isCorrect);
    } else {
        // Single player - process results after delay
        setTimeout(() => {
            processBattleResults(isCorrect);
        }, 2000);
    }
}

// Process battle results (single player)
function processBattleResults(playerCorrect) {
    const opponent = gameState.players.get(gameState.currentOpponent);
    let resultMessage = '';
    
    // Track if this question was answered correctly or incorrectly
    if (playerCorrect) {
        gameState.answeredQuestions.correct.add(gameState.currentQuestionId);
        // Remove from incorrect set if it was there
        gameState.answeredQuestions.incorrect.delete(gameState.currentQuestionId);
    } else {
        gameState.answeredQuestions.incorrect.add(gameState.currentQuestionId);
    }
    
    // Player correct - always wins
    if (playerCorrect) {
        resultMessage = 'You won! You answered correctly.';
        // Get all points from opponent
        gameState.localPlayer.points += opponent.points;
        
        // Update stats
        gameState.stats.battlesWon++;
        
        // Instead of marking as dead, immediately move to new location
        // Move opponent to a new location
        const newX = 100 + Math.random() * (CONFIG.worldWidth - 200);
        const newY = 100 + Math.random() * (CONFIG.worldHeight - 200);
        opponent.x = newX;
        opponent.y = newY;
        
        // Opponent respawns with 10 points
        opponent.points = CONFIG.initialPoints;
    }
    // Player incorrect - always loses half points
    else {
        resultMessage = 'You lost! Your answer was incorrect.';
        // Lose half points (rounded down) but keep at least 1
        const pointsToLose = Math.floor(gameState.localPlayer.points / 2);
        opponent.points += pointsToLose;
        gameState.localPlayer.points -= pointsToLose;
        if (gameState.localPlayer.points < 1) gameState.localPlayer.points = 1;
        
        gameState.localPlayer.isDead = true;
        gameState.localPlayer.respawnTime = CONFIG.respawnTime;
        
        // Update stats
        gameState.stats.battlesLost++;
    }
    
    // Update UI
    resultMessageElem.textContent = resultMessage;
    battlePhase1.classList.add('hidden');
    battlePhase2.classList.remove('hidden');
    
    // Update player stats
    playerPointsDisplay.textContent = gameState.localPlayer.points;
    
    // Set cooldown for this opponent
    gameState.battleCooldowns.set(gameState.currentOpponent, Date.now());
    
    // Update leaderboard
    updateLeaderboard();
}
