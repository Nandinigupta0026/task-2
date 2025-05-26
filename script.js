const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.height = 2000;
canvas.width = 2000;

const tileSize = 200;
const padding = 27;
const keyradius = 7;
const threshold = 30;
let overlap = false;
let keysCollected = 0;
let keysRequired = 3;
let shardUnlocked = false;
let shardDelivered = false;
let noofshard = 0;
let playerHasShard = false;

const tilecoords = [];
const greencoords = [];
const buildings = [];
const keys = [];
const bullets = [];

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  speed: 7,
  color: "white",
};

const bsx = Math.floor(Math.random() * (canvas.width / tileSize));
const bsy = Math.floor(Math.random() * (canvas.height / tileSize));

const chx = Math.floor(Math.random() * (canvas.width / tileSize));
const chy = Math.floor(Math.random() * (canvas.height / tileSize));

let keysPressed = {};

function drawGrid() {
  for (let x = 0; x < canvas.width; x += tileSize) {
    for (let y = 0; y < canvas.height; y += tileSize) {
      const tile = { x, y };
      tilecoords.push(tile);

      if (x === tileSize * bsx && y == tileSize * bsy) {
        ctx.strokeStyle = "cyan";
        ctx.fillStyle = "cyan";
      } else if (x === tileSize * chx && y == tileSize * chy) {
        ctx.strokeStyle = "Fuchsia";
        ctx.fillStyle = "Fuchsia";
      } else {
        ctx.strokeStyle = "hsl(84, 100%, 36.3%)";
        ctx.fillStyle = "#7FFF00";
      }
      ctx.lineWidth = 0.1;
      ctx.strokeRect(x, y, tileSize, tileSize);
      const greenX = x + padding;
      const greenY = y + padding;
      const greenSize = tileSize - padding * 2;
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
      buildings.push({ x: randX, y: randY, size: squareSize, hitcount: 0 });
    }
  });
}

function drawBlackBuildings() {
  buildings.forEach(({ x, y, size }) => {
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, size, size);
  });
}

function drawShards() {
  const hubTile = greencoords.find(
    (gc) =>
      gc.x === tileSize * chx + padding && gc.y === tileSize * chy + padding
  );

  const stationTile = greencoords.find(
    (gc) =>
      gc.x === tileSize * bsx + padding && gc.y === tileSize * bsy + padding
  );

  if (hubTile) {
    ctx.fillStyle = "#FF00BF";
    ctx.beginPath();
    ctx.arc(
      hubTile.x + hubTile.size / 2,
      hubTile.y + hubTile.size / 2,
      20,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  if (stationTile) {
    ctx.fillStyle = "blue";

    ctx.beginPath();
    ctx.arc(
      stationTile.x + stationTile.size / 2,
      stationTile.y + stationTile.size / 2,
      20,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
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
  ctx.strokeStyle="player.color";
  ctx.fillStyle = "white";
  ctx.stroke();
  ctx.fill();
}

function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function collisionofkeyandplayer() {
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    distance = getDistance(player.x, player.y, key.x, key.y);
    if (distance < player.radius + keyradius) {
      keysCollected++;
      document.querySelector("#keys").textContent = keysCollected;
      keys.splice(i, 1);
    }
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const dx = mouseX - player.x;
  const dy = mouseY - player.y;

  const distance = Math.sqrt(dx * dx + dy * dy);

  const directionX = dx / distance;
  const directionY = dy / distance;

  bullets.push({
    x: player.x,
    y: player.y,
    speed: 10,
    dirX: directionX,
    dirY: directionY,
    hit: 0,
  });
});

function fireBullet() {
  for (let i = 0; i < bullets.length; i++) {
    let b = bullets[i];

    b.x += b.dirX * b.speed;
    b.y += b.dirY * b.speed;

    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();

    const index = Isbulletcollidewithbuilding(b);

    if (index !== -1) {
      b.hit++;
      if (buildings[index].hitcount < 5) {
        const bx = buildings[index].x;
        const by = buildings[index].y;
        const size = buildings[index].size;

        const cx = bx + size / 2;
        const cy = by + size / 2;

        const dx = b.x - cx;
        const dy = b.y - cy;

        if (Math.abs(dx) > Math.abs(dy)) {
          b.dirX = -b.dirX;
        } else {
          b.dirY = -b.dirY;
        }

        buildings[index].hitcount++;
      }

      if (buildings[index].hitcount >= 5) {
        buildings.splice(index, 1);
      }
      b.speed -= 0.5;

      continue;
    }

    if (
      b.x < 0 ||
      b.x > canvas.width ||
      b.y < 0 ||
      b.y > canvas.height ||
      b.hit > 10
    ) {
      bullets.splice(i, 1);
      i--;
    }
  }
}

function Isbulletcollidewithbuilding(bullet) {
  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i];
    if (
      bullet.x > building.x &&
      bullet.x < building.x + building.size &&
      bullet.y > building.y &&
      bullet.y < building.y + building.size
    ) {
      return i;
    }
  }
  return -1;
}

let sysheal = 100;
let systemInterval = null;

function systemhealth() {
  if (systemInterval) return;

  document.querySelector("#systemHealth").textContent = sysheal;

  systemInterval = setInterval(() => {
    if (sysheal > 0) {
      sysheal--;
      document.querySelector("#systemHealth").textContent = sysheal;
    } else {
      clearInterval(systemInterval);
      console.log("Game over");
    }
  }, 1000);
}

function checkShardUnlock() {
  const hubTile = greencoords.find(
    (gc) =>
      gc.x === tileSize * chx + padding && gc.y === tileSize * chy + padding
  );
  const hubDist = getDistance(player.x, player.y, hubTile.x, hubTile.y);
  if (
    keysCollected >= keysRequired &&
    hubDist < threshold &&
    !shardUnlocked
  ) {
    shardUnlocked = true;
    playerHasShard = true;
    keysCollected -= keysRequired;
    player.color = "frushia";
    document.querySelector("#keys").textContent = keysCollected;
    console.log("shradunlocked");
  }
}

function checkShardDelivery() {
  const stationTile = greencoords.find(
    (gc) =>
      gc.x === tileSize * bsx + padding && gc.y === tileSize * bsy + padding
  );

  const baseDist = getDistance(
    player.x,
    player.y,
    stationTile.x,
    stationTile.y
  );
  if (playerHasShard && baseDist < threshold) {
    shardDelivered = true;
    playerHasShard = false;
    shardUnlocked = false;
    player.color = "white";
    sysheal += 10;
    noofshard++;
    document.querySelector("#systemHealth").textContent = sysheal;
    document.querySelector("#shardDelivered").textContent = noofshard;
    console.log("shraddelivered");

    drawShards();
  }
}

function drawTower() {
  tilecoords.forEach(({ x, y }, i) => {
    if (
      (x === tileSize * bsx && y === tileSize * bsy) ||
      (x === tileSize * chx && y === tileSize * chy)
    )
      return;
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

function startGame() {
  requestAnimationFrame(startGame);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawBlackBuildings();
  drawShards();
  keydraw();
  drawPlayer();
  movePlayer();
  collisionofkeyandplayer();
  fireBullet();
  systemhealth();
  checkShardUnlock();
  checkShardDelivery();

  for (let i = 0; i < towerAngles.length; i++) towerAngles[i] += 0.01;
  drawTower();
}

drawGrid();
generateBlackBuildings();
keygenerate();
const towerAngles = tilecoords.map(() => Math.random() * 2 * Math.PI);
drawTower();
startGame();
