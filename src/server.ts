import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { GameManager } from "./gameManager";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(path.join(__dirname, "../public")));

const gameManager = new GameManager(io);

io.on("connection", (socket) => {
  console.log(`Jogador conectado: ${socket.id}`);
  gameManager.handleConnection(socket);

  socket.on("disconnect", () => {
    console.log(`Jogador desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor TCG rodando em http://localhost:${PORT}`);
});
