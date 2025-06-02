import React, { useState, useCallback } from "react";

const BOARD_SIZE = 10;
const NUM_MINES = 10;

interface CellData {
    x: number;
    y: number;
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
};

type Board = CellData[][];

enum GameStatus {
    Playing = "playing",
    Won = "won",
    Lost = "lost",
}

function CellComponent(
    { cell, clickHandler, rightClickHandler }:
        {
            cell: CellData;
            clickHandler: (y: number, x: number) => void;
            rightClickHandler: (y: number, x: number) => void;
            // doubleClickHandler: (y: number, x: number) => void;
        }
) {

    // const [isClicked, setIsClicked] = useState<boolean>(false);

    const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        rightClickHandler(cell.y, cell.x);
    }

    // const handleClick = () => {
    //     if (isClicked) {
    //         setIsClicked(false);
    //         doubleClickHandler(cell.y, cell.x);
    //     } else {
    //         setIsClicked(true);
    //         setTimeout(() => {
    //             setIsClicked(false);
    //             clickHandler(cell.y, cell.x);
    //         }, 3000);
    //     }
    // }

    return (
        <button
            onClick={() => clickHandler(cell.y, cell.x)}
            onContextMenu={(e) => handleContextMenu(e)}
            className={`minesweeper-cell ${cell.isRevealed
                    ? "minesweeper-cell-revealed"
                    : "minesweeper-cell-hidden"
                }`}
        >
            {cell.isRevealed ? (
                cell.isMine ? "💣" :
                    cell.neighborMines > 0 ? cell.neighborMines : ""
            ) : cell.isFlagged ? "🚩" : ""}
        </button>
    );
}

function createBoard(): Board {

    const board: Board = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
        board[j] = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            board[j][i] = {
                x: i,
                y: j,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }

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

function Minesweeper() {
    const [board, setBoard] = useState<Board>(createBoard);
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Playing);

    const revealCell = useCallback((y: number, x: number): void => {
        if (gameStatus !== GameStatus.Playing || board[y][x].isRevealed || board[y][x].isFlagged) {
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
            setGameStatus(GameStatus.Lost);
            return;
        }

        const revealEmptyCells = (y: number, x: number): void => {
            if (y < 0 || y >= BOARD_SIZE || x < 0 || x >= BOARD_SIZE || newBoard[y][x].isRevealed || newBoard[y][x].isFlagged) {
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
            setGameStatus(GameStatus.Won);
        }
    }, [board, gameStatus]);

    const toggleFlag = useCallback((y: number, x: number): void => {
        if (gameStatus !== GameStatus.Playing || board[y][x].isRevealed) {
            return;
        }

        const newBoard: Board = board.map(row => row.map(cell => ({ ...cell })));
        newBoard[y][x].isFlagged = !newBoard[y][x].isFlagged;
        setBoard(newBoard);
    }, [board, gameStatus]);

    const handleCellClick = (y: number, x: number): void => {
        revealCell(y, x);
    };

    const resetGame = (): void => {
        setBoard(createBoard());
        setGameStatus(GameStatus.Playing);
        // setFlagMode(false);
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
                <div className="minesweeper-status">
                    {gameStatus === GameStatus.Won ? "🎉 You GameStatus.Won!" :
                        gameStatus === GameStatus.Lost ? "💥 Game Over!" :
                            `Mines: ${NUM_MINES}`}
                </div>
            </div>

            <div className="minesweeper-board">
                {board.map((row, y) => (
                    <div key={y} className="minesweeper-row">
                        {row.map((cell) =>
                        (
                            <CellComponent
                                key={`${cell.y}-${cell.x}`}
                                cell={cell}
                                clickHandler={handleCellClick}
                                rightClickHandler={toggleFlag}
                                // doubleClickHandler={(x, y) => console.log(`Double click at ${x}, ${y}`)}
                            />
                        )
                        )}
                    </div>
                ))}
            </div>
        </div>

    );
};

export default Minesweeper;

