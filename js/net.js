// js/net.js — Multiplayer transport for Scripture Battle Royale
//
// Loaded as <script type="module">. Replaces the old multiplayer.js + bundled
// trystero-torrent.min.js with a modern Trystero v0.22 setup that:
//
//   • Tries MQTT (school-firewall-friendly WSS:443) first
//   • Falls back to Nostr if MQTT fails to find a peer in 10s
//   • Falls back to BitTorrent if Nostr fails too
//   • Includes Cloudflare TURN as relay-of-last-resort (placeholder creds —
//     drop in real ones from https://www.cloudflare.com/products/realtime-turn/)
//   • Elects a coordinator via bully algorithm (lowest peerId wins)
//   • Caps a room at 24 peers — Chrome RTCPeerConnection limits start biting beyond that
//
// Public surface mirrors the original TrysteroMultiplayerManager so game.js,
// battle.js, and ui.js keep working unchanged. Exposes `window.multiplayer`.
//
// To add real Cloudflare TURN credentials: edit `TURN_OVERRIDE` below or
// create /js/turn-config.js exporting `window.TURN_CONFIG = { ... }`.

const APP_ID = 'scripture-battle-royale-2026';
const MAX_PEERS = 24;
const STRATEGY_TIMEOUT = 10_000; // ms before falling back to next strategy
const STRATEGIES = ['mqtt', 'nostr', 'torrent'];

const TURN_OVERRIDE = window.TURN_CONFIG || null; // optional: { urls, username, credential }

const ICE_SERVERS = [
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.l.google.com:19302' }
];
if (TURN_OVERRIDE) ICE_SERVERS.push(TURN_OVERRIDE);

// ----- Strategy loader (dynamic, from local /js/vendor/) -------------------

const strategyCache = {};
async function loadStrategy(name) {
    if (strategyCache[name]) return strategyCache[name];
    // Bundles built with esbuild from trystero@0.22.0 — see /js/vendor/.
    const mod = await import(`/js/vendor/trystero-${name}.min.js`);
    strategyCache[name] = mod;
    return mod;
}

// ----- Net manager --------------------------------------------------------

class NetManager {
    constructor() {
        this.room = null;
        this.strategy = null;             // name of the strategy in use
        this.isHost = false;
        this.roomCode = null;
        this.localPlayerId = null;
        this.connectedPlayers = new Map();
        this.lastPositionUpdate = 0;
        this.positionUpdateInterval = 50;
        this.connectionStatus = 'disconnected';
        this.battleAnswers = new Map();
        this.coordinatorId = null;
        this._fallbackTimer = null;

        // Trystero action senders (set on room create)
        this.sendPlayerData = null;
        this.sendGameState = null;
        this.sendPlayerMove = null;
        this.sendBattleRequest = null;
        this.sendBattleStart = null;
        this.sendBattleAnswer = null;
        this.sendBattleResult = null;
        this.sendStartGame = null;
        this.sendPing = null;
    }

    // ----- Public API (same shape as old multiplayer.js) ------------------

    async createRoom(playerName, playerColor) {
        this.isHost = true;
        this.roomCode = this._generateRoomCode();
        this.localPlayerId = this._generatePlayerId();
        this._showStatus('connecting', 'Creating room…');
        await this._connect(playerName, playerColor, 0);
    }

    async joinRoom(roomCode, playerName, playerColor) {
        this.isHost = false;
        this.roomCode = (roomCode || '').toUpperCase();
        this.localPlayerId = this._generatePlayerId();
        this._showStatus('connecting', 'Joining room…');
        await this._connect(playerName, playerColor, 0);
    }

    requestBattle(player1Id, player2Id) {
        if (this.sendBattleRequest) {
            this.sendBattleRequest({ player1Id, player2Id });
        }
    }

    submitAnswer(battleId, playerId, answer, correct) {
        if (this.sendBattleAnswer) {
            this.sendBattleAnswer({ battleId, playerId, answer, correct });
        }
    }

    startGame(gameSettings) {
        // Coordinator broadcasts game start to all players
        if (this._isCoordinator() && this.sendStartGame) {
            this.sendStartGame({ gameSettings });
        }
    }

    sendPlayerPosition(player) {
        if (!this.room || !this.sendPlayerMove) return;
        const now = Date.now();
        if (now - this.lastPositionUpdate < this.positionUpdateInterval) return;
        this.lastPositionUpdate = now;
        this.sendPlayerMove({ playerId: player.id, x: player.x, y: player.y });
    }

    // ----- Connection lifecycle -------------------------------------------

    async _connect(playerName, playerColor, strategyIdx) {
        if (strategyIdx >= STRATEGIES.length) {
            this._showStatus('error', 'Could not reach any signaling network. Try a different WiFi or Hotspot.');
            return;
        }
        const strategyName = STRATEGIES[strategyIdx];
        this.strategy = strategyName;

        // Tear down any previous attempt
        if (this.room) {
            try { this.room.leave(); } catch (_) {}
            this.room = null;
        }
        if (this._fallbackTimer) {
            clearTimeout(this._fallbackTimer);
            this._fallbackTimer = null;
        }

        let mod;
        try {
            mod = await loadStrategy(strategyName);
        } catch (err) {
            console.warn(`[net] failed to load Trystero ${strategyName}:`, err);
            return this._connect(playerName, playerColor, strategyIdx + 1);
        }

        const config = { appId: APP_ID, password: this.roomCode, rtcConfig: { iceServers: ICE_SERVERS } };

        try {
            this.room = mod.joinRoom(config, this.roomCode);
        } catch (err) {
            console.warn(`[net] joinRoom failed on ${strategyName}:`, err);
            return this._connect(playerName, playerColor, strategyIdx + 1);
        }

        this._wireActions();
        this._wirePresence(playerName, playerColor);

        // Add self to connected players immediately
        this.connectedPlayers.set(this.localPlayerId, {
            name: playerName, color: playerColor, isHost: this.isHost, ready: false
        });
        this._recomputeCoordinator();

        if (this.isHost) {
            const codeDisp = document.getElementById('room-code-display');
            const codeSec  = document.getElementById('room-code-section');
            const players  = document.getElementById('connected-players');
            if (codeDisp) codeDisp.textContent = this.roomCode;
            if (codeSec)  codeSec.style.display = 'block';
            if (players)  players.style.display = 'block';
            this._showStatus('waiting', `Room ready (${strategyName.toUpperCase()}). Waiting for players…`);
        } else {
            this._showStatus('waiting', `Searching for room (${strategyName.toUpperCase()})…`);
        }
        this._updatePlayerList();

        // If alone after the timeout, fall back to the next strategy
        this._fallbackTimer = setTimeout(() => {
            const peerCount = this.connectedPlayers.size - 1;
            if (peerCount > 0) return; // we found someone — stay
            console.log(`[net] ${strategyName} found nobody in ${STRATEGY_TIMEOUT}ms, falling back…`);
            this._connect(playerName, playerColor, strategyIdx + 1);
        }, STRATEGY_TIMEOUT);
    }

    _wireActions() {
        const r = this.room;
        const [sendPlayerData,    getPlayerData]    = r.makeAction('playerData');
        const [sendGameState,     getGameState]     = r.makeAction('gameState');
        const [sendPlayerMove,    getPlayerMove]    = r.makeAction('playerMove');
        const [sendBattleRequest, getBattleRequest] = r.makeAction('battleReq');
        const [sendBattleStart,   getBattleStart]   = r.makeAction('battleStart');
        const [sendBattleAnswer,  getBattleAnswer]  = r.makeAction('battleAnswer');
        const [sendBattleResult,  getBattleResult]  = r.makeAction('battleResult');
        const [sendStartGame,     getStartGame]     = r.makeAction('startGame');
        const [sendPing,          getPing]          = r.makeAction('ping');

        this.sendPlayerData = sendPlayerData;
        this.sendGameState = sendGameState;
        this.sendPlayerMove = sendPlayerMove;
        this.sendBattleRequest = sendBattleRequest;
        this.sendBattleStart = sendBattleStart;
        this.sendBattleAnswer = sendBattleAnswer;
        this.sendBattleResult = sendBattleResult;
        this.sendStartGame = sendStartGame;
        this.sendPing = sendPing;

        getPlayerData((data, peerId)    => this._handlePlayerData(data, peerId));
        getGameState((data, peerId)     => this._handleGameState(data, peerId));
        getPlayerMove((data, peerId)    => this._handlePlayerMove(data, peerId));
        getBattleRequest((data, peerId) => this._handleBattleRequest(data, peerId));
        getBattleStart((data, peerId)   => this._handleBattleStart(data, peerId));
        getBattleAnswer((data, peerId)  => this._handleBattleAnswer(data, peerId));
        getBattleResult((data, peerId)  => this._handleBattleResult(data, peerId));
        getStartGame((data, peerId)     => this._handleStartGame(data, peerId));
        getPing((_, peerId) => {/* presence keepalive */});
    }

    _wirePresence(playerName, playerColor) {
        this.room.onPeerJoin(peerId => {
            console.log('[net] peer joined:', peerId);

            // Cap room size — host rejects new joins past MAX_PEERS
            if (this.connectedPlayers.size >= MAX_PEERS) {
                console.warn(`[net] room full (${MAX_PEERS}); ignoring ${peerId}`);
                return;
            }

            // Send our identity to the new peer; they'll reply with theirs
            this.sendPlayerData({
                type: 'hello',
                playerId: this.localPlayerId,
                name: playerName,
                color: playerColor,
                isHost: this.isHost
            }, peerId);

            // If we're already a known coordinator, broadcast the full roster
            if (this._isCoordinator()) {
                const roster = Array.from(this.connectedPlayers.entries()).map(([id, p]) => ({
                    id, name: p.name, color: p.color, isHost: p.isHost, ready: p.ready
                }));
                this.sendPlayerData({ type: 'roster', players: roster }, peerId);
            }
            this._showStatus('connected', `${this.connectedPlayers.size} player${this.connectedPlayers.size === 1 ? '' : 's'} in room`);
        });

        this.room.onPeerLeave(peerId => {
            console.log('[net] peer left:', peerId);
            this._handlePeerDisconnect(peerId);
        });
    }

    // ----- Action handlers -------------------------------------------------

    _handlePlayerData(data, peerId) {
        switch (data.type) {
            case 'hello':
                this.connectedPlayers.set(data.playerId, {
                    name: data.name, color: data.color, isHost: !!data.isHost,
                    ready: false, peerId
                });
                this._recomputeCoordinator();
                this._updatePlayerList();
                break;
            case 'roster':
                this.connectedPlayers.clear();
                data.players.forEach(p => {
                    this.connectedPlayers.set(p.id, {
                        name: p.name, color: p.color, isHost: !!p.isHost, ready: !!p.ready
                    });
                });
                this._recomputeCoordinator();
                this._updatePlayerList();
                break;
            case 'playerDisconnected':
                this.connectedPlayers.delete(data.playerId);
                if (typeof gameState !== 'undefined' && gameState.players && gameState.players.has(data.playerId)) {
                    gameState.players.delete(data.playerId);
                }
                this._recomputeCoordinator();
                this._updatePlayerList();
                break;
        }
    }

    _handleGameState(data) {
        if (typeof gameState === 'undefined' || !gameState.localPlayer) return;
        if (data.players) {
            data.players.forEach(p => {
                if (p.id !== gameState.localPlayer.id) gameState.players.set(p.id, p);
            });
        }
    }

    _handlePlayerMove(data) {
        if (typeof gameState === 'undefined' || !gameState.players) return;
        if (gameState.players.has(data.playerId)) {
            const p = gameState.players.get(data.playerId);
            p.x = data.x;
            p.y = data.y;
        }
    }

    _handleBattleRequest(data) {
        if (!this._isCoordinator()) return;
        if (typeof gameState === 'undefined') return;
        const p1 = gameState.players.get(data.player1Id);
        const p2 = gameState.players.get(data.player2Id);
        if (!p1 || !p2 || p1.inBattle || p2.inBattle) return;
        p1.inBattle = true; p2.inBattle = true;
        const q = (typeof selectBattleQuestion === 'function') ? selectBattleQuestion() : null;
        if (!q) return;
        this.sendBattleStart({
            player1Id: data.player1Id,
            player2Id: data.player2Id,
            question: q.question,
            scripture: q.scripture,
            questionId: q.questionId,
            battleId: Date.now().toString()
        });
    }

    _handleBattleStart(data) {
        if (typeof gameState === 'undefined' || !gameState.localPlayer) return;
        if (data.player1Id === gameState.localPlayer.id || data.player2Id === gameState.localPlayer.id) {
            if (typeof startMultiplayerBattle === 'function') startMultiplayerBattle(data);
        }
    }

    _handleBattleAnswer(data) {
        if (!this._isCoordinator()) return;
        const key = data.battleId;
        if (!this.battleAnswers.has(key)) this.battleAnswers.set(key, {});
        const battle = this.battleAnswers.get(key);
        battle[data.playerId] = { answer: data.answer, correct: data.correct, timestamp: Date.now() };
        if (Object.keys(battle).length === 2) {
            const ids = Object.keys(battle);
            const r1 = battle[ids[0]], r2 = battle[ids[1]];
            let winnerId = null;
            if (r1.correct && !r2.correct) winnerId = ids[0];
            else if (!r1.correct && r2.correct) winnerId = ids[1];
            else if (r1.correct && r2.correct) winnerId = r1.timestamp < r2.timestamp ? ids[0] : ids[1];
            this.sendBattleResult({
                battleId: key,
                player1Id: ids[0], player2Id: ids[1],
                winnerId,
                player1Correct: r1.correct, player2Correct: r2.correct
            });
            this.battleAnswers.delete(key);
        }
    }

    _handleBattleResult(data) {
        if (typeof processBattleResultMultiplayer === 'function') processBattleResultMultiplayer(data);
    }

    _handleStartGame(data) {
        if (!this._isCoordinator() && typeof startMultiplayerGame === 'function') {
            startMultiplayerGame(data.gameSettings);
        }
    }

    _handlePeerDisconnect(peerId) {
        let droppedId = null;
        for (const [id, p] of this.connectedPlayers.entries()) {
            if (p.peerId === peerId) { droppedId = id; break; }
        }
        if (!droppedId) return;
        this.connectedPlayers.delete(droppedId);
        if (typeof gameState !== 'undefined' && gameState.players && gameState.players.has(droppedId)) {
            gameState.players.delete(droppedId);
        }
        const wasCoordinator = this.coordinatorId === droppedId;
        this._recomputeCoordinator();
        this._updatePlayerList();
        if (wasCoordinator) {
            console.log('[net] coordinator left; new coordinator is', this.coordinatorId);
        }
        // Broadcast disconnect (others may already have detected)
        if (this._isCoordinator() && this.sendPlayerData) {
            this.sendPlayerData({ type: 'playerDisconnected', playerId: droppedId });
        }
    }

    // ----- Coordinator (bully algorithm: lowest playerId wins) ------------

    _recomputeCoordinator() {
        const ids = Array.from(this.connectedPlayers.keys()).sort();
        this.coordinatorId = ids[0] || null;
        // Keep `isHost` in sync with coordinator role for legacy code that
        // checks `multiplayer.isHost` to gate authoritative work
        this.isHost = this._isCoordinator();
    }

    _isCoordinator() {
        return this.coordinatorId === this.localPlayerId;
    }

    // ----- UI helpers ------------------------------------------------------

    _updatePlayerList() {
        const ul = document.getElementById('player-list');
        if (!ul) return;
        ul.innerHTML = '';
        this.connectedPlayers.forEach((p, id) => {
            const li = document.createElement('li');
            const isCoord = id === this.coordinatorId;
            li.innerHTML = `<span>${this._escape(p.name)}</span>${isCoord ? '<span class="host-badge">HOST</span>' : ''}`;
            if (p.ready) li.classList.add('player-ready');
            ul.appendChild(li);
        });
    }

    _showStatus(state, msg) {
        this.connectionStatus = state;
        let el = document.getElementById('connection-status');
        if (!el) {
            el = document.createElement('div');
            el.id = 'connection-status';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.style.display = 'block';
        const colors = {
            connecting: ['#ffa500', '#fff'],
            connected:  ['#28a745', '#fff'],
            error:      ['#dc3545', '#fff'],
            waiting:    ['#17a2b8', '#fff']
        };
        const [bg, fg] = colors[state] || colors.connecting;
        el.style.backgroundColor = bg;
        el.style.color = fg;
        if (state === 'connected') setTimeout(() => { if (el) el.style.display = 'none'; }, 3000);
    }

    handleDisconnect() {
        if (this._fallbackTimer) clearTimeout(this._fallbackTimer);
        if (this.room) { try { this.room.leave(); } catch (_) {} this.room = null; }
        this.connectedPlayers.clear();
        const ids = ['game-screen', 'login-screen', 'multiplayer-options', 'connected-players', 'room-code-section', 'join-room-section'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.style.display = (id === 'login-screen') ? 'block' : 'none';
        });
        if (typeof resetGame === 'function') resetGame();
    }

    // ----- Utilities -------------------------------------------------------

    _generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'; // skip confusing 0/O/1/I
        let code = '';
        for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    }

    _generatePlayerId() {
        const arr = new Uint8Array(9);
        crypto.getRandomValues(arr);
        return 'p-' + Array.from(arr, b => b.toString(36).padStart(2, '0')).join('').slice(0, 12);
    }

    _escape(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }
}

// ----- Boot ---------------------------------------------------------------

window.multiplayer = new NetManager();
window.trysteroLoaded = true;
window.trysteroLoadFailed = false;

// Pre-warm the primary strategy so the first joinRoom click feels instant
loadStrategy('mqtt').catch(err => console.warn('[net] mqtt prewarm failed:', err));
