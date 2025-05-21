const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['https://codebites-frontend2.onrender.com'],
      methods: ["GET", "POST", "DELETE"]
    }
  });
};

const getIo = () => io;

module.exports = { initializeSocket, getIo };
