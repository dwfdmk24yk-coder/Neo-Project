const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const nextPieceEl = document.querySelector("#next-piece");

const config = {
  rows: 6,
  cols: 6,
  tileWidth: 80,
  tileHeight: 40,
  originX: canvas.width / 2,
  originY: 140,
};

const colors = [
  { id: "blue", label: "Lam" },
  { id: "pink", label: "Hồng" },
  { id: "green", label: "Lục" },
];

class AssetLoader {
  constructor() {
    this.assets = new Map();
  }

  loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.assets.set(key, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Không thể tải asset: ${src}`));
      img.src = src;
    });
  }

  get(key) {
    return this.assets.get(key);
  }
}

const loader = new AssetLoader();
let grid = [];
let hoverCell = null;
let status = "playing";
let nextPieceIndex = 0;

const assets = {
  tile: "assets/tile_base.svg",
  blue: "assets/diamond_blue.svg",
  pink: "assets/diamond_pink.svg",
  green: "assets/diamond_green.svg",
};

function initGrid() {
  grid = Array.from({ length: config.rows }, () => Array(config.cols).fill(null));
}

function setStatus(message) {
  statusEl.textContent = message;
}

function setNextPiece(index) {
  nextPieceIndex = index;
  nextPieceEl.textContent = colors[nextPieceIndex].label;
}

function resetGame() {
  initGrid();
  hoverCell = null;
  status = "playing";
  setStatus("Đang chơi...");
  setNextPiece(Math.floor(Math.random() * colors.length));
}

function gridToScreen(row, col) {
  const x = config.originX + (col - row) * (config.tileWidth / 2);
  const y = config.originY + (col + row) * (config.tileHeight / 2);
  return { x, y };
}

function isPointInDiamond(px, py, cx, cy) {
  const dx = Math.abs(px - cx);
  const dy = Math.abs(py - cy);
  return dx / (config.tileWidth / 2) + dy / (config.tileHeight / 2) <= 1;
}

function getCellAt(x, y) {
  for (let row = 0; row < config.rows; row += 1) {
    for (let col = 0; col < config.cols; col += 1) {
      const { x: cx, y: cy } = gridToScreen(row, col);
      if (isPointInDiamond(x, y, cx, cy)) {
        return { row, col };
      }
    }
  }
  return null;
}

function hasMatch() {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  for (let row = 0; row < config.rows; row += 1) {
    for (let col = 0; col < config.cols; col += 1) {
      const cell = grid[row][col];
      if (!cell) continue;

      for (const { dr, dc } of directions) {
        let count = 1;
        for (let step = 1; step < 3; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (r < 0 || r >= config.rows || c < 0 || c >= config.cols) break;
          if (grid[r][c] === cell) {
            count += 1;
          } else {
            break;
          }
        }
        if (count >= 3) return true;
      }
    }
  }

  return false;
}

function isBoardFull() {
  return grid.every((row) => row.every((cell) => cell !== null));
}

function placePiece(cell) {
  if (!cell || status !== "playing") return;
  const { row, col } = cell;
  if (grid[row][col]) return;

  const color = colors[nextPieceIndex];
  grid[row][col] = color.id;

  if (hasMatch()) {
    status = "won";
    setStatus("Bạn đã thắng! ✨");
  } else if (isBoardFull()) {
    status = "lost";
    setStatus("Hết chỗ rồi! Bạn đã thua.");
  } else {
    setNextPiece(Math.floor(Math.random() * colors.length));
  }
}

function drawTile(x, y) {
  const tile = loader.get("tile");
  ctx.drawImage(tile, x - config.tileWidth / 2, y - config.tileHeight / 2);
}

function drawPiece(x, y, colorId) {
  const sprite = loader.get(colorId);
  ctx.drawImage(sprite, x - config.tileWidth / 2, y - config.tileHeight / 2);
}

function drawHover(x, y) {
  ctx.save();
  ctx.strokeStyle = "rgba(250, 204, 21, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - config.tileHeight / 2);
  ctx.lineTo(x + config.tileWidth / 2, y);
  ctx.lineTo(x, y + config.tileHeight / 2);
  ctx.lineTo(x - config.tileWidth / 2, y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < config.rows; row += 1) {
    for (let col = 0; col < config.cols; col += 1) {
      const { x, y } = gridToScreen(row, col);
      drawTile(x, y);
      const cell = grid[row][col];
      if (cell) {
        drawPiece(x, y, cell);
      }
    }
  }

  if (hoverCell && status === "playing") {
    const { x, y } = gridToScreen(hoverCell.row, hoverCell.col);
    drawHover(x, y);
  }

  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
  ctx.fillRect(20, 20, 260, 74);
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "16px 'Segoe UI', sans-serif";
  ctx.fillText(`Lượt kế: ${colors[nextPieceIndex].label}`, 32, 50);
  ctx.fillText(`Trạng thái: ${status === "playing" ? "Đang chơi" : status === "won" ? "Thắng" : "Thua"}`,
    32,
    74
  );
  ctx.restore();
}

function gameLoop() {
  render();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  hoverCell = getCellAt(x, y);
});

canvas.addEventListener("mouseleave", () => {
  hoverCell = null;
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  placePiece(getCellAt(x, y));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "r" || event.key === "R") {
    resetGame();
  }
  if (event.key === "1") setNextPiece(0);
  if (event.key === "2") setNextPiece(1);
  if (event.key === "3") setNextPiece(2);
});

Promise.all([
  loader.loadImage("tile", assets.tile),
  loader.loadImage("blue", assets.blue),
  loader.loadImage("pink", assets.pink),
  loader.loadImage("green", assets.green),
])
  .then(() => {
    resetGame();
    gameLoop();
  })
  .catch((error) => {
    setStatus("Không thể tải asset. Kiểm tra thư mục assets/");
    console.error(error);
  });
