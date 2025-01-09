import React, { useState, useEffect } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Player X's turn");
  const [winningCells, setWinningCells] = useState([]);
  const [gameMode, setGameMode] = useState('pvp'); // 'pvp' or 'pvc'
  const [difficulty, setDifficulty] = useState('easy'); // 'easy', 'medium', 'hard'
  const [playerSymbol, setPlayerSymbol] = useState('X');

  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  // Проверка на выигрыш
  const checkWin = (currentBoard) => {
    return winningCombos.find(combo => 
      combo.every(i => currentBoard[i] === currentPlayer)
    );
  };

  // Получить все свободные клетки
  const getEmptyCells = (currentBoard) => {
    return currentBoard.reduce((acc, cell, index) => {
      if (!cell) acc.push(index);
      return acc;
    }, []);
  };

  // Минимакс алгоритм для сложного уровня
  const minimax = (board, depth, isMaximizing) => {
    const result = checkGameResult(board);
    if (result !== null) {
      return result === 'tie' ? 0 : (result === playerSymbol ? -1 : 1);
    }

    const emptyCells = getEmptyCells(board);
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i of emptyCells) {
        board[i] = playerSymbol === 'X' ? 'O' : 'X';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i of emptyCells) {
        board[i] = playerSymbol;
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
      return bestScore;
    }
  };

  // Проверка результата игры
  const checkGameResult = (currentBoard) => {
    for (let combo of winningCombos) {
      if (combo.every(i => currentBoard[i] === 'X')) return 'X';
      if (combo.every(i => currentBoard[i] === 'O')) return 'O';
    }
    return currentBoard.every(cell => cell) ? 'tie' : null;
  };

  // ИИ делает ход
  const computerMove = () => {
    const emptyCells = getEmptyCells(board);
    if (!emptyCells.length) return;

    let move;
    
    if (difficulty === 'easy') {
      // Случайный ход
      move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } 
    else if (difficulty === 'medium') {
      // Попытка выиграть или заблокировать победу противника
      const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
      
      // Проверка выигрышного хода
      move = findWinningMove(board, computerSymbol);
      
      // Блокировка победы игрока
      if (move === undefined) {
        move = findWinningMove(board, playerSymbol);
      }
      
      // Случайный ход, если нет выигрышных позиций
      if (move === undefined) {
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }
    else if (difficulty === 'hard') {
      // Использование минимакс алгоритма
      let bestScore = -Infinity;
      move = emptyCells[0];
      
      for (let i of emptyCells) {
        const newBoard = [...board];
        newBoard[i] = playerSymbol === 'X' ? 'O' : 'X';
        const score = minimax(newBoard, 0, false);
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    handleClick(move);
  };

  // Поиск выигрышного хода
  const findWinningMove = (currentBoard, symbol) => {
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const testBoard = [...currentBoard];
        testBoard[i] = symbol;
        for (let combo of winningCombos) {
          if (combo.every(j => testBoard[j] === symbol)) {
            return i;
          }
        }
      }
    }
  };

  // Обработка хода
  const handleClick = (index) => {
    if (gameOver || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const winCombo = checkWin(newBoard);
    if (winCombo) {
      setWinningCells(winCombo);
      setMessage(`${currentPlayer === playerSymbol ? 'You win!' : 'Computer wins!'}`);
      setGameOver(true);
    } else if (newBoard.every(cell => cell)) {
      setMessage("Ничья!");
      setGameOver(true);
    } else {
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      setMessage(gameMode === 'pvp' ? `${nextPlayer} player's turn` : 
        (nextPlayer === playerSymbol ? 'Your turn' : `Computer's turn`));
    }
  };

  // Эффект для хода компьютера
  useEffect(() => {
    if (gameMode === 'pvc' && currentPlayer !== playerSymbol && !gameOver) {
      const timer = setTimeout(() => {
        computerMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode]);

  // Сброс игры
  const reset = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameOver(false);
    setMessage(gameMode === 'pvp' ? "Player X's turn" : 
      (playerSymbol === 'X' ? 'Your turn' : `Computer's turn`));
    setWinningCells([]);
  };

  const getCellClassName = (index, value) => {
    let className = 'cell rounded border d-flex justify-content-center align-items-center position-relative bg-custom';
    if (value) className += ' cell-filled';
    if (winningCells.includes(index)) className += ' winner';
    return className;
  };

  // Изменение режима игры
  const handleGameModeChange = (mode) => {
    setGameMode(mode);
    setGameOver(false);
    reset();
  };

  // Изменение сложности
  const handleDifficultyChange = (level) => {
    setDifficulty(level);
    if (!gameOver) reset();
  };

  // Изменение символа игрока
  const handleSymbolChange = (symbol) => {
    setPlayerSymbol(symbol);
    reset();
    if (symbol === 'O') {
      setCurrentPlayer('X');
      setMessage('Computer\'s turn');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 scale-09">
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
          
          .btn-custom {
            background-color: #31325e;
            color: white;
            border: 1px solid #31325e;
          }
          
          .btn-custom:hover {
            background-color: #439965;
            border-color: #439965;
          }
          
          .btn-custom.active {
            background-color: #439965;
            border-color: #439965;
          }
        `}
      </style>

      <div className="card shadow p-4 text-white">
        <div className="text-center">
          <h1 className="display-5 mb-4 gradient-text text-bold">TIC TAC TOE</h1>
          
          {/* Game Mode Selection */}
          <div className="mb-4">
            <div className="btn-group">
              <button 
                className={`btn btn-custom ${gameMode === 'pvp' ? 'active' : ''}`}
                onClick={() => handleGameModeChange('pvp')}
              >
                Player vs Player
              </button>
              <button 
                className={`btn btn-custom ${gameMode === 'pvc' ? 'active' : ''}`}
                onClick={() => handleGameModeChange('pvc')}
              >
                Player vs Computer
              </button>
            </div>
          </div>

          {/* Computer Game Options */}
          {gameMode === 'pvc' && (
            <div className="mb-4">
              <div className="mb-3">
                <label className="mb-2">Difficulty:</label>
                <div className="btn-group">
                  <button 
                    className={`btn btn-custom ${difficulty === 'easy' ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange('easy')}
                  >
                    Easy
                  </button>
                  <button 
                    className={`btn btn-custom ${difficulty === 'medium' ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange('medium')}
                  >
                    Medium
                  </button>
                  <button 
                    className={`btn btn-custom ${difficulty === 'hard' ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange('hard')}
                  >
                    Hard
                  </button>
                </div>
              </div>
              
              <div>
                <label className="mb-2">Player Symbol:</label>
                <div className="btn-group">
                  <button 
                    className={`btn btn-custom ${playerSymbol === 'X' ? 'active' : ''}`}
                    onClick={() => handleSymbolChange('X')}
                  >
                    X
                  </button>
                  <button 
                    className={`btn btn-custom ${playerSymbol === 'O' ? 'active' : ''}`}
                    onClick={() => handleSymbolChange('O')}
                  >
                    O
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="row g-2 mb-4">
            {board.map((cell, index) => (
              <div className="col-4" key={index}>
                <div
                  data-index={index}
                  className={getCellClassName(index, cell)}
                  onClick={() => {
                    if (gameMode === 'pvc' && currentPlayer !== playerSymbol) return;
                    handleClick(index);
                  }}
                >
                  {cell}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={reset}
            className="btn btn-custom mb-4"
          >
            Reset
          </button>

          <p className="h5 fw-bold message-text">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;