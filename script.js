const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const YELLOW = 1;
const RED = 2;

const MODE_TWO_PLAYER = "two-player";
const MODE_EASY = "easy";
const MODE_HARD = "hard";
const MODE_TWO_AI = "two-ai";

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const columnButtons = Array.from(document.querySelectorAll(".col-btn"));
const modeButtons = {
  [MODE_TWO_PLAYER]: document.getElementById("mode-2p"),
  [MODE_EASY]: document.getElementById("mode-easy"),
  [MODE_HARD]: document.getElementById("mode-hard"),
  [MODE_TWO_AI]: document.getElementById("mode-2ai")
};

let board = createEmptyBoard();
let currentPlayer = YELLOW;
let gameOver = false;
let gameMode = MODE_EASY;

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

      if (value === YELLOW) {
        cells[index].classList.add("yellow");
      } else if (value === RED) {
        cells[index].classList.add("red");
      }
    }
  }
}

function currentPlayerName() {
  return currentPlayer === YELLOW ? "Yellow" : "Red";
}

function currentPlayerClass() {
  return currentPlayer === YELLOW ? "yellow" : "red";
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

function getRandomMove() {
  const freeCols = availableColumns();
  if (freeCols.length === 0) {
    return null;
  }

  return freeCols[Math.floor(Math.random() * freeCols.length)];
}

function getWinningMove(player) {
  const freeCols = availableColumns();

  for (const col of freeCols) {
    const row = getOpenRow(col);
    board[row][col] = player;
    const wins = checkWin(row, col, player);
    board[row][col] = EMPTY;

    if (wins) {
      return col;
    }
  }

  return null;
}

function getHardMove(player) {
  const winningMove = getWinningMove(player);
  if (winningMove !== null) {
    return winningMove;
  }

  const opponent = player === YELLOW ? RED : YELLOW;
  const blockingMove = getWinningMove(opponent);
  if (blockingMove !== null) {
    return blockingMove;
  }

  return getRandomMove();
}

function isHumanTurn() {
  if (gameMode === MODE_TWO_PLAYER) {
    return true;
  }

  if (gameMode === MODE_EASY || gameMode === MODE_HARD) {
    return currentPlayer === YELLOW;
  }

  return false;
}

function getAiMove(player) {
  if (gameMode === MODE_EASY) {
    return getRandomMove();
  }

  if (gameMode === MODE_HARD || gameMode === MODE_TWO_AI) {
    return getHardMove(player);
  }

  return null;
}

function completeTurnAndContinue(movePlayer, move) {
  renderBoard();

  if (checkWin(move.row, move.col, movePlayer)) {
    setGameOver(`${movePlayer === YELLOW ? "Yellow" : "Red"} wins! Choose a mode to restart.`);
    return;
  }

  if (isBoardFull()) {
    setGameOver("Draw! Board is full. Choose a mode to restart.");
    return;
  }

  currentPlayer = movePlayer === YELLOW ? RED : YELLOW;
  scheduleNextTurn();
}

function aiTurn() {
  if (gameOver || isHumanTurn()) {
    return;
  }

  const aiMove = getAiMove(currentPlayer);
  if (aiMove === null) {
    setGameOver("Draw! Board is full. Choose a mode to restart.");
    return;
  }

  const move = dropPiece(aiMove, currentPlayer);
  if (!move) {
    return;
  }

  completeTurnAndContinue(currentPlayer, move);
}

function humanMove(col) {
  if (gameOver || !isHumanTurn()) {
    return;
  }

  const move = dropPiece(col, currentPlayer);

  // If the selected column is full, ignore the move.
  if (!move) {
    return;
  }

  completeTurnAndContinue(currentPlayer, move);
}

function onColumnButtonClick(event) {
  const col = Number(event.currentTarget.dataset.col);

  if (Number.isInteger(col) && col >= 0 && col < COLS) {
    humanMove(col);
  }
}

function onKeydown(event) {
  const keyNum = Number(event.key);

  if (!Number.isInteger(keyNum) || keyNum < 1 || keyNum > 7) {
    return;
  }

  humanMove(keyNum - 1);
}

function setModeButtons() {
  Object.entries(modeButtons).forEach(([mode, button]) => {
    button.classList.toggle("active", mode === gameMode);
  });
}

function scheduleNextTurn() {
  if (gameOver) {
    return;
  }

  if (isHumanTurn()) {
    updateStatus(`${currentPlayerName()} turn`);
    return;
  }

  updateStatus(`${currentPlayerName()} AI thinking...`);
  window.setTimeout(aiTurn, 300);
}

function startGame(mode) {
  gameMode = mode;
  board = createEmptyBoard();
  currentPlayer = YELLOW;
  gameOver = false;
  setModeButtons();
  renderBoard();
  scheduleNextTurn();
}

function bindEvents() {
  columnButtons.forEach((button) => {
    button.addEventListener("click", onColumnButtonClick);
  });

  document.addEventListener("keydown", onKeydown);
  modeButtons[MODE_TWO_PLAYER].addEventListener("click", () => startGame(MODE_TWO_PLAYER));
  modeButtons[MODE_EASY].addEventListener("click", () => startGame(MODE_EASY));
  modeButtons[MODE_HARD].addEventListener("click", () => startGame(MODE_HARD));
  modeButtons[MODE_TWO_AI].addEventListener("click", () => startGame(MODE_TWO_AI));
}

function init() {
  createBoardUI();
  renderBoard();
  bindEvents();
  startGame(MODE_EASY);
}

init();
