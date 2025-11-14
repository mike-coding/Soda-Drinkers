// Socket connection
const socket = io();

// Game state
let currentUser = {
    username: '',
    sodaCount: 0
};

let players = new Map();

// DOM elements
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const currentUserDisplay = document.querySelector('#current-user strong');
const userSodaCountDisplay = document.querySelector('#user-soda-count strong');
const sodaButtons = document.querySelectorAll('.soda-btn');
const chatButtons = document.querySelectorAll('.chat-btn');
const playersCircle = document.getElementById('players-circle');

// Player avatar emojis
const avatars = ['😀', '😎', '🤓', '😊', '🥳', '🤠', '😺', '🐶', '🐱', '🐼', '🦊', '🐸'];

function getRandomAvatar() {
    return avatars[Math.floor(Math.random() * avatars.length)];
}

// Join game
joinBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    
    if (username.length === 0) {
        alert('Please enter a username!');
        return;
    }
    
    currentUser.username = username;
    currentUser.avatar = getRandomAvatar();
    socket.emit('join', username);
    
    // Switch to game screen
    mainMenu.classList.remove('active');
    gameScreen.classList.add('active');
    
    currentUserDisplay.textContent = username;
});

// Enter key to join
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinBtn.click();
    }
});

// Soda drinking
sodaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const sodaType = btn.dataset.soda;
        socket.emit('drink-soda', sodaType);
        
        btn.classList.add('drinking');
        setTimeout(() => btn.classList.remove('drinking'), 300);
    });
});

// Chat functionality
chatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const message = btn.dataset.message;
        socket.emit('chat-message', message);
        
        btn.classList.add('sent');
        setTimeout(() => btn.classList.remove('sent'), 200);
    });
});

// Socket event handlers

// Receive initial players list
socket.on('players-update', (playersList) => {
    playersList.forEach(player => {
        if (player.id !== socket.id) {
            player.avatar = getRandomAvatar();
            players.set(player.id, player);
        }
    });
    updatePlayersCircle();
});

// New player joined
socket.on('player-joined', (player) => {
    if (player.id !== socket.id) {
        player.avatar = getRandomAvatar();
        players.set(player.id, player);
        updatePlayersCircle();
    }
});

// Player left
socket.on('player-left', (playerId) => {
    players.delete(playerId);
    updatePlayersCircle();
});

// Someone drank a soda
socket.on('soda-drunk', (data) => {
    if (data.playerId === socket.id) {
        // Update own soda count
        currentUser.sodaCount = data.newCount;
        userSodaCountDisplay.textContent = data.newCount;
    } else {
        // Update other player's count
        const player = players.get(data.playerId);
        if (player) {
            player.sodaCount = data.newCount;
        }
    }
    updatePlayersCircle();
});

// Chat message received
socket.on('chat-message', (data) => {
    showSpeechBubble(data.username, data.message);
});

// UI update functions

function updatePlayersCircle() {
    playersCircle.innerHTML = '';
    
    const allPlayers = [
        { ...currentUser, id: socket.id, isSelf: true },
        ...Array.from(players.values()).map(p => ({ ...p, isSelf: false }))
    ];
    
    const totalPlayers = allPlayers.length;
    const radius = 200; // Distance from center
    
    allPlayers.forEach((player, index) => {
        const angle = (index / totalPlayers) * 2 * Math.PI - Math.PI / 2; // Start from top
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const playerDiv = createPlayerAvatar(player, x, y);
        playersCircle.appendChild(playerDiv);
    });
}

function createPlayerAvatar(player, x, y) {
    const div = document.createElement('div');
    div.className = 'player-avatar' + (player.isSelf ? ' self' : '');
    div.dataset.playerId = player.id;
    div.dataset.username = player.username;
    
    // Position in circle
    div.style.left = `calc(50% + ${x}px)`;
    div.style.top = `calc(50% + ${y}px)`;
    div.style.transform = 'translate(-50%, -50%)';
    
    div.innerHTML = `
        <div class="player-circle">${player.avatar || getRandomAvatar()}</div>
        <div class="player-name-tag">${player.username}</div>
        <div class="player-soda-count">🥤 ${player.sodaCount || 0}</div>
    `;
    
    return div;
}

function showSpeechBubble(username, message) {
    // Find the player avatar by username
    const playerAvatars = document.querySelectorAll('.player-avatar');
    let targetAvatar = null;
    
    playerAvatars.forEach(avatar => {
        if (avatar.dataset.username === username) {
            targetAvatar = avatar;
        }
    });
    
    if (!targetAvatar) return;
    
    // Remove existing speech bubble if any
    const existingBubble = targetAvatar.querySelector('.speech-bubble');
    if (existingBubble) {
        existingBubble.remove();
    }
    
    // Create new speech bubble
    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.textContent = message;
    
    targetAvatar.appendChild(bubble);
    
    // Remove bubble after 4 seconds
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.remove();
        }
    }, 4000);
}

// Initialize
updatePlayersCircle();
