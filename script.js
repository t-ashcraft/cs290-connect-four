const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1;
const AI = 2;

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const restartButton = document.getElementById("restart");
const columnButtons = Array.from(document.querySelectorAll(".col-btn"));

let board = createEmptyBoard();
let currentPlayer = PLAYER;
let gameOver = false;

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function createBoardUI() {
  boardElement.innerHTML = "";

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      boardElement.appendChild(cell);
    }
  }
}

function renderBoard() {
  const cells = boardElement.children;

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const index = row * COLS + col;
      const value = board[row][col];
      cells[index].classList.remove("yellow", "red");

      if (value === PLAYER) {
        cells[index].classList.add("yellow");
      } else if (value === AI) {
        cells[index].classList.add("red");
      }
    }
  }
}

function getOpenRow(col) {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][col] === EMPTY) {
      return row;
    }
  }

  return -1;
}

function dropPiece(col, player) {
  const openRow = getOpenRow(col);

  if (openRow === -1) {
    return null;
  }

  board[openRow][col] = player;
  return { row: openRow, col };
}

function isBoardFull() {
  for (let col = 0; col < COLS; col += 1) {
    if (board[0][col] === EMPTY) {
      return false;
    }
  }

  return true;
}

function checkDirection(row, col, rowStep, colStep, player) {
  let count = 0;

  for (let offset = -3; offset <= 3; offset += 1) {
    const r = row + offset * rowStep;
    const c = col + offset * colStep;

    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      count += 1;
      if (count >= 4) {
        return true;
      }
    } else {
      count = 0;
    }
  }

  return false;
}

function checkWin(row, col, player) {
  return (
    checkDirection(row, col, 0, 1, player) ||
    checkDirection(row, col, 1, 0, player) ||
    checkDirection(row, col, 1, 1, player) ||
    checkDirection(row, col, 1, -1, player)
  );
}

function updateStatus(message) {
  statusElement.textContent = message;
}

function setGameOver(message) {
  gameOver = true;
  updateStatus(message);
}

function availableColumns() {
  const options = [];

  for (let col = 0; col < COLS; col += 1) {
    if (board[0][col] === EMPTY) {
      options.push(col);
    }
  }

  return options;
}

function aiTurn() {
  if (gameOver) {
    return;
  }

  const freeCols = availableColumns();
  if (freeCols.length === 0) {
    setGameOver("Draw! Board is full.");
    return;
  }

  const randomCol = freeCols[Math.floor(Math.random() * freeCols.length)];
  const move = dropPiece(randomCol, AI);

  if (!move) {
    return;
  }

  renderBoard();

  if (checkWin(move.row, move.col, AI)) {
    setGameOver("Red wins. Press Restart to play again.");
    return;
  }

  if (isBoardFull()) {
    setGameOver("Draw! Board is full.");
    return;
  }

  currentPlayer = PLAYER;
  updateStatus("Your turn (Yellow)");
}

function playerMove(col) {
  if (gameOver || currentPlayer !== PLAYER) {
    return;
  }

  const move = dropPiece(col, PLAYER);

  // If the selected column is full, ignore the move.
  if (!move) {
    return;
  }

  renderBoard();

  if (checkWin(move.row, move.col, PLAYER)) {
    setGameOver("Yellow wins. Press Restart to play again.");
    return;
  }

  if (isBoardFull()) {
    setGameOver("Draw! Board is full.");
    return;
  }

  currentPlayer = AI;
  updateStatus("AI thinking...");
  window.setTimeout(aiTurn, 320);
}

function onColumnButtonClick(event) {
  const col = Number(event.currentTarget.dataset.col);

  if (Number.isInteger(col) && col >= 0 && col < COLS) {
    playerMove(col);
  }
}

function onKeydown(event) {
  const keyNum = Number(event.key);

  if (!Number.isInteger(keyNum) || keyNum < 1 || keyNum > 7) {
    return;
  }

  playerMove(keyNum - 1);
}

function restartGame() {
  board = createEmptyBoard();
  currentPlayer = PLAYER;
  gameOver = false;
  renderBoard();
  updateStatus("Your turn (Yellow)");
}

function bindEvents() {
  columnButtons.forEach((button) => {
    button.addEventListener("click", onColumnButtonClick);
  });

  document.addEventListener("keydown", onKeydown);
  restartButton.addEventListener("click", restartGame);
}

function init() {
  createBoardUI();
  renderBoard();
  bindEvents();
  updateStatus("Your turn (Yellow)");
}

init();
