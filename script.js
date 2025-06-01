const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const sounds = {
  key: new Audio("sounds/key.mp3"),
  shoot: new Audio("sounds/shoot.mp3"),
  speed:new Audio("sounds/speedbooast.mp3"),
  spawn:new Audio("sounds/spawn.mp3"),
};

canvas.height = 2155;
canvas.width = 2155;

const tileSize = 270;
const padding = 27;
const keyradius = 7;
const threshold = 30;
const powerUpRadius = 12;
const iconSize = 32;

let keysCollected = 0;
let keysRequired = 3;
let shardUnlocked = false;
let shardDelivered = false;
let noofshard = 0;
let playerHasShard = false;
let sysheal = 50;
let systemInterval = null;
let playheal = 100;
let isinvisible = false;
let speedincrease = false;
let powerUpTimers = {};

let isPaused = false;
let isGameOver = false;

const tilecoords = [];
const greencoords = [];
const buildings = [];
const keys = [];
const bullets = [];
const floatingTexts = [];
const towers = [];
const healthPowerUps = [];
const invisibilityPowerUps = [];
const speedPowerUps = [];


const iconImages = {
  health: new Image(),
  invisibility: new Image(),
  speed: new Image(),
};
iconImages.health.src = "images/health.png";
iconImages.invisibility.src = "images/shield.png";
iconImages.speed.src = "images/speed.png";

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  speed: 7,
  color: "white",
};

let bsx = Math.floor(Math.random() * (canvas.width / tileSize));
let bsy = Math.floor(Math.random() * (canvas.height / tileSize));

let chx = Math.floor(Math.random() * (canvas.width / tileSize));
let chy = Math.floor(Math.random() * (canvas.height / tileSize));

let keysPressed = {};

function drawGrid() {
  for (let x = 0; x < canvas.width; x += tileSize) {
    for (let y = 0; y < canvas.height; y += tileSize) {
      const tile = { x, y };
      tilecoords.push(tile);

      if (x === tileSize * bsx && y == tileSize * bsy) {
        ctx.fillStyle = "	#00E5FF";
      } else if (x === tileSize * chx && y == tileSize * chy) {
        ctx.fillStyle = "#FF00FF";
      } else {
        ctx.fillStyle = "green";
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#145214";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 10;
      ctx.strokeRect(x, y, tileSize, tileSize);
      const greenX = x + padding;
      const greenY = y + padding;
      const greenSize = tileSize - padding * 2;
      ctx.fillRect(greenX, greenY, greenSize, greenSize);
      ctx.shadowBlur = 0;

      greencoords.push({ x: greenX, y: greenY, size: greenSize });
    }
  }
}

function generateBlackBuildings() {
  greencoords.forEach(({ x, y, size }) => {
    for (let i = 0; i < 5; i++) {
      const squareSize = 85;
      const randX = x + Math.random() * (size - squareSize);
      const randY = y + Math.random() * (size - squareSize);
      buildings.push({ x: randX, y: randY, size: squareSize, hitcount: 0 });
    }
  });
}

function drawBlackBuildings() {
  buildings.forEach(({ x, y, size }) => {
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, "#1A1A1A");
    gradient.addColorStop(1, "#2E2E2E");
    ctx.fillStyle = gradient;

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
    ctx.fillStyle = "	#BF00FF";
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
  const nofkey = Math.floor(Math.random() * 40) + 10;

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
    ctx.fillStyle = "	#FF6EC7";
    ctx.fill();
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

  const minX = player.radius;
  const maxX = canvas.width - player.radius;
  const minY = player.radius;
  const maxY = canvas.height - player.radius;

  nextX = Math.max(minX, Math.min(maxX, nextX));
  nextY = Math.max(minY, Math.min(maxY, nextY));

  if (!isCollidingWithBuilding(nextX, nextY, player.radius)) {
    player.x = nextX;
    player.y = nextY;
  }
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.strokeStyle = player.color;
  ctx.fillStyle = player.color;
  ctx.stroke();
  ctx.fill();
}

function centerViewOnPlayer() {
  const offsetX = player.x - window.innerWidth / 2;
  const offsetY = player.y - window.innerHeight / 2;
  window.scrollTo(offsetX, offsetY);
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

      sounds.key.currentTime = 0;
      sounds.key.play();

      floatingTexts.push({
        x: key.x,
        y: key.y,
        text: " +🔑 ",
        alpha: 1,
        life: 30,
      });
      keys.splice(i, 1);
    }
  }
}
function drawFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ctx.font = "20px Orbitron, sans-serif";
    ctx.fillStyle = `rgba(255, 255, 0, ${ft.alpha})`;
    ctx.fillText(ft.text, ft.x, ft.y);

    ft.y -= 1;
    ft.alpha -= 0.03;
    ft.life--;

    if (ft.life <= 0 || ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

canvas.addEventListener("click", (e) => {
  sounds.shoot.currentTime = 0;
  sounds.shoot.play();

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
    ctx.fillStyle = "	#FF3131";
    ctx.fill();

    for (let t = 0; t < towers.length; t++) {
      const tower = towers[t];
      if (tower.destroyed) continue;
      const distance = getDistance(b.x, b.y, tower.x, tower.y);

      if (distance < 15) {
        tower.destroyed = true;
        bullets.splice(i, 1);
        i--;
        console.log("Tower destroyed!");
        break;
      }
    }

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

function systemhealth() {
  if (systemInterval || isPaused || isGameOver) return;

  document.querySelector("#systemHealth").textContent = sysheal;

  systemInterval = setInterval(() => {
    if (isPaused || isGameOver) return;
    if (sysheal > 0) {
      sysheal--;
      document.querySelector("#systemHealth").textContent = sysheal;
    }
    if (sysheal <= 0) {
      clearInterval(systemInterval);
      systemInterval = null;
      GameOver();
      console.log("Game over");
    }
  }, 3000);
}

function checkShardUnlock() {
  const hubTile = greencoords.find(
    (gc) =>
      gc.x === tileSize * chx + padding && gc.y === tileSize * chy + padding
  );
  const tilecenterX = hubTile.x + tileSize / 2;
  const tilecenterY = hubTile.y + tileSize / 2;
  const hubDist = getDistance(player.x, player.y, tilecenterX, tilecenterY);
  if (keysCollected >= keysRequired && hubDist < threshold && !shardUnlocked) {
    shardUnlocked = true;
    playerHasShard = true;
    keysCollected -= keysRequired;
    player.color = "	#9400D3";
    document.querySelector("#keys").textContent = keysCollected;
    console.log("shradunlocked");
  }
}

function checkShardDelivery() {
  const stationTile = greencoords.find(
    (gc) =>
      gc.x === tileSize * bsx + padding && gc.y === tileSize * bsy + padding
  );
  const centerX = stationTile.x + tileSize / 2;
  const centerY = stationTile.y + tileSize / 2;
  const baseDist = getDistance(player.x, player.y, centerX, centerY);
  if (playerHasShard && baseDist < threshold) {
    shardDelivered = true;
    playerHasShard = false;
    shardUnlocked = false;
    player.color = "white";
    sysheal += 30;
    noofshard++;
    document.querySelector("#systemHealth").textContent = sysheal;
    document.querySelector("#shardDelivered").textContent = noofshard;
    console.log("shraddelivered");

    if (sysheal >= 100 && !isGameOver) {
      GameWin();
    }
  }
  const highScoreElem = document.querySelector("#highScore");
  saveHighScore(noofshard);
  const highScore = getHighScore();
  highScoreElem.textContent = highScore;
}

function saveHighScore(score) {
  const highScore = localStorage.getItem("highScore");
  if (!highScore || score > parseInt(highScore)) {
    localStorage.setItem("highScore", score);
    console.log("New high score saved:", score);
  }
}
function getHighScore() {
  return localStorage.getItem("highScore") || 0;
}

function gettower() {
  tilecoords.forEach(({ x, y }, i) => {
    if (
      (x === tileSize * bsx && y === tileSize * bsy) ||
      (x === tileSize * chx && y === tileSize * chy)
    )
      return;

    towers.push({
      x: x + tileSize / 2,
      y: y + tileSize / 2,
      angle: Math.random() * 2 * Math.PI,
      destroyed: false,
    });
  });
}
function isPlayerInRedZone(cx, cy, startAngle) {
  const distance = getDistance(player.x, player.y, cx, cy);
  if (distance > tileSize / 2 + 20) return false;
  const dx = player.x - cx;
  const dy = player.y - cy;
  let angleToPlayer = Math.atan2(dy, dx);
  if (angleToPlayer < 0) angleToPlayer += 2 * Math.PI;

  startAngle = startAngle % (2 * Math.PI);
  if (startAngle < 0) startAngle += 2 * Math.PI;

  const endAngle = (startAngle + Math.PI / 3) % (2 * Math.PI);

  let inRedZone;

  if (startAngle < endAngle) {
    inRedZone = angleToPlayer >= startAngle && angleToPlayer <= endAngle;
  } else {
    inRedZone = angleToPlayer >= startAngle || angleToPlayer <= endAngle;
  }
  if (inRedZone) {
    console.log("player is in red zone");
  }

  return inRedZone;
}

function drawTower() {
  towers.forEach((tower) => {
    if (tower.destroyed) return;

    const end_angle = tower.angle + Math.PI / 3;
    const arcRadius = tileSize / 2 + 20;

    ctx.beginPath();
    ctx.moveTo(tower.x, tower.y);
    ctx.arc(tower.x, tower.y, arcRadius, tower.angle, end_angle);
    ctx.lineTo(tower.x, tower.y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 80, 80, 0.25)";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isPlayerInRedZone(tower.x, tower.y, tower.angle) && !isinvisible) {
      playheal -= 0.05;
      if (playheal <= 0 && !isGameOver) {
        playheal = 0;
        GameOver();
        return;
      }

      document.querySelector("#playerHealth").textContent =
        Math.floor(playheal);
    }
  });
}

function spawnHealthPowerUps(count = 3) {
  for (let i = 0; i < count; i++) {
    healthPowerUps.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      
    });
  }
}

function spawnInvisibilityPowerUps(count = 3) {
  for (let i = 0; i < count; i++) {
    invisibilityPowerUps.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    
    });
  }
}

function spawnSpeedPowerUps(count = 4) {
  for (let i = 0; i < count; i++) {
    speedPowerUps.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,

    });
  }
}

function spawnAllPowerUps() {

  spawnHealthPowerUps();
  spawnInvisibilityPowerUps();
  spawnSpeedPowerUps();
}

function drawHealthPowerUps() {
  healthPowerUps.forEach(({ x, y }) => {
    ctx.drawImage(iconImages.health, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
  });
}

function drawInvisibilityPowerUps() {
  invisibilityPowerUps.forEach(({ x, y }) => {
    ctx.drawImage(iconImages.invisibility, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
  });
}

function drawSpeedPowerUps() {
  speedPowerUps.forEach(({ x, y }) => {
    ctx.drawImage(iconImages.speed, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
  });
}

function drawAllPowerUps() {
  drawHealthPowerUps();
  drawInvisibilityPowerUps();
  drawSpeedPowerUps();
}

function collisionWithHealthPowerUps() {
  for (let i = healthPowerUps.length - 1; i >= 0; i--) {
    const p = healthPowerUps[i];
    if (getDistance(player.x, player.y, p.x, p.y) < player.radius + iconSize / 2) {
      sounds.spawn.currentTime = 0;
      sounds.spawn.play();
      playheal = Math.min(playheal + 10, 100);
      healthPowerUps.splice(i, 1);
    }
  }
}

function collisionWithInvisibilityPowerUps() {
  for (let i = invisibilityPowerUps.length - 1; i >= 0; i--) {
    const p = invisibilityPowerUps[i];
    if (getDistance(player.x, player.y, p.x, p.y) < player.radius + iconSize / 2) {
      sounds.spawn.currentTime = 0;
      sounds.spawn.play();
      isinvisible = true;
      invisibilityPowerUps.splice(i, 1);
      setTimeout(() => (isinvisible = false), 5000);
    }
  }
}

function collisionWithSpeedPowerUps() {
  for (let i = speedPowerUps.length - 1; i >= 0; i--) {
    const p = speedPowerUps[i];
    if (getDistance(player.x, player.y, p.x, p.y) < player.radius + iconSize / 2) {
      player.speed += 3;
      sounds.speed.currentTime = 0;
      sounds.speed.play();
      speedPowerUps.splice(i, 1);
      setTimeout(() => (player.speed -= 3), 5000);
    }
  }
}

function collisionWithAllPowerUps() {
  collisionWithHealthPowerUps();
  collisionWithInvisibilityPowerUps();
  collisionWithSpeedPowerUps();
  document.getElementById("playerHealth").textContent = Math.floor(playheal);
}

function resetGame() {
  tilecoords.length = 0;
  greencoords.length = 0;
  buildings.length = 0;
  keys.length = 0;
  bullets.length = 0;
  towers.length = 0;

   healthPowerUps.length = 0;
 invisibilityPowerUps.length =0;
 speedPowerUps.length = 0;


  keysCollected = 0;
  shardUnlocked = false;
  shardDelivered = false;
  playerHasShard = false;
  noofshard = 0;
  sysheal = 50;
  playheal = 100;
  isPaused = false;
  isGameOver = false;

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.color = "white";

  document.querySelector("#keys").textContent = keysCollected;
  document.querySelector("#systemHealth").textContent = sysheal;
  document.querySelector("#playerHealth").textContent = Math.floor(playheal);
  document.querySelector("#shardDelivered").textContent = noofshard;

  if (systemInterval) {
    clearInterval(systemInterval);
    systemInterval = null;
  }

  bsx = Math.floor(Math.random() * (canvas.width / tileSize));
  bsy = Math.floor(Math.random() * (canvas.height / tileSize));
  chx = Math.floor(Math.random() * (canvas.width / tileSize));
  chy = Math.floor(Math.random() * (canvas.height / tileSize));

  drawGrid();
  generateBlackBuildings();
  keygenerate();
  spawnAllPowerUps();
  gettower();
  drawTower();
  startGame();
}

document.getElementById("pauseBtn").addEventListener("click", () => {
  isPaused = true;
});

document.getElementById("resumeBtn").addEventListener("click", () => {
  if (!isGameOver) {
    isPaused = false;
    requestAnimationFrame(startGame);
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  resetGame();
});

function startGame() {
  if (isPaused || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movePlayer();
  centerViewOnPlayer();
  drawGrid();
  drawBlackBuildings();
  drawShards();
  keydraw();
  drawFloatingTexts();
  drawPlayer();
  drawAllPowerUps();
  collisionWithAllPowerUps();
  collisionofkeyandplayer();
  fireBullet();
  checkShardUnlock();
  checkShardDelivery();

  for (let t = 0; t < towers.length; t++) {
    if (!towers[t].destroyed) {
      towers[t].angle += 0.01;
    }
  }
  drawTower();

  requestAnimationFrame(startGame);
}

function GameOver() {
  alert("Game Over!");
  isGameOver = true;
  document.querySelector("#gameOver").style.display = "flex";
  document.getElementById("gamemessage").textContent = "Game Over! Try Again.";
  document.getElementById("newGame").addEventListener("click", () => {
    document.querySelector("#gameOver").style.display = "none";
    resetGame();
  });
}

function GameWin() {
  alert("Game Over!");
  isGameOver = true;
  document.querySelector("#gameOver").style.display = "flex";
  document.getElementById("gamemessage").textContent =
    "congratulations!! system Heath : 100% ";
  document.getElementById("newGame").addEventListener("click", () => {
    document.querySelector("#gameOver").style.display = "none";
    resetGame();
  });
}

drawGrid();
generateBlackBuildings();
keygenerate();
gettower();
drawTower();
spawnAllPowerUps();
startGame();
systemhealth();
