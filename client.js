// Socket connection
const socket = io();

// Game state
let currentUser = {
    username: '',
    sodaCount: 0,
    buttSize: '',
    avatar: ''
};

let players = new Map();

// DOM elements
const mainMenu = document.getElementById('main-menu');
const characterCreator = document.getElementById('character-creator');
const buttCreator = document.getElementById('butt-creator');
const gameScreen = document.getElementById('game-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const avatarButtons = document.querySelectorAll('.avatar-btn');
const nextToButtBtn = document.getElementById('next-to-butt-btn');
const buttButtons = document.querySelectorAll('.butt-btn');
const createCharacterBtn = document.getElementById('create-character-btn');
const currentUserDisplay = document.querySelector('#current-user strong');
const userSodaCountDisplay = document.querySelector('#user-soda-count strong');
const sodaButtons = document.querySelectorAll('.soda-btn');
const chatButtons = document.querySelectorAll('.chat-btn');
const playersCircle = document.getElementById('players-circle');

// Join game
joinBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    
    if (username.length === 0) {
        alert('Please enter a username!');
        return;
    }
    
    currentUser.username = username;
    
    // Switch to avatar selection
    mainMenu.classList.remove('active');
    characterCreator.classList.add('active');
});

// Avatar selection
avatarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove selected from all buttons
        avatarButtons.forEach(b => b.classList.remove('selected'));
        
        // Add selected to clicked button
        btn.classList.add('selected');
        
        // Store avatar path
        currentUser.avatar = btn.dataset.avatar;
        
        // Enable next button
        nextToButtBtn.disabled = false;
    });
});

// Go to butt size selection
nextToButtBtn.addEventListener('click', () => {
    characterCreator.classList.remove('active');
    buttCreator.classList.add('active');
});

// Butt size selection
buttButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove selected from all buttons
        buttButtons.forEach(b => b.classList.remove('selected'));
        
        // Add selected to clicked button
        btn.classList.add('selected');
        
        // Store butt size
        currentUser.buttSize = btn.dataset.buttSize;
        
        // Enable create character button
        createCharacterBtn.disabled = false;
    });
});

// Create character and enter lobby
createCharacterBtn.addEventListener('click', () => {
    socket.emit('join', {
        username: currentUser.username,
        buttSize: currentUser.buttSize,
        avatar: currentUser.avatar
    });
    
    // Switch to game screen
    buttCreator.classList.remove('active');
    gameScreen.classList.add('active');
    
    currentUserDisplay.textContent = currentUser.username;
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
            players.set(player.id, player);
        }
    });
    updatePlayersCircle();
});

// New player joined
socket.on('player-joined', (player) => {
    if (player.id !== socket.id) {
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
    
    // Show drink animation for the player
    showDrinkAnimation(data.playerId);
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
    
    console.log('Creating avatar for player:', player.id, player.username);
    
    // Position in circle
    div.style.left = `calc(50% + ${x}px)`;
    div.style.top = `calc(50% + ${y}px)`;
    div.style.transform = 'translate(-50%, -50%)';
    
    // Determine avatar content - use image if available, otherwise emoji
    let avatarContent;
    if (player.avatar && player.avatar.startsWith('characters/')) {
        avatarContent = `<img src="${player.avatar}" alt="${player.username}">`;
    } else {
        avatarContent = player.avatar || '😀';
    }
    
    div.innerHTML = `
        <div class="player-circle">${avatarContent}</div>
        <div class="player-name-tag">${player.username}</div>
        <div class="player-soda-count">🥤 ${player.sodaCount || 0}</div>
    `;
    
    // Add hover tooltip
    div.addEventListener('mouseenter', (e) => {
        showPlayerTooltip(div, player);
    });
    
    div.addEventListener('mouseleave', () => {
        hidePlayerTooltip(div);
    });
    
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

function showPlayerTooltip(avatarDiv, player) {
    // Don't show tooltip if speech bubble is present
    if (avatarDiv.querySelector('.speech-bubble')) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'player-tooltip';
    
    tooltip.innerHTML = `
        <div class="player-tooltip-content">
            <div class="player-tooltip-row">
                <span class="player-tooltip-label">Name:</span>
                <span class="player-tooltip-value">${player.username}</span>
            </div>
            <div class="player-tooltip-row">
                <span class="player-tooltip-label">Butt Size:</span>
                <span class="player-tooltip-value">${player.buttSize || 'Regular'}</span>
            </div>
            <div class="player-tooltip-row">
                <span class="player-tooltip-label">Sodas:</span>
                <span class="player-tooltip-value">${player.sodaCount || 0}</span>
            </div>
        </div>
    `;
    
    avatarDiv.appendChild(tooltip);
}

function hidePlayerTooltip(avatarDiv) {
    const tooltip = avatarDiv.querySelector('.player-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function showDrinkAnimation(playerId) {
    // Find the player avatar
    const playerAvatar = document.querySelector(`[data-player-id="${playerId}"]`);
    if (!playerAvatar) {
        console.log('Player avatar not found for animation:', playerId);
        return;
    }
    
    console.log('Showing drink animation for:', playerId);
    
    // Add drinking animation class
    playerAvatar.classList.add('drinking');
    
    // Get the player's position in the viewport
    const rect = playerAvatar.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create a single soda falling down - start higher above the avatar
    const soda = document.createElement('div');
    soda.textContent = '🥤';
    soda.style.position = 'fixed';
    soda.style.left = centerX + 'px';
    soda.style.top = (centerY - 100) + 'px'; // Start higher up
    soda.style.fontSize = '2rem';
    soda.style.pointerEvents = 'none';
    soda.style.zIndex = '1000';
    soda.style.transform = 'translateX(-50%)';
    soda.style.animation = 'sodaDrop 0.6s ease-in forwards';
    
    document.body.appendChild(soda);
    
    // Remove soda and animation class after animation completes
    setTimeout(() => {
        playerAvatar.classList.remove('drinking');
        if (soda.parentNode) {
            soda.remove();
        }
    }, 600);
}

// Initialize
updatePlayersCircle();
