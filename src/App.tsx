/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Trophy, RotateCcw, Terminal, Cpu, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- SYSTEM_CONSTANTS ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 120;

const AUDIO_DATA = [
  {
    id: "SYS_01",
    title: "NEURAL_LINK_v1",
    artist: "CORE_PROCESSOR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "#00ffff"
  },
  {
    id: "SYS_02",
    title: "VOID_PROTOCOL",
    artist: "CORE_PROCESSOR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "#ff00ff"
  },
  {
    id: "SYS_03",
    title: "STATIC_DREAM",
    artist: "CORE_PROCESSOR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "#00ff00"
  }
];

// --- MODULES ---

const GlitchSnake = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((currentSnake: { x: number, y: number }[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const onSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE
      };

      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, generateFood, isGameOver, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, isPaused, isGameOver]);

  const resetSystem = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  return (
    <div className="flex flex-col items-center gap-4 border-2 border-glitch-cyan p-4 bg-black/80 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-glitch-cyan/20 animate-pulse" />
      
      <div className="flex items-center justify-between w-full font-mono text-sm mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-glitch-magenta" />
          <span className="text-glitch-magenta">DATA_STREAM: {score.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex gap-4">
          <span className={isPaused ? 'text-glitch-magenta animate-pulse' : 'text-glitch-cyan'}>
            {isPaused ? '[PAUSED]' : '[ACTIVE]'}
          </span>
        </div>
      </div>

      <div className="relative border border-glitch-cyan/50 p-1">
        <div 
          className="grid gap-[1px]" 
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: 'min(70vw, 360px)',
            height: 'min(70vw, 360px)'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some(s => s.x === x && s.y === y);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div 
                key={i} 
                className={`w-full h-full transition-colors duration-75 ${
                  isHead ? 'bg-glitch-cyan shadow-[0_0_8px_#00ffff]' :
                  isSnake ? 'bg-glitch-cyan/40' :
                  isFood ? 'bg-glitch-magenta shadow-[0_0_12px_#ff00ff] animate-pulse' :
                  'bg-white/5'
                }`}
              />
            );
          })}
        </div>

        <AnimatePresence>
          {isGameOver && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 border-2 border-glitch-magenta"
            >
              <h2 className="glitch-text text-3xl text-glitch-magenta mb-4" data-text="SYSTEM_FAILURE">SYSTEM_FAILURE</h2>
              <p className="text-white/60 mb-6 font-mono text-xs">RECOVERY_REQUIRED_SCORE: {score}</p>
              <button 
                onClick={resetSystem}
                className="px-6 py-2 border-2 border-glitch-cyan text-glitch-cyan hover:bg-glitch-cyan hover:text-black transition-all font-bold"
              >
                REBOOT_SYSTEM
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 mt-2">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="py-1 border border-glitch-cyan/30 hover:border-glitch-cyan text-xs uppercase"
        >
          {isPaused ? 'RESUME_PROCESS' : 'HALT_PROCESS'}
        </button>
        <button 
          onClick={resetSystem}
          className="py-1 border border-glitch-magenta/30 hover:border-glitch-magenta text-xs uppercase"
        >
          RESET_CORE
        </button>
      </div>
    </div>
  );
};

const GlitchPlayer = () => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const track = AUDIO_DATA[index];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol;
  }, [vol]);

  useEffect(() => {
    if (playing) audioRef.current?.play().catch(() => setPlaying(false));
    else audioRef.current?.pause();
  }, [playing, index]);

  return (
    <div className="w-full max-w-[360px] p-4 border-2 border-glitch-magenta bg-black/80 relative">
      <audio ref={audioRef} src={track.url} onEnded={() => setIndex(i => (i + 1) % AUDIO_DATA.length)} />
      
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 border border-glitch-magenta flex items-center justify-center relative bg-glitch-magenta/10">
          <Music className="w-8 h-8 text-glitch-magenta" />
          {playing && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-full h-full bg-glitch-magenta animate-ping" />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-glitch-magenta text-lg truncate glitch-text" data-text={track.title}>{track.title}</h3>
          <p className="text-white/40 text-xs font-mono">{track.artist} // {track.id}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <button onClick={() => setIndex(i => (i - 1 + AUDIO_DATA.length) % AUDIO_DATA.length)} className="text-glitch-cyan hover:scale-110 transition-transform">
            <SkipBack className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setPlaying(!playing)}
            className="w-12 h-12 border-2 border-glitch-cyan flex items-center justify-center text-glitch-cyan hover:bg-glitch-cyan/10"
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          <button onClick={() => setIndex(i => (i + 1) % AUDIO_DATA.length)} className="text-glitch-cyan hover:scale-110 transition-transform">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Volume2 className="w-3 h-3 text-white/40" />
          <input 
            type="range" min="0" max="1" step="0.01" value={vol}
            onChange={(e) => setVol(parseFloat(e.target.value))}
            className="flex-1 h-[2px] bg-white/10 appearance-none cursor-crosshair accent-glitch-cyan"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-glitch-magenta/20 pt-4 space-y-1">
        {AUDIO_DATA.map((t, i) => (
          <button
            key={t.id}
            onClick={() => { setIndex(i); setPlaying(true); }}
            className={`w-full flex items-center justify-between p-1 text-[10px] font-mono transition-colors ${
              index === i ? 'bg-glitch-magenta/20 text-glitch-magenta' : 'text-white/30 hover:text-white/60'
            }`}
          >
            <span>{t.id} // {t.title}</span>
            {index === i && playing && <span className="animate-pulse">●</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="crt-overlay" />
      <div className="scanline" />
      
      <header className="mb-12 text-center z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative inline-block"
        >
          <h1 className="text-6xl md:text-8xl font-black glitch-text text-glitch-cyan" data-text="VOID_SNAKE">VOID_SNAKE</h1>
          <div className="absolute -top-4 -right-4 text-[10px] text-glitch-magenta font-mono animate-bounce">v.2.0.26</div>
        </motion.div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs font-mono text-white/30 tracking-[0.5em]">
          <Cpu className="w-3 h-3" />
          <span>NEURAL_INTERFACE_READY</span>
          <Terminal className="w-3 h-3" />
        </div>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex justify-center md:justify-end"
        >
          <GlitchPlayer />
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex justify-center md:justify-start"
        >
          <GlitchSnake />
        </motion.div>
      </main>

      <footer className="mt-16 text-center z-10 font-mono text-[8px] text-white/20 uppercase tracking-[1em]">
        [ ACCESS_GRANTED ] // [ SESSION_ENCRYPTED ] // [ NO_SIGNAL ]
      </footer>
    </div>
  );
}
