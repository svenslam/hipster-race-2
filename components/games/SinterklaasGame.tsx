
import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../../types.ts';
import { X, Music } from 'lucide-react';

interface Obstacle {
  id: number;
  x: number;
  height: number;
}

interface Gift {
  id: number;
  x: number;
  y: number;
}

export const SinterklaasGame: React.FC<GameProps> = ({ onGameOver, onBack }) => {
  // UI State (for rendering)
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  
  // Visual State
  const [birdY, setBirdY] = useState(50);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);

  // Logic State (Refs for synchronous access in loop)
  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const timeLeftRef = useRef(20);
  const birdYRef = useRef(50);
  const velocityRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const giftsRef = useRef<Gift[]>([]);
  const scoreRef = useRef(0);
  
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef(0);
  
  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const beatCountRef = useRef(0);

  // Constants
  const GRAVITY = 0.25;
  const JUMP_STRENGTH = -3.0; // Slightly lighter jump
  const GAME_SPEED = 0.8;
  const BIRD_SIZE = 8; 
  const OBSTACLE_WIDTH = 15; 
  const GIFT_SIZE = 10; 

  useEffect(() => {
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("AudioContext failed", e);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch(e) {}
      }
    };
  }, []);

  const playSound = (type: 'JUMP' | 'SCORE' | 'CRASH') => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const t = ctx.currentTime;

      if (type === 'JUMP') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(300, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
      } else if (type === 'SCORE') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t); 
        osc.frequency.setValueAtTime(659.25, t + 0.1); 
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const playGallopBeat = () => {
    if (!audioCtxRef.current || gameStateRef.current !== 'PLAYING') return;
    try {
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;

      // Schedule ahead
      if (t < nextNoteTimeRef.current) return;

      const tempo = 0.15; // seconds per beat part
      // Gallop rhythm: dum-da-dum ... dum-da-dum
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      // Lower pitch for hoof beat
      const freq = beatCountRef.current % 3 === 0 ? 80 : 120;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.start(t);
      osc.stop(t + 0.05);

      // Rhythm pattern: note - note - rest
      if (beatCountRef.current % 3 === 2) {
         nextNoteTimeRef.current += tempo * 1.5; // Longer pause
      } else {
         nextNoteTimeRef.current += tempo;
      }
      
      beatCountRef.current++;
    } catch (e) {}
  };

  const startGame = () => {
    // Reset Logic
    gameStateRef.current = 'PLAYING';
    timeLeftRef.current = 20;
    scoreRef.current = 0;
    birdYRef.current = 50;
    velocityRef.current = 0;
    obstaclesRef.current = [];
    giftsRef.current = [];
    spawnTimerRef.current = 0;
    beatCountRef.current = 0;
    if (audioCtxRef.current) nextNoteTimeRef.current = audioCtxRef.current.currentTime;

    // Reset UI
    setGameState('PLAYING');
    setScore(0);
    setTimeLeft(20);
    setBirdY(50);
    setObstacles([]);
    setGifts([]);

    lastTimeRef.current = Date.now();
    playSound('JUMP');
    jump();
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const jump = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (gameStateRef.current !== 'PLAYING') return;
    velocityRef.current = JUMP_STRENGTH;
    playSound('JUMP');
  };

  const gameLoop = () => {
    if (gameStateRef.current !== 'PLAYING') return;

    const now = Date.now();
    const delta = Math.min(now - lastTimeRef.current, 50);
    lastTimeRef.current = now;

    // Timer
    timeLeftRef.current -= delta / 1000;
    if (timeLeftRef.current <= 0) {
      endGame(true);
      return;
    }

    // Physics
    velocityRef.current += GRAVITY;
    birdYRef.current += velocityRef.current;

    // Floor/Ceiling Check
    if (birdYRef.current > 92 || birdYRef.current < 0) {
      endGame(false);
      return;
    }

    // Move Objects
    obstaclesRef.current.forEach(obs => obs.x -= GAME_SPEED);
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -20);

    giftsRef.current.forEach(g => g.x -= GAME_SPEED);
    giftsRef.current = giftsRef.current.filter(g => g.x > -20);

    // Spawn Logic
    spawnTimerRef.current += delta;
    if (spawnTimerRef.current > 1300) {
      spawnTimerRef.current = 0;
      const height = 20 + Math.random() * 35; 
      obstaclesRef.current.push({
        id: Date.now(),
        x: 110,
        height: height
      });
      
      if (Math.random() > 0.3) {
        giftsRef.current.push({
          id: Date.now() + 1,
          x: 110 + (OBSTACLE_WIDTH/2) - (GIFT_SIZE/2),
          y: 100 - height - 25 - (Math.random() * 15)
        });
      }
    }

    // Collisions
    const playerRect = {
      l: 20,
      r: 20 + BIRD_SIZE,
      t: birdYRef.current,
      b: birdYRef.current + BIRD_SIZE
    };

    // Obstacles
    for (const obs of obstaclesRef.current) {
      const obsRect = {
        l: obs.x,
        r: obs.x + OBSTACLE_WIDTH,
        t: 100 - obs.height,
        b: 100
      };
      // A bit of forgiveness margin
      const margin = 2;
      if (
        playerRect.l + margin < obsRect.r && 
        playerRect.r - margin > obsRect.l && 
        playerRect.b - margin > obsRect.t
      ) {
        endGame(false);
        return;
      }
    }

    // Gifts
    const keptGifts: Gift[] = [];
    giftsRef.current.forEach(gift => {
      const giftRect = {
        l: gift.x,
        r: gift.x + GIFT_SIZE,
        t: gift.y,
        b: gift.y + GIFT_SIZE
      };
      if (
        playerRect.l < giftRect.r &&
        playerRect.r > giftRect.l &&
        playerRect.t < giftRect.b &&
        playerRect.b > giftRect.t
      ) {
        scoreRef.current += 1;
        setScore(scoreRef.current); // Sync UI
        playSound('SCORE');
      } else {
        keptGifts.push(gift);
      }
    });
    giftsRef.current = keptGifts;

    // Update UI
    setBirdY(birdYRef.current);
    setObstacles([...obstaclesRef.current]);
    setGifts([...giftsRef.current]);
    setTimeLeft(Math.ceil(timeLeftRef.current));
    
    // Music tick
    playGallopBeat();

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = (success: boolean) => {
    gameStateRef.current = 'GAMEOVER';
    setGameState('GAMEOVER');
    playSound(success ? 'SCORE' : 'CRASH');
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    setTimeout(() => {
      onGameOver({ 
        score: scoreRef.current, 
        message: success ? `Gewonnen! ${scoreRef.current} cadeaus!` : `Gecrasht! ${scoreRef.current} cadeaus.` 
      });
    }, 1500);
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col relative overflow-hidden font-sans select-none touch-none">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 z-0">
        <div className="absolute inset-0 opacity-20" 
             style={{ 
               backgroundImage: 'radial-gradient(white 1px, transparent 1px)', 
               backgroundSize: '50px 50px' 
             }}>
        </div>
        <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-yellow-100 opacity-80 blur-sm shadow-[0_0_40px_rgba(253,224,71,0.5)]"></div>
      </div>

      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
        <button onClick={onBack} className="pointer-events-auto p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700"><X size={20}/></button>
        <div className="flex gap-4 text-xl font-black drop-shadow-md">
          <div className="text-yellow-400">🎁 {score}</div>
          <div className={timeLeft < 5 ? "text-red-500 animate-pulse" : "text-white"}>⏱️ {Math.ceil(timeLeft)}</div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="absolute inset-0 z-10"
        onPointerDown={gameState === 'START' ? startGame : (e) => jump(e)}
      >
        {/* Start Overlay */}
        {gameState === 'START' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
             <div className="text-6xl mb-4 animate-bounce">🐴</div>
             <h2 className="text-white font-bold text-3xl mb-2">Amerigo Run</h2>
             <p className="text-slate-300 mb-6 text-center max-w-xs">Tik om te springen. Ontwijk schoorstenen en vang cadeaus!</p>
             <div className="bg-game-accent text-white px-6 py-3 rounded-full font-bold animate-pulse cursor-pointer">
                TIK OM TE STARTEN
             </div>
           </div>
        )}

        {/* Player */}
        <div 
          className="absolute text-4xl transition-transform will-change-transform"
          style={{ 
            left: '20%', 
            top: `${birdY}%`,
            transform: `translateY(-50%) rotate(${velocityRef.current * 3}deg) scaleX(-1)` 
          }}
        >
          🐴
        </div>

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div 
            key={obs.id}
            className="absolute bottom-0 bg-red-900 border-x-4 border-t-4 border-red-950 rounded-t-lg shadow-lg"
            style={{ 
              left: `${obs.x}%`, 
              height: `${obs.height}%`, 
              width: `${OBSTACLE_WIDTH}%`,
            }}
          >
            <div className="w-[120%] h-4 bg-red-950 -ml-[10%] rounded-sm absolute top-0 shadow-md"></div>
          </div>
        ))}

        {/* Gifts */}
        {gifts.map(gift => (
          <div 
            key={gift.id}
            className="absolute text-3xl animate-pulse"
            style={{ 
              left: `${gift.x}%`, 
              top: `${gift.y}%`
            }}
          >
            🎁
          </div>
        ))}

        {/* Floor */}
        <div className="absolute bottom-0 w-full h-[8%] bg-slate-800 border-t-4 border-slate-700 z-20 flex items-center justify-center">
             <div className="text-xs text-slate-600">daken van nederland</div>
        </div>
      </div>
    </div>
  );
};
