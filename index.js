
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Trophy, RotateCcw, LogOut, Loader2, X, Play, Music, Target } from 'lucide-react';

const GameType = {
  F1: 'FORMULE_1',
  MUSIC: 'MUZIEK',
  SINTERKLAAS: 'SINTERKLAAS',
  AGILITY: 'BEHENDIGHEID'
};

const WheelSelector = ({ onSpinComplete, isSpinningExternal }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  const segments = [
    { type: GameType.F1, color: '#ef4444', label: 'F1 Start', icon: '🏎️' },
    { type: GameType.MUSIC, color: '#3b82f6', label: 'Muziek', icon: '🎵' },
    { type: GameType.SINTERKLAAS, color: '#eab308', label: 'Sint', icon: '🎁' },
    { type: GameType.AGILITY, color: '#10b981', label: 'Reflex', icon: '⚡' },
  ];

  const spin = () => {
    if (isSpinningExternal) return;

    const randomIndex = Math.floor(Math.random() * segments.length);
    const selectedGame = segments[randomIndex].type;
    const segmentAngle = 360 / segments.length; 
    const stopAngle = 360 * 8 + (360 - (randomIndex * segmentAngle) - (segmentAngle / 2)); 
    setRotation(rotation + stopAngle);
    onSpinComplete(selectedGame);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-64 h-64">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 text-white drop-shadow-lg">▼</div>
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-white/20 shadow-2xl relative overflow-hidden transition-transform cubic-bezier(0.2, 0.8, 0.2, 1)"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: '3000ms',
            transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {segments.map((seg, i) => (
            <div
              key={i}
              className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right flex items-center justify-center"
              style={{
                transform: `rotate(${i * 90}deg)`,
                backgroundColor: seg.color,
              }}
            >
              <div 
                className="absolute bottom-8 right-8 transform translate-x-1/2 translate-y-1/2 rotate-45 flex flex-col items-center justify-center"
                style={{ transform: `rotate(45deg) translate(25%, 25%)` }}
              >
                <span className="text-2xl filter drop-shadow-md select-none">{seg.icon}</span>
                <span className="text-xs font-bold text-white uppercase drop-shadow-md select-none">{seg.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-inner border-4 border-game-surface z-10 flex items-center justify-center">
          <div className="w-3 h-3 bg-game-surface rounded-full"></div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={isSpinningExternal}
        className={`
          px-8 py-4 rounded-full text-xl font-bold shadow-xl transition-all transform active:scale-95
          ${isSpinningExternal 
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-game-primary to-game-accent text-white hover:shadow-game-primary/50 ring-4 ring-white/10'}
        `}
      >
        {isSpinningExternal ? (
          <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Draait...</span>
        ) : "DRAAI HET WIEL"}
      </button>
    </div>
  );
};

const F1Game = ({ onGameOver, onBack }) => {
  const [gameState, setGameState] = useState('IDLE');
  const [reactionTime, setReactionTime] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const startTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const audioCtxRef = useRef(null);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtxRef.current = new AudioContext();
    } catch (e) { console.error(e); }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') { try { audioCtxRef.current.close(); } catch(e) {} }
    };
  }, []);

  const playTone = (freq, type, duration) => {
    if (!audioCtxRef.current) return;
    try {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
    } catch(e) {}
  };

  const startSequence = () => {
    if (attempts >= MAX_ATTEMPTS) return;
    setGameState('WAITING');
    setReactionTime(null);
    let delay = 500; 
    [1, 2, 3, 4, 5].forEach((i) => {
      timeoutRef.current = setTimeout(() => {
        setGameState(`LIGHTS_${i}`);
        playTone(440 + (i * 50), 'square', 0.08); 
      }, delay);
      delay += 400;
    });
    const randomDelay = Math.floor(Math.random() * 1800) + 200;
    timeoutRef.current = setTimeout(() => {
      setGameState('READY'); 
      setTimeout(() => {
        setGameState('GO');
        playTone(800, 'square', 0.4); 
        startTimeRef.current = Date.now();
      }, 0);
    }, delay + randomDelay);
  };

  const handleTap = () => {
    if (gameState === 'IDLE' || gameState === 'FINISHED' || gameState === 'FALSE_START') {
      if (attempts >= MAX_ATTEMPTS && gameState === 'FINISHED') return; 
      startSequence();
      return;
    }
    if (gameState.startsWith('LIGHTS') || gameState === 'WAITING') {
      setGameState('FALSE_START');
      playTone(150, 'sawtooth', 0.5);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    if (gameState === 'GO') {
      const endTime = Date.now();
      const diff = endTime - startTimeRef.current;
      setReactionTime(diff);
      setTotalTime(prev => prev + diff);
      setAttempts(prev => prev + 1);
      setGameState('FINISHED');
      if (attempts + 1 >= MAX_ATTEMPTS) {
        setTimeout(() => {
           onGameOver({ score: Math.floor((totalTime + diff) / MAX_ATTEMPTS), message: `Gemiddelde: ${Math.floor((totalTime + diff) / MAX_ATTEMPTS)}ms` });
        }, 2500); 
      }
    }
  };

  const getLightClass = (lightIndex) => {
    const activeMap = { 'LIGHTS_1': 1, 'LIGHTS_2': 2, 'LIGHTS_3': 3, 'LIGHTS_4': 4, 'LIGHTS_5': 5, 'READY': 5 };
    const activeCount = activeMap[gameState] || 0;
    if (gameState === 'GO') return 'bg-transparent border-4 border-slate-700'; 
    if (activeCount >= lightIndex) return 'bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.8)]';
    return 'bg-slate-900 border border-slate-700';
  };

  return (
    <div className="h-full w-full flex flex-col bg-black text-white p-4">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full"><X size={20}/></button>
        <div className="text-sm font-mono">Ronde {attempts}/{MAX_ATTEMPTS}</div>
      </div>
      <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-wider">F1 Start Reactie</h2>
      <div className="flex justify-center gap-2 sm:gap-4 mb-12 px-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
             <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full transition-all duration-75 ${getLightClass(i)}`}></div>
             <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full opacity-30 bg-slate-900 border border-slate-700`}></div>
          </div>
        ))}
      </div>
      <button 
        onPointerDown={handleTap}
        className={`flex-1 w-full rounded-2xl flex flex-col items-center justify-center text-3xl font-bold transition-colors touch-manipulation ${gameState === 'FALSE_START' ? 'bg-red-900/50 text-red-400' : ''} ${gameState === 'GO' ? 'bg-green-900/50 text-green-400' : ''} ${['IDLE', 'FINISHED'].includes(gameState) ? 'bg-slate-800 text-white hover:bg-slate-700' : ''} ${gameState.startsWith('LIGHTS') || gameState === 'WAITING' ? 'bg-black cursor-default' : ''}`}
      >
        {gameState === 'IDLE' && "Tik om te Starten"}
        {gameState === 'WAITING' && "Wacht..."}
        {gameState.startsWith('LIGHTS') && "Klaar..."}
        {gameState === 'GO' && `TIK NU!`}
        {gameState === 'FALSE_START' && (<div><div>VALSE START!</div><div className="text-sm font-normal mt-2 opacity-70">Tik om opnieuw te proberen</div></div>)}
        {gameState === 'FINISHED' && (
           <div className="text-center">
             <div className="text-5xl font-black mb-2">{reactionTime} <span className="text-2xl font-normal text-slate-400">ms</span></div>
             {attempts >= MAX_ATTEMPTS ? (
               <div className="animate-pulse text-game-accent font-bold mt-4">SPEL COMPLEET!<div className="text-sm text-white mt-1 font-normal">Gemiddelde: {Math.floor(totalTime / MAX_ATTEMPTS)} ms</div></div>
             ) : (<div className="text-sm font-normal mt-2 opacity-70">Tik voor volgende ronde</div>)}
           </div>
        )}
      </button>
    </div>
  );
};

const MusicGame = ({ onGameOver, onBack }) => {
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activePad, setActivePad] = useState(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('START');
  const audioCtxRef = useRef(null);

  const COLORS = [
    { id: 0, color: 'bg-green-500', active: 'bg-green-300 shadow-[0_0_30px_#86efac]', sound: 261.63 },
    { id: 1, color: 'bg-red-500', active: 'bg-red-300 shadow-[0_0_30px_#fca5a5]', sound: 329.63 },
    { id: 2, color: 'bg-yellow-500', active: 'bg-yellow-300 shadow-[0_0_30px_#fde047]', sound: 392.00 },
    { id: 3, color: 'bg-blue-500', active: 'bg-blue-300 shadow-[0_0_30px_#93c5fd]', sound: 523.25 },
  ];

  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtxRef.current = new AudioContext();
    } catch (e) { console.error(e); }
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') { try { audioCtxRef.current.close(); } catch(e) {} }
    };
  }, []);

  const playTone = (freq) => {
    if (!audioCtxRef.current) return;
    try {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.5);
    } catch(e) {}
  };

  const playSequence = async (seq) => {
    setStatus('PLAYING');
    setIsPlayingSequence(true);
    setUserStep(0);
    await new Promise(r => setTimeout(r, 800));
    for (let i = 0; i < seq.length; i++) {
      const padIndex = seq[i];
      setActivePad(padIndex);
      playTone(COLORS[padIndex].sound);
      await new Promise(r => setTimeout(r, 400));
      setActivePad(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsPlayingSequence(false);
    setStatus('LISTENING');
  };

  const startGame = () => {
    setScore(0);
    setSequence([]);
    const first = Math.floor(Math.random() * 4);
    setSequence([first]);
    playSequence([first]);
  };

  const handlePadClick = (index) => {
    if (status !== 'LISTENING') return;
    setActivePad(index);
    playTone(COLORS[index].sound);
    setTimeout(() => setActivePad(null), 200);

    if (sequence[userStep] === index) {
      if (userStep === sequence.length - 1) {
        setScore(prev => prev + 1);
        setStatus('PLAYING'); 
        const nextColor = Math.floor(Math.random() * 4);
        const newSequence = [...sequence, nextColor];
        setSequence(newSequence);
        setTimeout(() => playSequence(newSequence), 500);
      } else {
        setUserStep(prev => prev + 1);
      }
    } else {
      setStatus('GAME_OVER');
      setTimeout(() => {
        onGameOver({ score, message: `Je onthield ${score} tonen!` });
      }, 1000);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full"><X size={20}/></button>
        <div className="text-xl font-bold">{score}</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-center mb-8 text-slate-400 text-sm uppercase tracking-widest">
          {status === 'START' ? 'Speel de noten na' : status === 'PLAYING' ? 'Luister...' : status === 'LISTENING' ? 'Jouw beurt!' : 'Game Over'}
        </h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-[300px] aspect-square relative">
           {status === 'START' && (
             <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-2xl backdrop-blur-sm">
               <button onClick={startGame} className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"><Play size={20} fill="black" /> Start</button>
             </div>
           )}
           {COLORS.map((btn, i) => (
             <button key={i} className={`rounded-2xl transition-all duration-100 border-b-4 border-black/20 active:border-b-0 active:translate-y-1 ${activePad === i ? btn.active : btn.color}`} onPointerDown={() => handlePadClick(i)} disabled={status !== 'LISTENING'}/>
           ))}
        </div>
      </div>
    </div>
  );
};

const SinterklaasGame = ({ onGameOver, onBack }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameState, setGameState] = useState('START');
  const [birdY, setBirdY] = useState(50);
  const [obstacles, setObstacles] = useState([]);
  const [gifts, setGifts] = useState([]);

  const gameStateRef = useRef('START');
  const timeLeftRef = useRef(20);
  const birdYRef = useRef(50);
  const velocityRef = useRef(0);
  const obstaclesRef = useRef([]);
  const giftsRef = useRef([]);
  const scoreRef = useRef(0);
  
  const requestRef = useRef(0);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtxRef.current = new AudioContext();
    } catch (e) { console.error(e); }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') { try { audioCtxRef.current.close(); } catch(e) {} }
    };
  }, []);

  const playSound = (type) => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime;
      if (type === 'JUMP') {
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(300, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
      } else {
        osc.frequency.setValueAtTime(500, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
      }
      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  };

  const startGame = () => {
    gameStateRef.current = 'PLAYING';
    timeLeftRef.current = 20;
    scoreRef.current = 0;
    birdYRef.current = 50;
    velocityRef.current = 0;
    obstaclesRef.current = [];
    giftsRef.current = [];
    spawnTimerRef.current = 0;
    
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

  const jump = (e) => {
    if (e) e.stopPropagation();
    if (gameStateRef.current !== 'PLAYING') return;
    velocityRef.current = -3.0;
    playSound('JUMP');
  };

  const gameLoop = () => {
    if (gameStateRef.current !== 'PLAYING') return;
    const now = Date.now();
    const delta = Math.min(now - lastTimeRef.current, 50);
    lastTimeRef.current = now;

    timeLeftRef.current -= delta / 1000;
    if (timeLeftRef.current <= 0) {
      endGame(true);
      return;
    }

    velocityRef.current += 0.25;
    birdYRef.current += velocityRef.current;

    if (birdYRef.current > 92 || birdYRef.current < 0) {
      endGame(false);
      return;
    }

    obstaclesRef.current.forEach(obs => obs.x -= 0.8);
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -20);
    giftsRef.current.forEach(g => g.x -= 0.8);
    giftsRef.current = giftsRef.current.filter(g => g.x > -20);

    spawnTimerRef.current += delta;
    if (spawnTimerRef.current > 1300) {
      spawnTimerRef.current = 0;
      const height = 20 + Math.random() * 35; 
      obstaclesRef.current.push({ id: Date.now(), x: 110, height: height });
      if (Math.random() > 0.3) {
        giftsRef.current.push({ id: Date.now() + 1, x: 110 + 7.5 - 5, y: 100 - height - 25 - (Math.random() * 15) });
      }
    }

    // Collision (Simplified)
    // ... collision logic kept same as before but compressed for brevity
    const playerRect = { l: 20, r: 28, t: birdYRef.current, b: birdYRef.current + 8 };
    for (const obs of obstaclesRef.current) {
        if (playerRect.l < obs.x + 15 && playerRect.r > obs.x && playerRect.b > 100 - obs.height) { endGame(false); return; }
    }
    const keptGifts = [];
    giftsRef.current.forEach(gift => {
       if (playerRect.l < gift.x + 10 && playerRect.r > gift.x && playerRect.t < gift.y + 10 && playerRect.b > gift.y) {
           scoreRef.current++;
           setScore(scoreRef.current);
           playSound('SCORE');
       } else { keptGifts.push(gift); }
    });
    giftsRef.current = keptGifts;

    setBirdY(birdYRef.current);
    setObstacles([...obstaclesRef.current]);
    setGifts([...giftsRef.current]);
    setTimeLeft(Math.ceil(timeLeftRef.current));
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = (success) => {
    gameStateRef.current = 'GAMEOVER';
    setGameState('GAMEOVER');
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setTimeout(() => {
      onGameOver({ score: scoreRef.current, message: success ? `Gewonnen! ${scoreRef.current} cadeaus!` : `Gecrasht! ${scoreRef.current} cadeaus.` });
    }, 1500);
  };

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col relative overflow-hidden font-sans select-none touch-none">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
        <button onClick={onBack} className="pointer-events-auto p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700"><X size={20}/></button>
        <div className="flex gap-4 text-xl font-black drop-shadow-md"><div className="text-yellow-400">🎁 {score}</div><div className={timeLeft < 5 ? "text-red-500 animate-pulse" : "text-white"}>⏱️ {Math.ceil(timeLeft)}</div></div>
      </div>
      <div className="absolute inset-0 z-10" onPointerDown={gameState === 'START' ? startGame : (e) => jump(e)}>
        {gameState === 'START' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
             <div className="text-6xl mb-4 animate-bounce">🐴</div>
             <div className="bg-game-accent text-white px-6 py-3 rounded-full font-bold animate-pulse cursor-pointer">TIK OM TE STARTEN</div>
           </div>
        )}
        <div className="absolute text-4xl transition-transform will-change-transform" style={{ left: '20%', top: `${birdY}%`, transform: `translateY(-50%) rotate(${velocityRef.current * 3}deg) scaleX(-1)` }}>🐴</div>
        {obstacles.map(obs => ( <div key={obs.id} className="absolute bottom-0 bg-red-900 border-x-4 border-t-4 border-red-950 rounded-t-lg shadow-lg" style={{ left: `${obs.x}%`, height: `${obs.height}%`, width: `15%`, }}></div> ))}
        {gifts.map(gift => ( <div key={gift.id} className="absolute text-3xl animate-pulse" style={{ left: `${gift.x}%`, top: `${gift.y}%` }}>🎁</div> ))}
        <div className="absolute bottom-0 w-full h-[8%] bg-slate-800 border-t-4 border-slate-700 z-20 flex items-center justify-center"></div>
      </div>
    </div>
  );
};

const AgilityGame = ({ onGameOver, onBack }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [targetPos, setTargetPos] = useState({ top: 50, left: 50 });
  const [gameStarted, setGameStarted] = useState(false);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    try { const AudioContext = window.AudioContext || window.webkitAudioContext; if (AudioContext) audioCtxRef.current = new AudioContext(); } catch(e) {}
    setGameStarted(true);
    moveTarget();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => { onGameOver({ score: 0, message: '' }); }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') { try { audioCtxRef.current.close(); } catch(e) {} }
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) onGameOver({ score, message: `Reflex test: ${score} hits in 15s!` });
  }, [timeLeft, score, onGameOver]);

  const playPop = () => {
    if (!audioCtxRef.current) return;
    try {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + Math.random() * 200, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.1);
    } catch (e) {}
  };

  const moveTarget = () => {
    const top = Math.floor(Math.random() * 70) + 15; 
    const left = Math.floor(Math.random() * 70) + 15;
    setTargetPos({ top, left });
  };

  const handleHit = (e) => {
    e.preventDefault(); 
    setScore(s => s + 1);
    playPop();
    if (navigator.vibrate) navigator.vibrate(30);
    moveTarget();
  };

  return (
    <div className="h-full w-full bg-slate-900 text-white flex flex-col relative select-none touch-none">
      <div className="p-4 flex justify-between items-center z-20 bg-slate-900/80">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full"><X size={20}/></button>
        <div className="flex gap-6 text-xl font-bold font-mono">
          <div className="text-green-400">{score} Hits</div>
          <div className={timeLeft < 5 ? "text-red-500 animate-pulse" : "text-white"}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {gameStarted && timeLeft > 0 && (
          <button onPointerDown={handleHit} className="absolute w-24 h-24 -ml-12 -mt-12 bg-game-accent rounded-full shadow-[0_0_15px_rgba(236,72,153,0.6)] border-4 border-white active:scale-90 transition-transform flex items-center justify-center animate-pulse-fast cursor-pointer tap-highlight-transparent" style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%`, touchAction: 'none' }}><Target className="text-white w-12 h-12 pointer-events-none" /></button>
        )}
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
const App = ({ onExit }) => {
  const [activeGame, setActiveGame] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleGameSelection = (game) => {
    setIsSpinning(true);
    setTimeout(() => {
      setLastResult(null);
      setActiveGame(game);
      setIsSpinning(false);
    }, 3500);
  };

  const handleGameOver = (result) => {
    setLastResult(result);
    setActiveGame(null);
  };

  const renderGame = () => {
    switch (activeGame) {
      case GameType.F1: return <F1Game onGameOver={handleGameOver} onBack={() => setActiveGame(null)} />;
      case GameType.MUSIC: return <MusicGame onGameOver={handleGameOver} onBack={() => setActiveGame(null)} />;
      case GameType.SINTERKLAAS: return <SinterklaasGame onGameOver={handleGameOver} onBack={() => setActiveGame(null)} />;
      case GameType.AGILITY: return <AgilityGame onGameOver={handleGameOver} onBack={() => setActiveGame(null)} />;
      default: return null;
    }
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col items-center justify-between p-4 relative overflow-hidden no-select bg-game-dark text-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-game-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-game-accent rounded-full blur-3xl"></div>
      </div>

      {!activeGame ? (
        <>
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-md z-10 animate-fade-in">
            <header className="text-center">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-game-secondary to-game-accent drop-shadow-lg mb-2">MINI GAME MIX</h1>
              <p className="text-slate-400 text-sm">Draai het wiel en speel!</p>
            </header>

            <div className="relative py-4">
               <WheelSelector onSpinComplete={handleGameSelection} isSpinningExternal={isSpinning} />
            </div>

            {lastResult && (
              <div className="bg-game-surface border border-game-primary/30 rounded-xl p-4 w-full text-center animate-fade-in shadow-2xl">
                <div className="flex justify-center mb-1"><Trophy className="w-8 h-8 text-yellow-400" /></div>
                <h2 className="text-lg font-bold text-white mb-1">Spel Afgelopen!</h2>
                <div className="text-2xl font-black text-game-accent mb-1">{lastResult.score} Ptn</div>
                <p className="text-slate-300 text-xs">{lastResult.message}</p>
              </div>
            )}
          </div>
          
          <div className="w-full max-w-md z-10 pb-4">
             {onExit && (
              <button onClick={onExit} disabled={isSpinning} className="w-full py-4 flex items-center justify-center gap-2 text-slate-300 hover:text-white transition-colors bg-game-surface/50 rounded-xl border border-white/10 active:scale-95">
                <LogOut size={20} /> <span className="font-bold">Terug naar Hoofdmenu</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full absolute top-0 left-0 bg-game-dark z-50">
          {renderGame()}
        </div>
      )}
    </div>
  );
};

const mountNode = document.getElementById('react-view');
if (mountNode) {
  try {
    const root = ReactDOM.createRoot(mountNode);
    const handleExit = () => {
      if (window.showView) {
        window.showView('main-menu', true);
      } else {
        const reactView = document.getElementById('react-view');
        const mainMenu = document.getElementById('main-menu');
        const header = document.getElementById('main-header');
        if (reactView) reactView.classList.add('hidden');
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (header) header.style.display = 'block';
      }
    };
    root.render(<React.StrictMode><App onExit={handleExit} /></React.StrictMode>);
  } catch (e) { console.error(e); }
}
