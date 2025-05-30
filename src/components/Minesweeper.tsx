import React, { useState, useCallback } from 'react';

const BOARD_SIZE = 10;
const NUM_MINES = 10;

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

type Board = Cell[][];
type GameStatus = 'playing' | 'won' | 'lost';

const createBoard = (): Board => {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill(null).map((): Cell => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0
    }))
  );
  
  // Place mines randomly
  let minesPlaced = 0;
  while (minesPlaced < NUM_MINES) {
    const x = Math.floor(Math.random() * BOARD_SIZE);
    const y = Math.floor(Math.random() * BOARD_SIZE);
    
    if (!board[y][x].isMine) {
      board[y][x].isMine = true;
      minesPlaced++;
      
      // Update neighbor counts
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const newY = y + i;
          const newX = x + j;
          if (newY >= 0 && newY < BOARD_SIZE && newX >= 0 && newX < BOARD_SIZE) {
            board[newY][newX].neighborMines++;
          }
        }
      }
    }
  }
  
  return board;
};

const Minesweeper: React.FC = () => {
  const [board, setBoard] = useState<Board>(createBoard);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [flagMode, setFlagMode] = useState<boolean>(false);

  const revealCell = useCallback((y: number, x: number): void => {
    if (gameStatus !== 'playing' || board[y][x].isRevealed || board[y][x].isFlagged) {
      return;
    }

    const newBoard: Board = board.map(row => row.map(cell => ({ ...cell })));
    
    if (board[y][x].isMine) {
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (newBoard[i][j].isMine) {
            newBoard[i][j].isRevealed = true;
          }
        }
      }
      setBoard(newBoard);
      setGameStatus('lost');
      return;
    }

    const revealEmptyCells = (y: number, x: number): void => {
      if (y < 0 || y >= BOARD_SIZE || x < 0 || x >= BOARD_SIZE || 
          newBoard[y][x].isRevealed || newBoard[y][x].isFlagged) {
        return;
      }

      newBoard[y][x].isRevealed = true;

      if (newBoard[y][x].neighborMines === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            revealEmptyCells(y + i, x + j);
          }
        }
      }
    };

    revealEmptyCells(y, x);
    setBoard(newBoard);

    let unrevealedSafeCells = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (!newBoard[i][j].isRevealed && !newBoard[i][j].isMine) {
          unrevealedSafeCells++;
        }
      }
    }
    if (unrevealedSafeCells === 0) {
      setGameStatus('won');
    }
  }, [board, gameStatus]);

  const toggleFlag = useCallback((y: number, x: number): void => {
    if (gameStatus !== 'playing' || board[y][x].isRevealed) {
      return;
    }

    const newBoard: Board = board.map(row => row.map(cell => ({ ...cell })));
    newBoard[y][x].isFlagged = !newBoard[y][x].isFlagged;
    setBoard(newBoard);
  }, [board, gameStatus]);

  const handleCellClick = (y: number, x: number): void => {
    if (flagMode) {
      toggleFlag(y, x);
    } else {
      revealCell(y, x);
    }
  };

  const resetGame = (): void => {
    setBoard(createBoard());
    setGameStatus('playing');
    setFlagMode(false);
  };

  return (
    <div className="minesweeper-container">
      <div className="minesweeper-controls">
        <button 
          onClick={resetGame}
          className="minesweeper-button minesweeper-button-primary"
        >
          New Game
        </button>
        <button 
          onClick={() => setFlagMode(!flagMode)}
          className={`minesweeper-button ${
            flagMode ? 'minesweeper-button-active' : 'minesweeper-button-secondary'
          }`}
        >
          {flagMode ? 'Flag Mode (On)' : 'Flag Mode (Off)'}
        </button>
        <div className="minesweeper-status">
          {gameStatus === 'won' ? '🎉 You Won!' : 
           gameStatus === 'lost' ? '💥 Game Over!' : 
           `Mines: ${NUM_MINES}`}
        </div>
      </div>
      
      <div className="minesweeper-board">
        {board.map((row, y) => (
          <div key={y} className="minesweeper-row">
            {row.map((cell, x) => (
              <button
                key={`${y}-${x}`}
                onClick={() => handleCellClick(y, x)}
                className={`minesweeper-cell ${
                  cell.isRevealed
                    ? 'minesweeper-cell-revealed'
                    : 'minesweeper-cell-hidden'
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? '💣' :
                  cell.neighborMines > 0 ? cell.neighborMines : ''
                ) : cell.isFlagged ? '🚩' : ''}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Minesweeper;

