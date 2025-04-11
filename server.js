require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { initializeSocket } = require("./socket");
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connesso al DB"))
  .catch(err => console.log("Errore di connessione:", err));

const allowedOrigins = ['https://codebites-frontend2.onrender.com'];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const router = require("./routes/api");
app.use("/api", router);

initializeSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`App in ascolto sulla porta ${PORT}`);
});
