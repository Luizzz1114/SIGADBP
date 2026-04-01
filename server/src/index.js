import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { iniciarTareasProgramadas } from './jobs/scheduler.js';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { verificarTokenSocket } from './middlewares/authMiddleware.js'; 

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

app.set('socketio', io);
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use('/api-sigadbp', router);

iniciarTareasProgramadas();-

io.use(verificarTokenSocket);
io.on('connection', (socket) => {
  console.log(`➜ Cliente conectado por WebSocket (Usuario ID: ${socket.user?.id})`);
  socket.on('disconnect', () => {
    console.log(`➜ Cliente desconectado (Usuario ID: ${socket.user?.id})`);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`➜ Servidor funcionando en http://localhost:${port}/api-sigadbp`);
  console.log(`➜ Servidor de WebSockets iniciado correctamente`);
});