import { local, mapHeights, mapWidths, skins } from "./config/config.js";
import { res, dpr, col, getId, isDesktop } from "./help.js";



export const socket = io(server);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const HUD = document.getElementById("Hud");

res(canvas, ctx);
window.addEventListener('resize', () => res(canvas, ctx));

let mapWidth = mapWidths;
let mapHeight = mapHeights;


const trashCache = {};

let trashId = null;
let cameraX = 0;
let cameraY = 0;
export let ID = null;

const playerSkinImage = new Image();
const heartImage = new Image();
heartImage.src = '../imgs/icons/heart.svg';
const PodImg = new Image();
PodImg.src = '../imgs/icons/Gift.png';

let PLAYER = [];
let TRASH = [];
let heartAnimations = [];
let giftAnimations = [];

if (navigator.connection && navigator.connection.saveData) {
  alert("На вашому пристрої ввімкнено режим економії даних. Це впливає на праціздатність гри");
}

socket.on('connect', () => {
  socket.emit("nick", localStorage.nick);
  socket.emit('move', 'right')
  ID = socket.id;
});

socket.on("trashId", (tid) => {
  trashId = tid;
});

socket.on("gettrash", (trash) => {
  try {
    TRASH = JSON.parse(trash);
  } catch {
    TRASH = trash;
  }
});

socket.on('create_players', (playersJSON) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#4e6879';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  const zoom = isDesktop() ? 1 : 0.7;
  ctx.scale(zoom, zoom);

  try {
    PLAYER = JSON.parse(playersJSON);
  } catch {
    PLAYER = playersJSON;
  }

  const me = PLAYER.find(p => p.id === ID);
  if (!me) {
    ctx.restore();
    return;
  }

  const logicalWidth = (canvas.width / dpr) / zoom;
  const logicalHeight = (canvas.height / dpr) / zoom;

  cameraX = Math.min(Math.max(me.x - logicalWidth / 2, 0), mapWidth - logicalWidth);
  cameraY = Math.min(Math.max(me.y - logicalHeight / 2, 0), mapHeight - logicalHeight);

  PLAYER.forEach(player => {
    if (
      player.x < cameraX - 300 ||
      player.x > cameraX + logicalWidth + 300 ||
      player.y < cameraY - 300 ||
      player.y > cameraY + logicalHeight + 300
    ) return;



    const flip = player.vx > 0;
    ctx.save();
     
    ctx.translate(player.x - cameraX, player.y - cameraY);
    ctx.rotate(Math.atan2(player.vy, player.vx) + Math.PI);
    if (flip) ctx.scale(1, -1);
    playerSkinImage.src = player.skin || '../imgs/akula_new.png';
    ctx.drawImage(playerSkinImage, -120, -80, 213, 160);
    ctx.restore();



    for (let i = TRASH.length - 1; i >= 0; i--) {
      if (col(player, TRASH[i], 70)) {
        localStorage.score = Number(localStorage.score) + TRASH[i].score;
        document.getElementById("score").innerHTML = `<img src="../imgs/icons/volna.png"/> EсoPoints: ${localStorage.score}`;
        socket.emit("deleteTrash", i);
        TRASH.splice(i, 1);
      }
    }

    ctx.font = '12px GNF';
    ctx.fillStyle = '#fff';
    ctx.fillText(player.nick, player.x - cameraX, player.y - cameraY + 80);
  });

  let hudShown = false;
  outer: for (let i = 0; i < PLAYER.length; i++) {
    for (let j = i + 1; j < PLAYER.length; j++) {
      if (col(PLAYER[i], PLAYER[j], 200)) {
        if (PLAYER[i].id === ID || PLAYER[j].id === ID) {
          document.getElementById("Hud_nick").innerText = PLAYER[i].nick !== localStorage.nick ? PLAYER[i].nick : PLAYER[j].nick;
          HUD.classList.add("visible");
          hudShown = true;
          break outer;
        }
      }
    }
  }
  if (!hudShown) HUD.classList.remove("visible");

  drawTrash(logicalWidth, logicalHeight);
  drawGiftAnimations();
  drawHeartAnimations();

  ctx.restore();
});


function drawTrash(logicalWidth, logicalHeight) {
  const now = performance.now();

  TRASH.forEach((el) => {
    if (
      el.x < cameraX - 100 ||
      el.x > cameraX + logicalWidth + 100 ||
      el.y < cameraY - 100 ||
      el.y > cameraY + logicalHeight + 100
    ) return;

    if (!trashCache[el.img]) {
      const img = new Image();
      img.src = el.img;
      img.onload = () => {
        trashCache[el.img] = img;
      };
    }

    if (!el.spawnTime) el.spawnTime = now;

    const img = trashCache[el.img];
    if (img) {
      ctx.save();
      if (el.new) {
        const elapsed = now - el.spawnTime;
        ctx.globalAlpha = Math.min(elapsed / 700, 1);
      }
      ctx.translate(el.x - cameraX, el.y - cameraY);
      ctx.rotate(el.rotate * Math.PI / 180);
      ctx.drawImage(img, -25, -25, 50 * el.scale, 50 * el.scale);
      ctx.restore();
    }
  });
}


if (!localStorage.skin) {
  localStorage.skin = skins.normal;
  socket.emit('ChangeSkin', localStorage.skin);
} else {
  socket.emit('ChangeSkin', localStorage.skin);
}

if (!localStorage.score) localStorage.score = 0;
if (!localStorage.skins) localStorage.skins = JSON.stringify(["../imgs/akula_new.png"]);
if (!localStorage.gifts) localStorage.gifts = JSON.stringify([]);


const keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

setInterval(() => {
  if (!localStorage.InStore) {
    const me = PLAYER.find(p => p.id === ID);
    if (!me) return;


    me.x = Math.max(0, Math.min(me.x, mapWidth));
    me.y = Math.max(0, Math.min(me.y, mapHeight));

    if (keys['w']) socket.emit('move', 'up');
    if (keys['a']) socket.emit('move', 'left');
    if (keys['s']) socket.emit('move', 'down');
    if (keys['d']) socket.emit('move', 'right');
  }
}, 30);

socket.on("calmgift", ({ fromId, toId }) => {
  const fromPlayer = PLAYER.find(p => p.id === fromId);
  const toPlayer = PLAYER.find(p => p.id === toId);
  if (!fromPlayer || !toPlayer) return;
  giftAnimations.push({
    toId: toPlayer.id,
    from: { x: fromPlayer.x, y: fromPlayer.y },
    to: { x: toPlayer.x, y: toPlayer.y },
    startTime: performance.now(),
    stage: 'shake'
  });
});

socket.on("calmlove", ({ fromId, toId }) => {
  const fromPlayer = PLAYER.find(p => p.id === fromId);
  const toPlayer = PLAYER.find(p => p.id === toId);
  if (!fromPlayer || !toPlayer) return;
  heartAnimations.push({
    x: toPlayer.x,
    y: toPlayer.y,
    startTime: performance.now(),
    stage: 'beat'
  });
});

function drawGiftAnimations() {
  const now = performance.now();
  giftAnimations = giftAnimations.filter(anim => {
    const elapsed = now - anim.startTime;
    if (anim.stage === 'shake') {
      if (elapsed < 1800) {
        const shakeAmount = 3;
        const shakeX = anim.from.x + (Math.random() - 0.5) * shakeAmount;
        const shakeY = anim.from.y + (Math.random() - 0.5) * shakeAmount;
        ctx.save();
        const angle = Math.sin(elapsed / 100) * (Math.PI / 180) * 10;
        ctx.translate(shakeX - cameraX, shakeY - cameraY);
        ctx.rotate(angle);
        ctx.drawImage(PodImg, -25, -25, 50, 50);
        ctx.restore();
        return true;
      } else {
        anim.stage = 'move';
        anim.startTime = now;
        return true;
      }
    }
    if (anim.stage === 'move') {
      if (elapsed < 1500) {
        const t = elapsed / 1500;
        const currentX = anim.from.x + (anim.to.x - anim.from.x) * t;
        const currentY = anim.from.y + (anim.to.y - anim.from.y) * t;
        ctx.drawImage(PodImg, currentX - cameraX - 25, currentY - cameraY - 25, 50, 50);
        return true;
      } else {
        sendLoveTo(anim.toId
        );
        return false;
      }
    }

    return false;
  });
}

function drawHeartAnimations() {
  const now = performance.now();
  heartAnimations = heartAnimations.filter(anim => {
    const elapsed = now - anim.startTime;

    if (anim.stage === 'beat') {
      if (elapsed < 600) {
        const scale = 1 + 0.2 * Math.sin((elapsed / 600) * Math.PI * 4);
        ctx.save();
        ctx.translate(anim.x - cameraX, anim.y - cameraY);
        ctx.scale(scale, scale);
        ctx.drawImage(heartImage, -16, -16, 32, 32);
        ctx.restore();
        return true;
      } else {
        anim.stage = 'rise';
        anim.startTime = now;
        return true;
      }
    }

    if (anim.stage === 'rise') {
      const t = elapsed / 1000;
      if (t < 1) {
        const opacity = 1 - t;
        const riseY = anim.y - t * 60;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(heartImage, anim.x - cameraX - 16, riseY - cameraY - 16, 32, 32);
        ctx.restore();
        return true;
      }
    }

    return false;
  });
}

window.sendToplay = function () {
  const me = PLAYER.find(p => p.id === ID);
  if (!me) return;
  const other = PLAYER.find(p => p.id !== ID && col(p, me, 150));
  if (other) sendGiftTo(other.id);
};

window.update = () => {
  socket.emit("waf")
}

const sendGiftTo = (toId) => {
  socket.emit("sendgift", { fromId: ID, toId });
};

const sendLoveTo = (toId) => {
  socket.emit("sendlove", { fromId: ID, toId });
};
