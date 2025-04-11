const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3001'],
      methods: ["GET", "POST", "DELETE"]
    }
  });
  
  console.log("Socket.io è stato inizializzato.");
};

const getIo = () => io;

module.exports = { initializeSocket, getIo };
