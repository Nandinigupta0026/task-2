const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.height = 2000;
canvas.width = 2000;


const tileSize = 200;
const padding = 27;
const keyradius = 7;
let overlap = false;

const tilecoords = [];
const greencoords = [];
const buildings = [];
const keys = [];

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  speed: 7,
};

let keysPressed = {};

function drawGridWithGreenCenters() {
  for (let x = 0; x < canvas.width; x += tileSize) {
    for (let y = 0; y < canvas.height; y += tileSize) {
      const tile = { x, y };
      tilecoords.push(tile);

      ctx.lineWidth = 0.1;
      ctx.strokeStyle = "hsl(84, 100%, 36.3%)";
      ctx.strokeRect(x, y, tileSize, tileSize);

      const greenX = x + padding;
      const greenY = y + padding;
      const greenSize = tileSize - padding * 2;
      ctx.fillStyle = "#7FFF00";
      ctx.fillRect(greenX, greenY, greenSize, greenSize);

      greencoords.push({ x: greenX, y: greenY, size: greenSize });
    }
  }
}

function generateBlackBuildings() {
  greencoords.forEach(({ x, y, size }) => {
    for (let i = 0; i < 5; i++) {
      const squareSize = 65;
      const randX = x + Math.random() * (size - squareSize);
      const randY = y + Math.random() * (size - squareSize);
      buildings.push({ x: randX, y: randY, size: squareSize });
    }
  });
}

function drawBlackBuildings() {
  buildings.forEach(({ x, y, size }) => {
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, size, size);
  });
}

function keygenerate() {
  const nofkey = Math.floor(Math.random() * 50);

  for (let i = 0; i < nofkey; i++) {
    let kx = Math.random() * canvas.width;
    let ky = Math.random() * canvas.height;
    keys.push({ x: kx, y: ky });
  }
}

function keydraw() {
  keys.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, keyradius, 0, Math.PI * 2);
    ctx.fillStyle = "Fuchsia";
    ctx.strokeStyle = "Fuchsia";
    ctx.fill();
    ctx.stroke();
  });
}

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

function isCollidingWithBuilding(x, y, radius) {
  for (const building of buildings) {
    const { x: bx, y: by, size } = building;

    let closestX, closestY;

    if (x > bx + size) {
      closestX = bx + size;
    } else if (x < bx) {
      closestX = bx;
    } else {
      closestX = x;
    }

    if (y > by + size) {
      closestY = by + size;
    } else if (y < by) {
      closestY = by;
    } else {
      closestY = y;
    }

    const dx = x - closestX;
    const dy = y - closestY;

    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared < radius * radius) {
      return true;
    }
  }
  return false;
}

function movePlayer() {
  let nextX = player.x;
  let nextY = player.y;

  if (keysPressed["ArrowUp"]) nextY -= player.speed;
  if (keysPressed["ArrowDown"]) nextY += player.speed;
  if (keysPressed["ArrowLeft"]) nextX -= player.speed;
  if (keysPressed["ArrowRight"]) nextX += player.speed;

  if (!isCollidingWithBuilding(nextX, nextY, player.radius)) {
    player.x = nextX;
    player.y = nextY;
  }
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
}

function collisionofkeyandplayer() {
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    const dx = player.x - key.x;
    const dy = player.y - key.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + keyradius) {
      keys.splice(i, 1);
    }
  }
}


drawGridWithGreenCenters();
generateBlackBuildings();
drawBlackBuildings();
keygenerate();
keydraw();
drawPlayer();
movePlayer();



const towerAngles = tilecoords.map(() => Math.random() * 2 * Math.PI);


function drawTower() {
  tilecoords.forEach(({ x, y }, i) => {
    const centerX = x + tileSize / 2;
    const centerY = y + tileSize / 2;
    const arcRadius = tileSize / 2 + 20;

    const start_angle = towerAngles[i];
    const end_angle = start_angle + Math.PI / 3;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, arcRadius, start_angle, end_angle);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();

    ctx.fillStyle = "rgba(255, 0, 0, 0.33)";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function rotateTower() {
  requestAnimationFrame(rotateTower);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawGridWithGreenCenters();
  drawBlackBuildings();
  keydraw();
  movePlayer();
  drawPlayer();
  collisionofkeyandplayer();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
 

  for (let i = 0; i < towerAngles.length; i++) {
    towerAngles[i] += 0.01;
  }
  drawTower();
}

rotateTower();
