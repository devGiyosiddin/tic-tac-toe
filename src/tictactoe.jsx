import React, { useState, useEffect, use } from 'react';
import { Trophy, UserCircle2, Monitor, Brain, RotateCcw, Crown } from 'lucide-react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Player X's turn");
  const [winningCells, setWinningCells] = useState([]);
  const [gameMode, setGameMode] = useState('pvp');
  const [difficulty, setDifficulty] = useState('easy');
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const [scores, setScores] = useState({ X: 0, O: 0, tie: 0 });
  const [winStreak, setWinStreak] = useState(0);

  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  // Оптимизированная проверка на выигрыш
  const checkWin = (currentBoard, player) => {
    return winningCombos.find(combo => 
      combo.every(i => currentBoard[i] === player)
    );
  };

  // Улучшенное получение пустых клеток
  const getEmptyCells = (currentBoard) => {
    return currentBoard.reduce((acc, cell, index) => 
      !cell ? [...acc, index] : acc, []);
  };

  // Оптимизированный минимакс алгоритм с альфа-бета отсечением
  const minimax = (board, depth, alpha, beta, isMaximizing) => {
    const result = checkGameResult(board);
    if (result !== null) {
      return result === 'tie' ? 0 : (result === playerSymbol ? -10 + depth : 10 - depth);
    }

    const emptyCells = getEmptyCells(board);
    const currentSymbol = isMaximizing ? (playerSymbol === 'X' ? 'O' : 'X') : playerSymbol;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i of emptyCells) {
        board[i] = currentSymbol;
        const score = minimax(board, depth + 1, alpha, beta, false);
        board[i] = null;
        maxScore = Math.max(score, maxScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i of emptyCells) {
        board[i] = currentSymbol;
        const score = minimax(board, depth + 1, alpha, beta, true);
        board[i] = null;
        minScore = Math.min(score, minScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  };

  const checkGameResult = (currentBoard) => {
    if (checkWin(currentBoard, 'X')) return 'X';
    if (checkWin(currentBoard, 'O')) return 'O';
    return currentBoard.every(cell => cell) ? 'tie' : null;
  };

  const computerMove = () => {
    const emptyCells = getEmptyCells(board);
    if (!emptyCells.length || gameOver) return;

    let move;
    const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
    
    switch (difficulty) {
      case 'easy':
        move = getRandomMove(emptyCells);
        break;
      case 'medium':
        move = getMediumMove(computerSymbol);
        break;
      case 'hard':
        move = getHardMove(computerSymbol);
        break;
      default:
        move = getRandomMove(emptyCells);
    }

    if (move !== undefined) handleClick(move);
  };

  const getRandomMove = (emptyCells) => {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const getMediumMove = (computerSymbol) => {
    // Попытка выиграть
    const winningMove = findWinningMove(board, computerSymbol);
    if (winningMove !== undefined) return winningMove;

    // Блокировка победы игрока
    const blockingMove = findWinningMove(board, playerSymbol);
    if (blockingMove !== undefined) return blockingMove;

    // Попытка занять центр
    if (!board[4]) return 4;

    // Случайный ход
    return getRandomMove(getEmptyCells(board));
  };

  const getHardMove = (computerSymbol) => {
    const emptyCells = getEmptyCells(board);
    let bestScore = -Infinity;
    let bestMove = emptyCells[0];

    for (let i of emptyCells) {
      const newBoard = [...board];
      newBoard[i] = computerSymbol;
      const score = minimax(newBoard, 0, -Infinity, Infinity, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }

    return bestMove;
  };


  const findWinningMove = (currentBoard, symbol) => {
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const testBoard = [...currentBoard];
        testBoard[i] = symbol;
        if (checkWin(testBoard, symbol)) return i;
      }
    }
    return undefined;
  };

  const handleClick = (index) => {
    if (gameOver || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const winCombo = checkWin(newBoard, currentPlayer);
    if (winCombo) {
      setWinningCells(winCombo);
      setMessage(gameMode === 'pvc' ? 
        `${currentPlayer === playerSymbol ? 'You win!' : 'Computer wins!'}` :
        `Player ${currentPlayer} wins!`);
      setScores(prevScores => ({ ...prevScores, [currentPlayer]: prevScores[currentPlayer] + 1 }));
      setGameOver(true);
    } else if (newBoard.every(cell => cell)) {
      setMessage("It's a tie!");
      setScores(prevScores => ({ ...prevScores, tie: prevScores.tie + 1 }));
      setGameOver(true);
    } else {
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      setMessage(gameMode === 'pvp' ? 
        `Player ${nextPlayer}'s turn` : 
        (nextPlayer === playerSymbol ? 'Your turn' : "Computer's turn"));
    }
  };

  useEffect(() => {
    if (gameMode === 'pvc' && currentPlayer !== playerSymbol && !gameOver) {
      const timer = setTimeout(computerMove, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, playerSymbol, gameOver]);

  const reset = () => {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setWinningCells([]);

    if (gameMode === 'pvc' && playerSymbol === 'O') {
      setCurrentPlayer('X');
      setMessage("Computer's turn");
      setTimeout(() => {
        const emptyCells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        const move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newBoard = Array(9).fill(null);
        newBoard[move] = 'X';
        setBoard(newBoard);
        setCurrentPlayer('O');
        setMessage('Your turn');
      }, 500);
    } else {
      setCurrentPlayer('X');
      setMessage(gameMode === 'pvp' ? "Player X's turn" : 
        (playerSymbol === 'X' ? 'Your turn' : "Computer's turn"));
    }
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, tie: 0 });
  };

  const handleGameModeChange = (mode) => {
    setGameMode(mode);
    setGameOver(false);
    reset();
  };

  const handleDifficultyChange = (level) => {
    setDifficulty(level);
    if (!gameOver) reset();
  };

  const handleSymbolChange = (symbol) => {
    setPlayerSymbol(symbol);
    reset();
  };

  const getCellClassName = (index, value) => {
    let className = 'cell rounded d-flex justify-content-center align-items-center position-relative';
    if (value) className += ' cell-filled';
    if (winningCells.includes(index)) className += ' winner';
    return className;
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4 text-white">
        <h1 className="display-5 mb-4 gradient-text text-bold text-center">TIC TAC TOE</h1>
        <div className="d-flex gap-3 mb-3 mx-250 mx-auto">
          <span><Trophy color='#ddcaca' size={20} /> X: {scores.X}</span>
          <span><Crown color='#ddcaca' size={20} /> O: {scores.O}</span>
          <span><UserCircle2 color='#ddcaca' size={20} /> Ties: {scores.tie}</span>
        </div>
        <div className="d-flex gap-3">
          <div className="text-center min-width-220">
            <div className="mb-4">
              <div className="btn-group d-flex flex-column gap-2">
                <button 
                  className={`btn btn-def rounded ${gameMode === 'pvp' ? 'active' : ''}`}
                  onClick={() => handleGameModeChange('pvp')}
                >
                  <UserCircle2 size={20} /> vs Player
                </button>
                <button 
                  className={`btn btn-def rounded ${gameMode === 'pvc' ? 'active' : ''}`}
                  onClick={() => handleGameModeChange('pvc')}
                >
                  <Monitor size={20} /> vs Computer
                </button>
              </div>
            </div>


            {gameMode === 'pvc' && (
              <div className="mb-4">
                <div className="mb-3">
                  <label className="mb-2">Difficulty:</label>
                  <div className="btn-group d-flex gap-2">
                    <button 
                      className={`btn btn-def ${difficulty === 'easy' ? 'active' : ''}`}
                      onClick={() => handleDifficultyChange('easy')}
                    >
                      Easy
                    </button>
                    <button 
                      className={`btn btn-def ${difficulty === 'medium' ? 'active' : ''}`}
                      onClick={() => handleDifficultyChange('medium')}
                    >
                      Medium
                    </button>
                    <button 
                      className={`btn btn-def ${difficulty === 'hard' ? 'active' : ''}`}
                      onClick={() => handleDifficultyChange('hard')}
                    >
                      Hard
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="mb-2">Your Symbol:</label>
                  <div className="btn-group d-flex gap-2">
                    <button 
                      className={`btn btn-def ${playerSymbol === 'X' ? 'active' : ''}`}
                      onClick={() => handleSymbolChange('X')}
                    >
                      X
                    </button>
                    <button 
                      className={`btn btn-def ${playerSymbol === 'O' ? 'active' : ''}`}
                      onClick={() => handleSymbolChange('O')}
                    >
                      O
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="d-flex flex-column w-100">
            <div className="row g-2 mb-4 min-width-300">
              {board.map((cell, index) => (
                <div className="col-4" key={index}>
                  <div
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
            <div className='d-flex justify-content-center gap-2'>
              <button 
                onClick={reset}
                className="btn btn-custom w-60 mb-4"
              >
                <RotateCcw size={20} /> New Game
              </button>
              <button 
                onClick={resetScores}
                className="btn btn-def mb-4"
              >
                Reset Scores
              </button>

            </div>
            <p className="h5 fw-bold message-text mx-auto">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;