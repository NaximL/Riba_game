import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { skins, trash, scale, mapWidths, mapHeights } from './web/js/config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const resolusionX = mapWidths;
const resolusionY = mapHeights;
const TRASH_NUM = 350;
let PLAYERS = [];
let TRASH = [];

app.use(express.static(path.join(__dirname, 'web'))); // 🟢 Хостим все з /web

// 📄 HTML маршрути
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'web/html/menu.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, 'web/html/menu.html')));
app.get('/game', (req, res) => res.sendFile(path.join(__dirname, 'web/html/index.html')));
app.get('/qr', (req, res) => res.sendFile(path.join(__dirname, 'web/html/qrcode.html')));
app.get('/monsters', (req, res) => res.sendFile(path.join(__dirname, 'web/html/Scan.html')));

function s(length = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTrash() {
  const totalChance = trash.reduce((sum, t) => sum + t.chance, 0);
  const rand = Math.random() * totalChance;
  let current = 0;
  for (const item of trash) {
    current += item.chance;
    if (rand < current) return item;
  }
}

const create_chil = (num, s = false) => {
  for (let i = 0; i < num; i++) {
    let tras = getRandomTrash();
    TRASH.push({
      new: s,
      scale: tras.scale,
      img: tras.img,
      score: tras.scope,
      x: random(10, resolusionX - 10),
      y: random(10, resolusionY - 10),
      rotate: random(0, 360)
    });
  }
};

const update = () => {
  if (TRASH.length < 1500) {
    let o = s();
    io.emit("trashId", o);
    create_chil(50, o);
    io.emit('gettrash', JSON.stringify(TRASH));
  }
};

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  PLAYERS.push({
    id: socket.id,
    nick: socket.id,
    x: random(10, 500),
    y: random(10, 500),
    skin: skins.normal,
    score: 0,
    vx: 0,
    vy: 0
  });

  io.emit('gettrash', JSON.stringify(TRASH));
  io.emit('create_players', JSON.stringify(PLAYERS));

  socket.on("waf", () => update());
  socket.on("nick", (nick) => {
    let p = PLAYERS.find(o => o.id === socket.id);
    if (p) p.nick = nick;
  });
  socket.on("ChangeSkin", (skin) => {
    let p = PLAYERS.find(o => o.id === socket.id);
    if (p) p.skin = skin;
  });
  socket.on("deleteTrash", (index) => {
    if (index >= 0 && index < TRASH.length) TRASH.splice(index, 1);
  });

  socket.on('move', (dir) => {
    const player = PLAYERS.find(p => p.id === socket.id);
    if (!player) return;
    const speed = 0.85;
    if (dir === 'up') player.vy -= speed;
    if (dir === 'down') player.vy += speed;
    if (dir === 'left') player.vx -= speed;
    if (dir === 'right') player.vx += speed;
  });

  socket.on("sendgift", ({ fromId, toId }) => io.emit("calmgift", { fromId, toId }));
  socket.on("sendlove", ({ fromId, toId }) => io.emit("calmlove", { fromId, toId }));
  socket.on("sendbulk", ({ fromId, toId }) => io.emit("calmbulk", { fromId, toId }));

  socket.on('disconnect', () => {
    PLAYERS = PLAYERS.filter(player => player.id !== socket.id);
    io.emit('create_players', JSON.stringify(PLAYERS));
    console.log('❌ Client disconnected:', socket.id);
  });
});

setInterval(() => {
  PLAYERS.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.91;
    p.vy *= 0.91;
  });
  io.emit('create_players', JSON.stringify(PLAYERS));
}, 30);

// ✅ Порт Heroku або локальний
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  const networkInterfaces = os.networkInterfaces();
  const localIp = Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface.family === 'IPv4' && !iface.internal)?.address;
  create_chil(TRASH_NUM);
  console.log(`🚀 Server listening on http://${localIp || 'localhost'}:${PORT}`);
  setInterval(update, 10000);
});
