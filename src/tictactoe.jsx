import React, { useState } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Player X's turn");
  const [winningCells, setWinningCells] = useState([]);

  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const handleClick = (index) => {
    if (gameOver || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const winCombo = checkWin(newBoard);
    if (winCombo) {
      setWinningCells(winCombo);
      setMessage(`Player ${currentPlayer} wins!`);
      setGameOver(true);
    } else if (newBoard.every(cell => cell)) {
      setMessage("It's a tie!");
      setGameOver(true);
    } else {
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      setMessage(`Player ${nextPlayer}'s turn`);
    }
  };

  const checkWin = (currentBoard) => {
    return winningCombos.find(combo => 
      combo.every(i => currentBoard[i] === currentPlayer)
    );
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameOver(false);
    setMessage("Player X's turn");
    setWinningCells([]);
  };

  const getCellClassName = (index, value) => {
    let className = 'cell rounded border d-flex justify-content-center align-items-center position-relative bg-custom';
    if (value) className += ' cell-filled';
    if (winningCells.includes(index)) className += ' winner';
    return className;
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <style>
        {`
          .cell {
            height: 100px;
            cursor: pointer;
            font-size: 2rem;
            font-weight: bold;
            transition: all 0.3s ease;
            transform-style: preserve-3d;
            background: white;
          }

          .cell:hover:not(.cell-filled) {
            background: darkslateblue;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .cell-filled {
            animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          .bg-custom {
            background-color: #31325e;
         }

          @keyframes popIn {
            0% {
              transform: scale(0.5);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .winner {
            animation: winner 1s ease infinite;
            background: #439965;
          }

          @keyframes winner {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          .card {
            max-width: 400px;
            animation: slideIn 0.5s ease;
            border: none;
            background-color: #354262;
            border-radius: 12px;
          }

          @keyframes slideIn {
            0% {
              transform: translateY(20px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .btn {
            transition: all 0.3s ease;
          }

          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .message-text {
            animation: fadeIn 0.3s ease;
          }

          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div className="card shadow p-4 text-white">
        <div className="text-center">
          <h1 className="display-5 mb-4 gradient-text text-bold">TIC TAC TOE</h1>
          <p className="mb-4">
            Tap on a box to play.<br />
            <strong>Player X</strong> starts first, followed by{' '}
            <strong>Player O</strong>.
          </p>
          
          <div className="row g-2 mb-4">
            {board.map((cell, index) => (
              <div className="col-4" key={index}>
                <div
                  data-index={index}
                  className={getCellClassName(index, cell)}
                  onClick={() => handleClick(index)}
                >
                  {cell}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={reset}
            className="btn btn-outline-custom mb-4"
          >
            RESET
          </button>

          <p className="h5 fw-bold message-text">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;