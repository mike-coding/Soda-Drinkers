const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve static files
app.use(express.static(__dirname));

// Store connected players
const players = new Map();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle player join
    socket.on('join', (playerData) => {
        // Support both old string format and new object format
        const username = typeof playerData === 'string' ? playerData : playerData.username;
        const buttSize = typeof playerData === 'string' ? 'Regular' : playerData.buttSize;
        const avatar = typeof playerData === 'string' ? '😀' : playerData.avatar;
        
        players.set(socket.id, {
            id: socket.id,
            username: username,
            sodaCount: 0,
            buttSize: buttSize,
            avatar: avatar
        });

        // Send current players list to the new player
        socket.emit('players-update', Array.from(players.values()));

        // Broadcast to all players that someone joined
        io.emit('player-joined', {
            id: socket.id,
            username: username,
            sodaCount: 0,
            buttSize: buttSize,
            avatar: avatar
        });

        console.log(`${username} joined the game (Butt Size: ${buttSize})`);
    });

    // Handle soda drinking
    socket.on('drink-soda', (sodaType) => {
        const player = players.get(socket.id);
        if (player) {
            player.sodaCount++;
            
            // Update all clients about the soda drink
            io.emit('soda-drunk', {
                playerId: socket.id,
                username: player.username,
                sodaType: sodaType,
                newCount: player.sodaCount
            });

            console.log(`${player.username} drank ${sodaType}. Total: ${player.sodaCount}`);
        }
    });

    // Handle chat messages
    socket.on('chat-message', (message) => {
        const player = players.get(socket.id);
        if (player) {
            // Replace {x} with actual soda count
            const formattedMessage = message.replace('{x}', player.sodaCount);
            
            // Broadcast chat message to all players
            io.emit('chat-message', {
                username: player.username,
                message: formattedMessage,
                timestamp: Date.now()
            });

            console.log(`${player.username}: ${formattedMessage}`);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const player = players.get(socket.id);
        if (player) {
            console.log(`${player.username} disconnected`);
            players.delete(socket.id);
            
            // Notify all players
            io.emit('player-left', socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log(`🥤 Soda Drinker server running on http://localhost:${PORT}`);
});
