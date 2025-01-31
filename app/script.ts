type Player = "X" | "O";
type Cell = Player | null;
type Board = Cell[][];

const ROWS = 10;
const COLS = 10;
const WIN_CONDITION = 5;
const memo: Map<string, number> = new Map();

let board: Board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentPlayer: Player = "X";
let gameOver = false;

const boardElement = document.getElementById("board")!;

// Initialize the board
function initializeBoard() {
  boardElement.innerHTML = "";
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row.toString();
      cell.dataset.col = col.toString();
      cell.addEventListener("click", handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

// Handle cell click
function handleCellClick(event: Event) {
  if (gameOver) return;

  const target = event.target as HTMLElement;
  const row = parseInt(target.dataset.row!);
  const col = parseInt(target.dataset.col!);

  if (board[row][col] !== null) return;

  board[row][col] = currentPlayer;
  target.classList.add(currentPlayer);
  target.textContent = currentPlayer;

  if (checkWin(row, col, currentPlayer)) {
    alert(`${currentPlayer} wins!`);
    gameOver = true;
    return;
  }

  if (checkDraw()) {
    alert("It's a draw!");
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (currentPlayer === "O") {
    aiMove();
  }
}

// Check for a win
function checkWin(row: number, col: number, player: Player): boolean {
  const directions = [
    [1, 0], // Vertical
    [0, 1], // Horizontal
    [1, 1], // Diagonal (top-left to bottom-right)
    [1, -1], // Diagonal (top-right to bottom-left)
  ];

  for (const [dx, dy] of directions) {
    let count = 1;

    // Check in the positive direction
    let x = row + dx;
    let y = col + dy;
    while (x >= 0 && x < ROWS && y >= 0 && y < COLS && board[x][y] === player) {
      count++;
      x += dx;
      y += dy;
    }

    // Check in the negative direction
    x = row - dx;
    y = col - dy;
    while (x >= 0 && x < ROWS && y >= 0 && y < COLS && board[x][y] === player) {
      count++;
      x -= dx;
      y -= dy;
    }

    if (count >= WIN_CONDITION) return true;
  }

  return false;
}

// Check for a draw
function checkDraw(): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

// AI move using Minimax with Alpha-Beta pruning
function aiMove() {
  let bestScore = -Infinity;
  let bestMove: [number, number] | null = null;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] === null) {
        board[row][col] = "O";
        let score = minimax(board, 0, false, -Infinity, Infinity);
        board[row][col] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = [row, col];
        }
      }
    }
  }

  if (bestMove) {
    const [row, col] = bestMove;
    board[row][col] = "O";
    const cell = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`,
    ) as HTMLElement;
    cell.classList.add("O");
    cell.textContent = "O";

    if (checkWin(row, col, "O")) {
      alert("O wins!");
      gameOver = true;
      return;
    }

    if (checkDraw()) {
      alert("It's a draw!");
      gameOver = true;
      return;
    }

    currentPlayer = "X";
  }
}
function evaluateBoard(board: Board): number {
  let score = 0;

  // Check all possible winning lines
  const directions = [
    [1, 0], // Vertical
    [0, 1], // Horizontal
    [1, 1], // Diagonal (top-left to bottom-right)
    [1, -1], // Diagonal (top-right to bottom-left)
  ];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] === null) continue;

      const player = board[row][col];

      for (const [dx, dy] of directions) {
        let countO = 0;
        let countX = 0;

        for (let step = 0; step < WIN_CONDITION; step++) {
          const x = row + step * dx;
          const y = col + step * dy;

          if (x >= 0 && x < ROWS && y >= 0 && y < COLS) {
            if (board[x][y] === "O") countO++;
            else if (board[x][y] === "X") countX++;
          }
        }

        if (countO > 0 && countX === 0) {
          if (countO === 4) score += 50;
          else if (countO === 3) score += 10;
          else if (countO === 2) score += 1;
        } else if (countX > 0 && countO === 0) {
          if (countX === 4) score -= 50;
          else if (countX === 3) score -= 10;
          else if (countX === 2) score -= 1;
        }
      }
    }
  }

  return score;
}
// Minimax algorithm with Alpha-Beta pruning
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
): number {
  const boardKey = board.flat().join(",");
  if (memo.has(boardKey)) return memo.get(boardKey)!;
  if (checkWinForPlayer("O")) return 10 - depth;
  if (checkWinForPlayer("X")) return depth - 10;
  if (checkDraw() || depth >= 2) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] === null) {
          board[row][col] = "O";
          bestScore = Math.max(
            bestScore,
            evaluateBoard(board) +
              minimax(board, depth + 1, false, alpha, beta),
          );
          board[row][col] = null;
          alpha = Math.max(alpha, bestScore);
          if (beta <= alpha) break;
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] === null) {
          board[row][col] = "X";
          bestScore = Math.min(
            bestScore,
            minimax(board, depth + 1, true, alpha, beta),
          );
          board[row][col] = null;
          beta = Math.min(beta, bestScore);
          if (beta <= alpha) break;
        }
      }
    }
    memo.set(boardKey, bestScore);
    return bestScore;
  }
}

// Check if a specific player has won
function checkWinForPlayer(player: Player): boolean {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] === player && checkWin(row, col, player)) {
        return true;
      }
    }
  }
  return false;
}

// Start the game
initializeBoard();
