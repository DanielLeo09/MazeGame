import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, Move, RefreshCw, Play, ChevronRight } from 'lucide-react';
import { generateMaze } from './mazeGenerator';
import { CellType, GameState, Point } from './types';

const CELL_SIZE = 20;
const INITIAL_LEVEL = 1;

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    level: INITIAL_LEVEL,
    time: 0,
    moves: 0,
  });

  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState<Point>({ x: 1, y: 1 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initLevel = useCallback((level: number) => {
    const size = 15 + level * 4; // Increase size with level
    const newMaze = generateMaze(size, size);
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setGameState(prev => ({ ...prev, status: 'PLAYING', level, time: 0, moves: 0 }));
  }, []);

  const startGame = () => {
    initLevel(INITIAL_LEVEL);
  };

  const nextLevel = () => {
    initLevel(gameState.level + 1);
  };

  const resetGame = () => {
    initLevel(gameState.level);
  };

  // Timer logic
  useEffect(() => {
    if (gameState.status === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({ ...prev, time: prev.time + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status]);

  // Movement logic
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState.status !== 'PLAYING') return;

    setPlayerPos(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;

      if (ny >= 0 && ny < maze.length && nx >= 0 && nx < maze[0].length) {
        const cell = maze[ny][nx];
        if (cell !== CellType.WALL) {
          setGameState(g => ({ ...g, moves: g.moves + 1 }));
          
          if (cell === CellType.END) {
            setGameState(g => ({ ...g, status: 'WON' }));
          }
          return { x: nx, y: ny };
        }
      }
      return prev;
    });
  }, [maze, gameState.status]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Render logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || maze.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const h = maze.length;
    const w = maze[0].length;
    canvas.width = w * CELL_SIZE;
    canvas.height = h * CELL_SIZE;

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Maze
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const cell = maze[y][x];
        if (cell === CellType.WALL) {
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
          // Subtle border for walls
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (cell === CellType.END) {
          // Goal
          ctx.fillStyle = '#10b981';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#10b981';
          ctx.beginPath();
          ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Draw Player
    ctx.fillStyle = '#3b82f6';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#3b82f6';
    ctx.beginPath();
    ctx.arc(playerPos.x * CELL_SIZE + CELL_SIZE / 2, playerPos.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [maze, playerPos]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-4">
      {/* HUD */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Level</span>
            <span className="text-2xl font-display font-bold text-blue-400">{gameState.level}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Time</span>
              <span className="text-xl font-mono">{gameState.time}s</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Moves</span>
              <span className="text-xl font-mono">{gameState.moves}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={resetGame}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95 group"
        >
          <RefreshCw className="w-5 h-5 text-white/60 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
        </button>
      </div>

      {/* Game Area */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative bg-[#0a0a0a] rounded-lg overflow-hidden border border-white/10 shadow-2xl">
          <canvas 
            ref={canvasRef} 
            className="block"
          />
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {gameState.status === 'START' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg"
            >
              <h1 className="text-6xl font-display font-black mb-2 tracking-tighter uppercase italic">
                Neon <span className="text-blue-500">Labyrinth</span>
              </h1>
              <p className="text-white/40 font-mono text-sm mb-8 tracking-widest uppercase">Escape the procedural void</p>
              <button 
                onClick={startGame}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg transition-all active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.4)]"
              >
                <Play className="w-5 h-5 fill-current" />
                INITIALIZE
              </button>
            </motion.div>
          )}

          {gameState.status === 'WON' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-emerald-900/40 backdrop-blur-md flex flex-col items-center justify-center z-10 rounded-lg border-2 border-emerald-500/50"
            >
              <div className="bg-emerald-500 p-4 rounded-full mb-6 shadow-[0_0_50px_rgba(16,185,129,0.6)]">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-display font-bold mb-1 tracking-tight">LEVEL COMPLETE</h2>
              <p className="text-emerald-200/60 font-mono text-sm mb-8 uppercase tracking-widest">Efficiency: {Math.round(1000 / (gameState.time + 1))} pts</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={resetGame}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                >
                  RETRY
                </button>
                <button 
                  onClick={nextLevel}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  NEXT LEVEL
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Help */}
      <div className="mt-8 flex gap-8 text-white/30 font-mono text-[10px] uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">WASD</kbd>
          <span>to move</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded">ARROWS</kbd>
          <span>to navigate</span>
        </div>
      </div>
    </div>
  );
}
