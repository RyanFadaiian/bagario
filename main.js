const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Resize canvas to match CSS size (important for crisp rendering)
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
}
window.addEventListener("resize", resize);
resize();

// World + player
const world = { width: 4000, height: 4000 };

const player = {
  x: world.width / 2,
  y: world.height / 2,
  r: 30,
  speed: 260, // pixels/sec
};

const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Main loop
let last = performance.now();
function loop(now) {
  const dt = (now - last) / 1000;
  last = now;

  update(dt);
  render();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function update(dt) {
  // Convert mouse direction (screen space) into movement in world space
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  let dx = mouse.x - cx;
  let dy = mouse.y - cy;

  const len = Math.hypot(dx, dy);
  if (len > 0.0001) {
    dx /= len;
    dy /= len;

    // Optional: slow down when mouse is near center (feels nicer)
    const strength = clamp(len / 250, 0, 1);

    player.x += dx * player.speed * strength * dt;
    player.y += dy * player.speed * strength * dt;
  }

  // Keep player inside the world
  player.x = clamp(player.x, player.r, world.width - player.r);
  player.y = clamp(player.y, player.r, world.height - player.r);
}

function render() {
  // Camera centers on player
  const camX = player.x - window.innerWidth / 2;
  const camY = player.y - window.innerHeight / 2;

  // Clear
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Background
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // Grid (helps visually)
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;

  const grid = 80;
  const startX = Math.floor(camX / grid) * grid;
  const startY = Math.floor(camY / grid) * grid;

  for (let x = startX; x < camX + window.innerWidth; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x - camX, 0);
    ctx.lineTo(x - camX, window.innerHeight);
    ctx.stroke();
  }
  for (let y = startY; y < camY + window.innerHeight; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y - camY);
    ctx.lineTo(window.innerWidth, y - camY);
    ctx.stroke();
  }

  // World border
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 4;
  ctx.strokeRect(-camX, -camY, world.width, world.height);

  // Player
  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.arc(player.x - camX, player.y - camY, player.r, 0, Math.PI * 2);
  ctx.fill();

  // Simple UI text
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(`Player: (${player.x.toFixed(0)}, ${player.y.toFixed(0)})`, 12, 22);
  ctx.fillText(`Move: mouse direction`, 12, 42);
}