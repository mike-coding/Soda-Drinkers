# 🥤 Soda Drinker Game

A fully-functioning multiplayer web game where you and other players can log on and drink virtual sodas together in real-time!

## Features

- **Multiplayer Support**: See other players online in real-time
- **Username System**: Choose your own username when joining
- **5 Soda Options**: Sprite, Pepsi, Coca-Cola, Dr. Pepper, and Mt. Dew
- **Drink Tracking**: Keep track of how many sodas each player has consumed
- **Quick Chat**: Communicate with other players using preset messages
- **Real-time Updates**: All actions are synchronized across all connected players
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup Steps

1. Open a terminal in the game directory

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

5. To test multiplayer, open multiple browser tabs or share the URL with friends on your local network!

## How to Play

1. **Enter Your Username**: Type your desired username on the main menu
2. **Start Drinking**: Click the "Start Drinking!" button to enter the game
3. **Choose a Soda**: Click any of the 5 soda buttons to drink that soda
4. **Track Progress**: Watch your soda count increase with each drink
5. **See Other Players**: View all online players and their soda counts in the players panel
6. **Chat**: Use the quick chat buttons to communicate with other players

## Quick Chat Options

- 👋 **"Hello!"** - Greet other players
- 🥤 **"I'm drinking soda!"** - Let everyone know you're enjoying a soda
- 📊 **"I've drank {x} sodas!"** - Show off your soda count (automatically fills in your count)
- 😈 **"I'm going to take your soda!"** - Playfully challenge other players

## Development

To run in development mode with auto-restart on file changes:

```bash
npm run dev
```

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.IO
- **Architecture**: Event-driven WebSocket architecture

## Port Configuration

By default, the server runs on port 3000. To use a different port, set the PORT environment variable:

```bash
PORT=8080 npm start
```

## Troubleshooting

- **Can't connect to server**: Make sure the server is running and you're using the correct URL
- **Not seeing other players**: Ensure all players are connected to the same server instance
- **Port already in use**: Stop other applications using port 3000 or change the port

## Have Fun!

Enjoy drinking virtual sodas with your friends! 🥤🎮
