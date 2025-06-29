// Trystero Multiplayer Manager Class
class TrysteroMultiplayerManager {
    constructor() {
        this.room = null;
        this.isHost = false;
        this.roomCode = null;
        this.localPlayerId = null;
        this.connectedPlayers = new Map();
        this.lastPositionUpdate = 0;
        this.positionUpdateInterval = 50; // Send position updates every 50ms
        this.connectionStatus = 'disconnected';
        this.battleAnswers = new Map();
        
        // Trystero action functions (will be set when room is created)
        this.sendPlayerData = null;
        this.sendGameState = null;
        this.sendPlayerMove = null;
        this.sendBattleRequest = null;
        this.sendBattleStart = null;
        this.sendBattleAnswer = null;
        this.sendBattleResult = null;
        this.sendStartGame = null;
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    showConnectionStatus(status, message) {
        this.connectionStatus = status;
        console.log(`Connection status: ${status} - ${message}`);
        
        let statusDiv = document.getElementById('connection-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'connection-status';
            document.body.appendChild(statusDiv);
        }
        
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
        
        switch(status) {
            case 'connecting':
                statusDiv.style.backgroundColor = '#ffa500';
                statusDiv.style.color = 'white';
                break;
            case 'connected':
                statusDiv.style.backgroundColor = '#28a745';
                statusDiv.style.color = 'white';
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 3000);
                break;
            case 'error':
                statusDiv.style.backgroundColor = '#dc3545';
                statusDiv.style.color = 'white';
                break;
            case 'waiting':
                statusDiv.style.backgroundColor = '#17a2b8';
                statusDiv.style.color = 'white';
                break;
        }
    }
    
    createRoom(playerName, playerColor) {
        // Check if Trystero is available
        if (!window.trysteroTorrent || !window.trysteroTorrent.joinRoom) {
            this.showConnectionStatus('error', 'Multiplayer library not loaded.');
            
            // Show detailed help message
            const helpDiv = document.createElement('div');
            helpDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 1001;
                max-width: 400px;
            `;
            helpDiv.innerHTML = `
                <h3>Multiplayer Not Available</h3>
                <p>The P2P library (Trystero) failed to load. This might be because:</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Your browser doesn't support ES modules (use Chrome/Firefox)</li>
                    <li>Network/firewall is blocking unpkg.com CDN</li>
                    <li>Ad blocker is interfering with script loading</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ol style="text-align: left; margin: 10px 0;">
                    <li>Try using Chrome or Firefox browser</li>
                    <li>Disable ad blockers for this page</li>
                    <li>Download the HTML file and run it locally</li>
                    <li>Try accessing from a different network</li>
                </ol>
                <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
            `;
            document.body.appendChild(helpDiv);
            return;
        }
        
        this.isHost = true;
        this.roomCode = this.generateRoomCode();
        this.localPlayerId = 'player-' + Math.random().toString(36).substr(2, 9);
        
        this.showConnectionStatus('connecting', 'Creating room...');
        
        // Create Trystero room with room code as namespace
        try {
            // Use torrent strategy for completely serverless operation
            const config = {
                appId: 'scripture-battle-royale',
                rtcConfig: {
                    iceServers: [
                        // Existing STUN servers (Trystero adds these automatically but we'll be explicit)
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun.cloudflare.com:3478' },
                        // Free TURN servers
                        {
                            urls: 'turn:openrelay.metered.ca:80',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        },
                        {
                            urls: 'turn:openrelay.metered.ca:443',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        },
                        {
                            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        }
                    ]
                }
            };
            
            this.room = window.trysteroTorrent.joinRoom(config, this.roomCode);
            
            // Set up action functions
            const [sendPlayerData, getPlayerData] = this.room.makeAction('playerData');
            const [sendGameState, getGameState] = this.room.makeAction('gameState');
            const [sendPlayerMove, getPlayerMove] = this.room.makeAction('playerMove');
            const [sendBattleRequest, getBattleRequest] = this.room.makeAction('battleReq');
            const [sendBattleStart, getBattleStart] = this.room.makeAction('battleStart');
            const [sendBattleAnswer, getBattleAnswer] = this.room.makeAction('battleAnswer');
            const [sendBattleResult, getBattleResult] = this.room.makeAction('battleResult');
            const [sendStartGame, getStartGame] = this.room.makeAction('startGame');
            
            // Store send functions
            this.sendPlayerData = sendPlayerData;
            this.sendGameState = sendGameState;
            this.sendPlayerMove = sendPlayerMove;
            this.sendBattleRequest = sendBattleRequest;
            this.sendBattleStart = sendBattleStart;
            this.sendBattleAnswer = sendBattleAnswer;
            this.sendBattleResult = sendBattleResult;
            this.sendStartGame = sendStartGame;
            
            // Handle incoming connections
            this.room.onPeerJoin(peerId => {
                console.log('Peer joined:', peerId);
                this.showConnectionStatus('connected', 'Player joined!');
                
                // Send current players list to new peer
                const currentPlayers = Array.from(this.connectedPlayers.entries()).map(([id, player]) => ({
                    id: id,
                    ...player
                }));
                
                // Add host info
                currentPlayers.push({
                    id: this.localPlayerId,
                    name: playerName,
                    color: playerColor,
                    isHost: true,
                    ready: false
                });
                
                this.sendPlayerData({
                    type: 'currentPlayers',
                    players: currentPlayers
                }, peerId);
            });
            
            this.room.onPeerLeave(peerId => {
                console.log('Peer left:', peerId);
                this.handlePeerDisconnect(peerId);
            });
            
            // Set up action handlers
            getPlayerData((data, peerId) => this.handlePlayerData(data, peerId));
            getPlayerMove((data, peerId) => this.handlePlayerMove(data, peerId));
            getBattleRequest((data, peerId) => this.handleBattleRequest(data, peerId));
            getBattleAnswer((data, peerId) => this.handleBattleAnswer(data, peerId));
            
            // Add self to connected players
            this.connectedPlayers.set(this.localPlayerId, {
                name: playerName,
                color: playerColor,
                isHost: true,
                ready: false
            });
            
            this.showConnectionStatus('waiting', 'Room created! Waiting for players...');
            
            document.getElementById('room-code-display').textContent = this.roomCode;
            document.getElementById('room-code-section').style.display = 'block';
            document.getElementById('connected-players').style.display = 'block';
            
            this.updatePlayerList();
            
        } catch (error) {
            console.error('Error creating room:', error);
            this.showConnectionStatus('error', 'Failed to create room. Try again.');
        }
    }
    
    joinRoom(roomCode, playerName, playerColor) {
        // Check if Trystero is available
        if (!window.trysteroTorrent || !window.trysteroTorrent.joinRoom) {
            this.showConnectionStatus('error', 'Multiplayer library not loaded.');
            
            // Show same detailed help message
            const helpDiv = document.createElement('div');
            helpDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 1001;
                max-width: 400px;
            `;
            helpDiv.innerHTML = `
                <h3>Multiplayer Not Available</h3>
                <p>The P2P library (Trystero) failed to load. This might be because:</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Your browser doesn't support ES modules (use Chrome/Firefox)</li>
                    <li>Network/firewall is blocking unpkg.com CDN</li>
                    <li>Ad blocker is interfering with script loading</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ol style="text-align: left; margin: 10px 0;">
                    <li>Try using Chrome or Firefox browser</li>
                    <li>Disable ad blockers for this page</li>
                    <li>Download the HTML file and run it locally</li>
                    <li>Try accessing from a different network</li>
                </ol>
                <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
            `;
            document.body.appendChild(helpDiv);
            return;
        }
        
        this.roomCode = roomCode.toUpperCase();
        this.localPlayerId = 'player-' + Math.random().toString(36).substr(2, 9);
        
        this.showConnectionStatus('connecting', 'Joining room...');
        
        try {
            const config = {
                appId: 'scripture-battle-royale',
                rtcConfig: {
                    iceServers: [
                        // Existing STUN servers (Trystero adds these automatically but we'll be explicit)
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun.cloudflare.com:3478' },
                        // Free TURN servers
                        {
                            urls: 'turn:openrelay.metered.ca:80',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        },
                        {
                            urls: 'turn:openrelay.metered.ca:443',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        },
                        {
                            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                            username: 'openrelayproject',
                            credential: 'openrelayproject'
                        }
                    ]
                }
            };
            
            this.room = window.trysteroTorrent.joinRoom(config, this.roomCode);
            
            // Set up action functions
            const [sendPlayerData, getPlayerData] = this.room.makeAction('playerData');
            const [sendGameState, getGameState] = this.room.makeAction('gameState');
            const [sendPlayerMove, getPlayerMove] = this.room.makeAction('playerMove');
            const [sendBattleRequest, getBattleRequest] = this.room.makeAction('battleReq');
            const [sendBattleStart, getBattleStart] = this.room.makeAction('battleStart');
            const [sendBattleAnswer, getBattleAnswer] = this.room.makeAction('battleAnswer');
            const [sendBattleResult, getBattleResult] = this.room.makeAction('battleResult');
            const [sendStartGame, getStartGame] = this.room.makeAction('startGame');
            
            // Store send functions
            this.sendPlayerData = sendPlayerData;
            this.sendGameState = sendGameState;
            this.sendPlayerMove = sendPlayerMove;
            this.sendBattleRequest = sendBattleRequest;
            this.sendBattleStart = sendBattleStart;
            this.sendBattleAnswer = sendBattleAnswer;
            this.sendBattleResult = sendBattleResult;
            this.sendStartGame = sendStartGame;
            
            // Set up handlers
            this.room.onPeerJoin(peerId => {
                console.log('Connected to room, found peer:', peerId);
                this.showConnectionStatus('connected', 'Connected to room!');
                
                // Send join message
                this.sendPlayerData({
                    type: 'join',
                    playerName: playerName,
                    playerColor: playerColor,
                    playerId: this.localPlayerId
                });
                
                document.getElementById('connected-players').style.display = 'block';
                document.getElementById('join-room-section').style.display = 'none';
            });
            
            this.room.onPeerLeave(peerId => {
                console.log('Peer left:', peerId);
                this.handlePeerDisconnect(peerId);
            });
            
            // Set up action handlers
            getPlayerData((data, peerId) => this.handlePlayerData(data, peerId));
            getGameState((data, peerId) => this.handleGameState(data, peerId));
            getPlayerMove((data, peerId) => this.handlePlayerMove(data, peerId));
            getBattleStart((data, peerId) => this.handleBattleStart(data, peerId));
            getBattleResult((data, peerId) => this.handleBattleResult(data, peerId));
            getStartGame((data, peerId) => this.handleStartGame(data, peerId));
            
            // Add self to connected players
            this.connectedPlayers.set(this.localPlayerId, {
                name: playerName,
                color: playerColor,
                isHost: false,
                ready: false
            });
            
            // Timeout if no peers found
            setTimeout(() => {
                if (this.connectionStatus === 'connecting') {
                    this.showConnectionStatus('error', 'No room found with that code. Check the code and try again.');
                    this.handleDisconnect();
                }
            }, 10000);
            
        } catch (error) {
            console.error('Error joining room:', error);
            this.showConnectionStatus('error', 'Failed to join room. Try again.');
        }
    }
    
    handlePlayerData(data, peerId) {
        console.log('Received player data:', data, 'from:', peerId);
        
        switch (data.type) {
            case 'join':
                // New player joined
                this.connectedPlayers.set(data.playerId, {
                    name: data.playerName,
                    color: data.playerColor,
                    isHost: false,
                    ready: false,
                    peerId: peerId
                });
                
                // Broadcast to all other players
                this.sendPlayerData({
                    type: 'playerJoined',
                    playerId: data.playerId,
                    playerName: data.playerName,
                    playerColor: data.playerColor
                });
                
                this.updatePlayerList();
                break;
                
            case 'currentPlayers':
                // Received list of current players from host
                this.connectedPlayers.clear();
                data.players.forEach(player => {
                    this.connectedPlayers.set(player.id, {
                        name: player.name,
                        color: player.color,
                        isHost: player.isHost,
                        ready: player.ready
                    });
                });
                this.updatePlayerList();
                break;
                
            case 'playerJoined':
                // Another player joined
                if (!this.connectedPlayers.has(data.playerId)) {
                    this.connectedPlayers.set(data.playerId, {
                        name: data.playerName,
                        color: data.playerColor,
                        isHost: false,
                        ready: false
                    });
                    this.updatePlayerList();
                }
                break;
        }
    }
    
    handleGameState(data, peerId) {
        // Sync game state from host
        if (data.players) {
            data.players.forEach(playerData => {
                if (playerData.id !== gameState.localPlayer.id) {
                    gameState.players.set(playerData.id, playerData);
                }
            });
        }
    }
    
    handlePlayerMove(data, peerId) {
        // Update player position
        if (gameState.players.has(data.playerId)) {
            const player = gameState.players.get(data.playerId);
            player.x = data.x;
            player.y = data.y;
        }
    }
    
    handleBattleRequest(data, peerId) {
        if (!this.isHost) return;
        
        // Verify both players exist and are close enough
        const player1 = gameState.players.get(data.player1Id);
        const player2 = gameState.players.get(data.player2Id);
        
        if (!player1 || !player2) return;
        
        // Check if either player is already in battle
        if (player1.inBattle || player2.inBattle) return;
        
        // Mark players as in battle
        player1.inBattle = true;
        player2.inBattle = true;
        
        // Select a question
        const questionData = selectBattleQuestion();
        
        // Send battle start to all players
        this.sendBattleStart({
            player1Id: data.player1Id,
            player2Id: data.player2Id,
            question: questionData.question,
            scripture: questionData.scripture,
            questionId: questionData.questionId,
            battleId: Date.now().toString()
        });
    }
    
    handleBattleStart(data, peerId) {
        // Start battle if we're involved
        if (data.player1Id === gameState.localPlayer.id || data.player2Id === gameState.localPlayer.id) {
            startMultiplayerBattle(data);
        }
    }
    
    handleBattleAnswer(data, peerId) {
        if (!this.isHost) return;
        
        // Store answer and check if both players have answered
        const battleKey = data.battleId;
        if (!this.battleAnswers.has(battleKey)) {
            this.battleAnswers.set(battleKey, {});
        }
        
        const battle = this.battleAnswers.get(battleKey);
        battle[data.playerId] = {
            answer: data.answer,
            correct: data.correct,
            timestamp: Date.now()
        };
        
        // Check if both players have answered
        if (Object.keys(battle).length === 2) {
            // Determine winner
            const players = Object.keys(battle);
            const player1Result = battle[players[0]];
            const player2Result = battle[players[1]];
            
            let winnerId = null;
            if (player1Result.correct && !player2Result.correct) {
                winnerId = players[0];
            } else if (!player1Result.correct && player2Result.correct) {
                winnerId = players[1];
            } else if (player1Result.correct && player2Result.correct) {
                // Both correct, faster wins
                winnerId = player1Result.timestamp < player2Result.timestamp ? players[0] : players[1];
            }
            
            // Send result to all players
            this.sendBattleResult({
                battleId: battleKey,
                player1Id: players[0],
                player2Id: players[1],
                winnerId: winnerId,
                player1Correct: player1Result.correct,
                player2Correct: player2Result.correct
            });
            
            // Clean up
            this.battleAnswers.delete(battleKey);
        }
    }
    
    handleBattleResult(data, peerId) {
        processBattleResultMultiplayer(data);
    }
    
    handleStartGame(data, peerId) {
        if (!this.isHost) {
            startMultiplayerGame(data.gameSettings);
        }
    }
    
    handlePeerDisconnect(peerId) {
        // Find and remove disconnected player
        let disconnectedPlayerId = null;
        for (const [playerId, player] of this.connectedPlayers.entries()) {
            if (player.peerId === peerId) {
                disconnectedPlayerId = playerId;
                break;
            }
        }
        
        if (disconnectedPlayerId) {
            this.connectedPlayers.delete(disconnectedPlayerId);
            if (gameState.players.has(disconnectedPlayerId)) {
                gameState.players.delete(disconnectedPlayerId);
            }
            this.updatePlayerList();
            
            // Notify others if host
            if (this.isHost) {
                this.sendPlayerData({
                    type: 'playerDisconnected',
                    playerId: disconnectedPlayerId
                });
            }
        }
    }
    
    sendPlayerPosition(player) {
        if (!this.room || !this.sendPlayerMove) return;
        
        const now = Date.now();
        if (now - this.lastPositionUpdate < this.positionUpdateInterval) return;
        
        this.lastPositionUpdate = now;
        
        this.sendPlayerMove({
            playerId: player.id,
            x: player.x,
            y: player.y
        });
    }
    
    updatePlayerList() {
        const playerList = document.getElementById('player-list');
        playerList.innerHTML = '';
        
        this.connectedPlayers.forEach((player, id) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${player.name}</span>
                ${player.isHost ? '<span class="host-badge">HOST</span>' : ''}
            `;
            if (player.ready) li.classList.add('player-ready');
            playerList.appendChild(li);
        });
    }
    
    startGame(gameSettings) {
        if (this.isHost && this.sendStartGame) {
            // Broadcast game start to all players
            this.sendStartGame({
                gameSettings: gameSettings
            });
        }
    }
    
    requestBattle(player1Id, player2Id) {
        if (this.sendBattleRequest) {
            this.sendBattleRequest({
                player1Id: player1Id,
                player2Id: player2Id
            });
        }
    }
    
    submitAnswer(battleId, playerId, answer, correct) {
        if (this.sendBattleAnswer) {
            this.sendBattleAnswer({
                battleId: battleId,
                playerId: playerId,
                answer: answer,
                correct: correct
            });
        }
    }
    
    handleDisconnect() {
        // Clean up and return to login
        if (this.room) {
            this.room.leave();
            this.room = null;
        }
        
        this.connectedPlayers.clear();
        
        // Reset UI
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('multiplayer-options').style.display = 'none';
        document.getElementById('connected-players').style.display = 'none';
        document.getElementById('room-code-section').style.display = 'none';
        document.getElementById('join-room-section').style.display = 'none';
        
        // Reset game state
        resetGame();
    }
}

// Initialize multiplayer manager
const multiplayer = new TrysteroMultiplayerManager();
