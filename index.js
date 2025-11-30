
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Trophy, RotateCcw, LogOut, Loader2, X, Play, Music, Target, Activity, ShieldAlert, Swords } from 'lucide-react';

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
    { type: GameType.SINTERKLAAS, color: '#eab308', label: 'Duel', icon: '⚔️' },
    { type: GameType.AGILITY, color: '#10b981', label: 'Hartslag', icon: '💓' },
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

// --- VORMEN VERZAMELAARS (Trivorm / Shape Duel) ---
const SinterklaasGame = ({ onGameOver, onBack }) => {
  const [deck, setDeck] = useState([]);
  const [p1Hand, setP1Hand] = useState([]);
  const [p2Hand, setP2Hand] = useState([]);
  const [centerTiles, setCenterTiles] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [turnPhase, setTurnPhase] = useState('discard'); // 'discard' or 'pick'
  const [gameActive, setGameActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [statusMsg, setStatusMsg] = useState('Druk op Start');
  const [sabotageUsed, setSabotageUsed] = useState({ p1: false, p2: false });
  const [winningPlayer, setWinningPlayer] = useState(null);

  const audioCtxRef = useRef(null);
  const timerRef = useRef(null);

  // Constants
  const SHAPES = [0, 1, 2, 3]; // 0:Circle, 1:Square, 2:Triangle, 3:Star
  const TOTAL_STONES_PER_SHAPE = 5;
  const TIME_LIMIT = 60;
  const HAND_SIZE = 4;

  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtxRef.current = new AudioContext();
    } catch (e) {}
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const playSound = (type) => {
    if (!audioCtxRef.current) return;
    try {
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      const now = audioCtxRef.current.currentTime;

      if (type === 'click') {
         osc.type = 'square'; osc.frequency.setValueAtTime(200, now);
         gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0, now + 0.1);
         osc.start(now); osc.stop(now + 0.1);
      } else if (type === 'pickup') {
         osc.type = 'triangle'; osc.frequency.setValueAtTime(500, now); osc.frequency.linearRampToValueAtTime(700, now+0.1);
         gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+0.15);
         osc.start(now); osc.stop(now+0.15);
      } else if (type === 'sabotage') {
         osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(100, now+0.4);
         gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now+0.4);
         osc.start(now); osc.stop(now+0.4);
      } else if (type === 'win') {
         osc.type = 'sine'; osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(880, now+0.2);
         gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now+1);
         osc.start(now); osc.stop(now+1);
      } else if (type === 'tick') {
         osc.type = 'square'; osc.frequency.setValueAtTime(100, now);
         gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.001, now+0.05);
         osc.start(now); osc.stop(now+0.05);
      }
    } catch(e) {}
  };

  const initGame = () => {
    let newDeck = [];
    SHAPES.forEach(s => {
      for(let i=0; i<TOTAL_STONES_PER_SHAPE; i++) newDeck.push(s);
    });
    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    const h1 = [];
    const h2 = [];
    for(let i=0; i<HAND_SIZE; i++) {
        if(newDeck.length > 0) h1.push(newDeck.pop());
        if(newDeck.length > 0) h2.push(newDeck.pop());
    }
    
    setP1Hand(h1);
    setP2Hand(h2);
    setCenterTiles(newDeck.length > 0 ? [newDeck.pop()] : []);
    setDeck(newDeck);
    setCurrentPlayer(1);
    setTurnPhase('discard');
    setGameActive(true);
    setSabotageUsed({ p1: false, p2: false });
    setTimeRemaining(TIME_LIMIT);
    setStatusMsg("Speler 1: Gooi een kaart weg");
    setWinningPlayer(null);

    if(timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
       setTimeRemaining(prev => {
         playSound('tick');
         if(prev <= 1) {
            endGame(null); 
            return 0;
         }
         return prev - 1;
       });
    }, 1000);
  };

  const checkWin = (hand) => {
    const counts = {};
    for(let val of hand) {
        counts[val] = (counts[val] || 0) + 1;
        if(counts[val] >= 3) return true;
    }
    return false;
  };

  const handleHandClick = (player, index) => {
    if(!gameActive || player !== currentPlayer || turnPhase !== 'discard') return;
    
    const hand = player === 1 ? [...p1Hand] : [...p2Hand];
    const card = hand.splice(index, 1)[0];
    
    if(player === 1) setP1Hand(hand); else setP2Hand(hand);

    const newDeck = [card, ...deck];
    const newCenter = [...centerTiles];
    if(newDeck.length > 0) {
        newCenter.push(newDeck.pop());
        playSound('appear');
    }
    
    setDeck(newDeck);
    setCenterTiles(newCenter);
    setTurnPhase('pick');
    
    // Check if opponent can sabotage
    const opponent = player === 1 ? 2 : 1;
    const canSabotage = opponent === 1 ? !sabotageUsed.p1 : !sabotageUsed.p2;
    
    if (canSabotage) {
        setStatusMsg(`Speler ${opponent} kan SABOTEREN of Speler ${currentPlayer} kiest`);
    } else {
        setStatusMsg(`Speler ${currentPlayer}: Kies een kaart`);
    }
    playSound('click');
  };

  const handleCenterClick = (index) => {
     if(!gameActive || turnPhase !== 'pick') return;
     
     const newCenter = [...centerTiles];
     const card = newCenter.splice(index, 1)[0];
     setCenterTiles(newCenter);

     const hand = currentPlayer === 1 ? [...p1Hand] : [...p2Hand];
     hand.push(card);
     
     if(currentPlayer === 1) setP1Hand(hand); else setP2Hand(hand);
     playSound('pickup');

     if(checkWin(hand)) {
         endGame(currentPlayer);
         return;
     }

     const nextPlayer = currentPlayer === 1 ? 2 : 1;
     setCurrentPlayer(nextPlayer);
     setTurnPhase('discard');
     setStatusMsg(`Speler ${nextPlayer}: Gooi een kaart weg`);
  };

  const handleSabotage = (player) => {
     // Player pressed sabotage. This player is the OPPONENT of current player.
     // Must be opponents turn (technically, current player is set, but it's pick phase)
     const opponent = player; // The one clicking
     const activePlayer = opponent === 1 ? 2 : 1;
     
     if(!gameActive || activePlayer !== currentPlayer || turnPhase !== 'pick') return;
     if((opponent === 1 && sabotageUsed.p1) || (opponent === 2 && sabotageUsed.p2)) return;

     setSabotageUsed(prev => ({ ...prev, [opponent === 1 ? 'p1' : 'p2']: true }));
     
     // Reset pot: put center back to deck, shuffle, draw 2 new
     let newDeck = [...deck, ...centerTiles];
     // Shuffle
     for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
     }
     
     const newCenter = [];
     for(let i=0; i<2; i++) {
         if(newDeck.length > 0) newCenter.push(newDeck.pop());
     }
     
     setCenterTiles(newCenter);
     setDeck(newDeck);
     playSound('sabotage');
     setStatusMsg(`SABOTAGE! Nieuwe pot voor Speler ${activePlayer}.`);
  };

  const endGame = (winner) => {
     setGameActive(false);
     clearInterval(timerRef.current);
     setWinningPlayer(winner);
     if(winner) playSound('win');
     setTimeout(() => {
         onGameOver({ 
             score: winner ? 100 : 0, 
             message: winner ? `Speler ${winner} wint!` : "Tijd is op! Gelijkspel." 
         });
     }, 3000);
  };

  // Helpers
  const renderShape = (val) => {
     const shapes = [
         <div className="w-8 h-8 bg-red-500 rounded-full shadow-inner"></div>, // 0 Circle
         <div className="w-8 h-8 bg-blue-500 rounded-md shadow-inner"></div>,   // 1 Square
         <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] border-b-green-500"></div>, // 2 Triangle
         <div className="text-3xl text-yellow-400">★</div>, // 3 Star
     ];
     return shapes[val];
  };

  const renderCard = (val, onClick, disabled, isNew) => (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`
            w-16 h-24 bg-slate-200 rounded-lg shadow-md flex items-center justify-center border-2 border-slate-300
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:-translate-y-2 hover:shadow-xl active:scale-95 cursor-pointer'}
            ${isNew ? 'animate-pulse' : ''}
        `}
      >
          {renderShape(val)}
      </button>
  );

  return (
    <div className="h-full w-full bg-slate-800 text-white flex flex-col relative select-none touch-none overflow-hidden">
        <div className="p-2 flex justify-between items-center bg-slate-900/50">
           <button onClick={onBack} className="p-2 bg-slate-700 rounded-full"><X size={20}/></button>
           <div className={`font-mono text-xl font-bold ${timeRemaining < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              00:{timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining}
           </div>
        </div>

        {!gameActive && !winningPlayer ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Swords size={64} className="text-yellow-400 mb-4"/>
                <h1 className="text-3xl font-bold text-center">Vormen Duel</h1>
                <p className="text-slate-400 text-center max-w-xs">Verzamel 3 dezelfde vormen. <br/>Tegenspeler zit tegenover je.</p>
                <button onClick={initGame} className="bg-green-600 px-8 py-4 rounded-full font-bold text-xl shadow-lg hover:bg-green-500 transition-colors animate-bounce mt-8">
                    Start Spel
                </button>
            </div>
        ) : (
            <div className="flex-1 flex flex-col justify-between p-4 relative">
                
                {/* Player 2 (Rotated) */}
                <div className={`bg-slate-700/50 p-2 rounded-xl border-2 transition-colors rotate-180 ${currentPlayer === 2 ? 'border-yellow-400 bg-slate-700' : 'border-transparent'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-red-400">Speler 2</span>
                        <button 
                            onClick={() => handleSabotage(2)} 
                            disabled={!gameActive || currentPlayer === 2 || turnPhase !== 'pick' || sabotageUsed.p2}
                            className="bg-orange-600 text-xs px-2 py-1 rounded disabled:opacity-20 flex gap-1 items-center"
                        >
                            <ShieldAlert size={12}/> Saboteer
                        </button>
                    </div>
                    <div className="flex justify-center gap-2 min-h-[100px]">
                        {p2Hand.map((val, i) => renderCard(val, () => handleHandClick(2, i), currentPlayer !== 2 || turnPhase !== 'discard'))}
                    </div>
                </div>

                {/* Center Pot */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-sm text-slate-400 uppercase tracking-widest mb-2 font-bold text-center">{statusMsg}</div>
                    <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-900/30 rounded-2xl w-full min-h-[120px]">
                         {centerTiles.length === 0 && <div className="text-slate-600 text-xs self-center">Lege Pot</div>}
                         {centerTiles.map((val, i) => renderCard(val, () => handleCenterClick(i), turnPhase !== 'pick', i === centerTiles.length - 1))}
                    </div>
                </div>

                {/* Player 1 */}
                <div className={`bg-slate-700/50 p-2 rounded-xl border-2 transition-colors ${currentPlayer === 1 ? 'border-yellow-400 bg-slate-700' : 'border-transparent'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-blue-400">Speler 1</span>
                        <button 
                            onClick={() => handleSabotage(1)} 
                            disabled={!gameActive || currentPlayer === 1 || turnPhase !== 'pick' || sabotageUsed.p1}
                            className="bg-orange-600 text-xs px-2 py-1 rounded disabled:opacity-20 flex gap-1 items-center"
                        >
                            <ShieldAlert size={12}/> Saboteer
                        </button>
                    </div>
                    <div className="flex justify-center gap-2 min-h-[100px]">
                        {p1Hand.map((val, i) => renderCard(val, () => handleHandClick(1, i), currentPlayer !== 1 || turnPhase !== 'discard'))}
                    </div>
                </div>

                {/* Win Overlay */}
                {winningPlayer && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in">
                        <Trophy size={80} className="text-yellow-400 mb-4 animate-bounce" />
                        <h2 className="text-4xl font-black text-white mb-2">Speler {winningPlayer} Wint!</h2>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

// --- HARTSLAG RITME (Heartbeat / Agility) ---
const AgilityGame = ({ onGameOver, onBack }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gameStateRef = useRef({
    startTime: 0,
    gameTime: 0,
    isGameOver: false,
    score: 0,
    player: { x: 0, y: 0, velocityY: 0, isJumping: false, groundY: 0, springYOffset: 0, springSpeed: 0 },
    obstacles: [],
    powerup: null,
    nextPowerupTime: 0,
    nextObstacleX: 0,
    patternIndex: 0,
    scrollSpeed: 3,
    beatSpacing: 200,
    rhythmPattern: [1, -1, -1],
    hasStarted: false
  });
  const [uiState, setUiState] = useState({ score: 0, time: 0, gameOver: false, started: false });

  const GAME_DURATION = 30;
  const GROUND_Y = 320; 
  const LINE_Y = 330;
  const OBSTACLE_HEIGHT = 40;
  const POWERUP_INTERVAL = 8;

  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtxRef.current = new AudioContext();
    } catch (e) { console.error(e); }

    const canvas = canvasRef.current;
    if (canvas) {
       canvas.width = window.innerWidth;
       canvas.height = window.innerHeight;
       const s = gameStateRef.current;
       s.player.x = canvas.width / 4;
       s.player.groundY = canvas.height - 200; 
       s.player.y = s.player.groundY;
       s.nextObstacleX = canvas.width;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') { try { audioCtxRef.current.close(); } catch(e) {} }
    };
  }, []);

  const playTone = (freq, type, duration, gainVal = 0.3) => {
    if (!audioCtxRef.current) return;
    try {
      if(audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + duration);
    } catch(e) {}
  };

  const initGame = () => {
     const s = gameStateRef.current;
     const canvas = canvasRef.current;
     s.hasStarted = true;
     s.isGameOver = false;
     s.startTime = Date.now();
     s.gameTime = 0;
     s.score = 0;
     s.obstacles = [];
     s.powerup = null;
     s.nextPowerupTime = 0;
     s.scrollSpeed = 3;
     s.beatSpacing = 200;
     s.player.y = s.player.groundY;
     s.player.velocityY = 0;
     s.player.isJumping = false;
     s.nextObstacleX = canvas.width;
     setUiState({ score: 0, time: 0, gameOver: false, started: true });
     if (requestRef.current) cancelAnimationFrame(requestRef.current);
     requestRef.current = requestAnimationFrame(gameLoop);
  };

  const jump = () => {
    const s = gameStateRef.current;
    if (!s.hasStarted) { initGame(); return; }
    if (!s.player.isJumping && !s.isGameOver) {
        s.player.isJumping = true;
        s.player.velocityY = -15; 
        playTone(150, 'square', 0.1); 
    }
  };

  const updateRhythm = (timeFactor) => {
      const s = gameStateRef.current;
      let speedFactor = 1.0 + timeFactor * 3.0;
      s.scrollSpeed = 3 * speedFactor;
      const currentBPM = 100 * speedFactor;
      const secondsPerBeat = 60 / currentBPM;
      s.beatSpacing = s.scrollSpeed * (secondsPerBeat * 60);
      if (s.beatSpacing < 80) s.beatSpacing = 80;
      if (s.beatSpacing > 300) s.beatSpacing = 300;
  };

  const spawnEntities = (canvas) => {
      const s = gameStateRef.current;
      if (s.nextObstacleX < canvas.width + s.beatSpacing) {
          const type = s.rhythmPattern[s.patternIndex];
          if (type === 1) playTone(1000, 'square', 0.05, 0.1); 
          s.obstacles.push({ x: s.nextObstacleX, type: type, size: 20, hasScored: false });
          s.nextObstacleX += s.beatSpacing;
          s.patternIndex = (s.patternIndex + 1) % s.rhythmPattern.length;
      }
      if (s.gameTime >= s.nextPowerupTime && s.powerup === null) {
          s.powerup = { x: canvas.width + 50, y: s.player.groundY - 100, radius: 12 };
          s.nextPowerupTime = s.gameTime + POWERUP_INTERVAL;
      }
  };

  const gameLoop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const s = gameStateRef.current;
      s.gameTime = (Date.now() - s.startTime) / 1000;
      setUiState(prev => ({ ...prev, score: s.score, time: s.gameTime, gameOver: s.isGameOver }));

      if (s.gameTime >= GAME_DURATION && !s.isGameOver) {
          s.isGameOver = true;
          setTimeout(() => onGameOver({ score: s.score, message: `Hartslag Ritme: ${s.score} punten!` }), 2000);
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const lineY = s.player.groundY + 10;
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(canvas.width, lineY);
      ctx.stroke();

      if (!s.isGameOver) {
          const timeFactor = Math.min(s.gameTime / GAME_DURATION, 1);
          updateRhythm(timeFactor);
          spawnEntities(canvas);
          s.obstacles.forEach(obs => obs.x -= s.scrollSpeed);
          s.obstacles = s.obstacles.filter(obs => obs.x > -50);
          s.nextObstacleX -= s.scrollSpeed;
          if (s.powerup) {
              s.powerup.x -= s.scrollSpeed;
              if (s.powerup.x < -50) s.powerup = null;
          }
          if (s.player.isJumping || s.player.y < s.player.groundY) {
              s.player.velocityY += 0.8; 
              s.player.y += s.player.velocityY;
          }
          if (s.player.y > s.player.groundY) {
              s.player.y = s.player.groundY;
              s.player.velocityY = 0;
              s.player.isJumping = false;
          }
          s.obstacles.forEach(obs => {
               const pX = s.player.x;
               if (obs.x > pX - 20 && obs.x < pX + 20) {
                   if (obs.type === 1 && s.player.y > lineY - OBSTACLE_HEIGHT) {
                       s.isGameOver = true;
                       playTone(440, 'square', 0.3);
                       setTimeout(() => onGameOver({ score: s.score, message: `Hartstilstand! Score: ${s.score}` }), 1500);
                   }
               }
               if (obs.type === 1 && !obs.hasScored && obs.x < pX - 20) {
                   s.score++;
                   obs.hasScored = true;
               }
          });
          if (s.powerup) {
              const dx = s.player.x - s.powerup.x;
              const dy = (s.player.y - 40) - s.powerup.y;
              if (Math.sqrt(dx*dx + dy*dy) < 30) {
                  s.score += 2;
                  playTone(1500, 'triangle', 0.1);
                  s.powerup = null;
              }
          }
      }

      // Draw
      s.obstacles.forEach(obs => {
          ctx.beginPath();
          ctx.fillStyle = obs.type === 1 ? '#ff4500' : '#0080ff';
          ctx.moveTo(obs.x - 10, lineY);
          ctx.lineTo(obs.x, lineY - (obs.type === 1 ? OBSTACLE_HEIGHT : -OBSTACLE_HEIGHT));
          ctx.lineTo(obs.x + 10, lineY);
          ctx.fill();
      });
      if (s.powerup) {
          ctx.beginPath();
          ctx.fillStyle = '#00ffff';
          ctx.arc(s.powerup.x, s.powerup.y, 10 + Math.sin(s.gameTime * 10)*2, 0, Math.PI*2);
          ctx.fill();
      }
      const pX = s.player.x;
      const pY = s.player.y;
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(pX, pY - 25, 10, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(pX, pY - 50, 15, 0, Math.PI*2); ctx.stroke();

      if (!s.isGameOver) requestRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div className="h-full w-full bg-black text-white flex flex-col relative select-none touch-none overflow-hidden">
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 pointer-events-none">
        <button onClick={onBack} className="pointer-events-auto p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700"><X size={20}/></button>
        <div className="flex gap-4 text-xl font-bold font-mono">
            <div className="text-green-400">Score: {uiState.score}</div>
            <div className="text-white">{uiState.time.toFixed(1)}s</div>
        </div>
      </div>
      <div className="flex-1 relative" onPointerDown={jump}>
         {!uiState.started && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-30 pointer-events-none">
                 <Activity size={64} className="text-game-primary mb-4 animate-pulse" />
                 <h2 className="text-2xl font-bold mb-2">Hartslag Ritme</h2>
                 <p className="text-slate-300">Tik om te springen!</p>
                 <div className="mt-4 bg-game-primary px-6 py-3 rounded-full font-bold">TIK OM TE STARTEN</div>
            </div>
         )}
         <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};

export default function App({ onExit }) {
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
    <div className="h-[100dvh] w-screen flex flex-col items-center justify-center p-4 relative overflow-hidden no-select bg-game-dark text-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-game-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-game-accent rounded-full blur-3xl"></div>
      </div>

      {!activeGame ? (
        <div className="flex flex-col items-center gap-8 w-full max-w-md z-10 animate-fade-in">
          <header className="text-center">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-game-secondary to-game-accent drop-shadow-lg mb-2">MINI GAME MIX</h1>
            <p className="text-slate-400 text-sm">Draai het wiel en speel!</p>
          </header>
          <div className="relative py-8"><WheelSelector onSpinComplete={handleGameSelection} isSpinningExternal={isSpinning} /></div>
          {lastResult && (
            <div className="bg-game-surface border border-game-primary/30 rounded-xl p-6 w-full text-center animate-fade-in shadow-2xl">
              <div className="flex justify-center mb-2"><Trophy className="w-10 h-10 text-yellow-400" /></div>
              <h2 className="text-xl font-bold text-white mb-1">Spel Afgelopen!</h2>
              <div className="text-3xl font-black text-game-accent mb-2">{lastResult.score} Ptn</div>
              <p className="text-slate-300 text-sm">{lastResult.message}</p>
            </div>
          )}
          {onExit && (
            <button onClick={onExit} disabled={isSpinning} className="mt-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"><LogOut size={16} /> Terug naar Hoofdmenu</button>
          )}
        </div>
      ) : (
        <div className="w-full h-full absolute top-0 left-0 bg-game-dark z-50">{renderGame()}</div>
      )}
    </div>
  );
}

const mountNode = document.getElementById('react-view');
if (mountNode) {
  try {
    const root = ReactDOM.createRoot(mountNode);
    const handleExit = () => {
      if (window.showView) { window.showView('main-menu', true); } else {
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
