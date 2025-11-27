
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

// --- VORMEN VERZAMELAARS (Shape Duel) ---
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
  const SHAPES = [0, 1, 2, 3, 4, 5];
  const TOTAL_STONES_PER_SHAPE = 5;
  const TIME_LIMIT = 60;

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
      }
    } catch(e) {}
  };

  const initGame = () => {
    // Build Deck
    let newDeck = [];
    SHAPES.forEach(s => {
      for(let i=0; i<TOTAL_STONES_PER_SHAPE; i++) newDeck.push(s);
    });
    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    const h1 = [], h2 = [];
    SHAPES.forEach(s => {
        let idx = newDeck.indexOf(s);
        if(idx !== -1) h1.push(newDeck.splice(idx, 1)[0]);
    });
    SHAPES.forEach(s => {
        let idx = newDeck.indexOf(s);
        if(idx !== -1) h2.push(newDeck.splice(idx, 1)[0]);
    });
    while(h1.length > 4) newDeck.push(h1.pop());
    while(h2.length > 4) newDeck.push(h2.pop());
    
    // Shuffle hands
    h1.sort(() => Math.random() - 0.5);
    h2.sort(() => Math.random() - 0.5);
    newDeck.sort(() => Math.random() - 0.5);

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
    
    // Update Hand
    if(player === 1) setP1Hand(hand); else setP2Hand(hand);

    // Add to deck bottom -> Actually logic says unshift to deck then pop to center? 
    // Simplified: Discarded card goes to bottom of draw pile, then we reveal a NEW card to center
    // But Vormen Verzamelaars logic: discard adds to pot? No, logic was: discard puts card back in deck, then reveal new to pot.
    
    const newDeck = [card, ...deck];
    const newCenter = [...centerTiles];
    if(newDeck.length > 0) {
        newCenter.push(newDeck.pop());
    }
    
    setDeck(newDeck);
    setCenterTiles(newCenter);
    setTurnPhase('pick');
    setStatusMsg(`Speler ${currentPlayer}: Kies een kaart uit de pot`);
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
     if(!gameActive || player !== currentPlayer || turnPhase !== 'discard') return;
     if((player === 1 && sabotageUsed.p1) || (player === 2 && sabotageUsed.p2)) return;

     setSabotageUsed(prev => ({ ...prev, [player === 1 ? 'p1' : 'p2']: true }));
     
     // Reset pot
     const newCenter = [];
     const newDeck = [...deck];
     if(newDeck.length > 0) newCenter.push(newDeck.pop());
     
     setCenterTiles(newCenter);
     setDeck(newDeck);
     playSound('sabotage');
     setStatusMsg(`SABOTAGE! Pot gereset.`);
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
     }, 2000);
  };

  // Render Helpers
  const renderShape = (val) => {
     const shapes = [
         <div className="w-8 h-8 bg-red-500 rounded-full shadow-inner"></div>, // 0 Circle
         <div className="w-8 h-8 bg-blue-500 rounded-md shadow-inner"></div>,   // 1 Square
         <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] border-b-green-500"></div>, // 2 Triangle
         <div className="text-3xl text-yellow-400">★</div>, // 3 Star
         <div className="w-8 h-8 bg-purple-600 rotate-45"></div>, // 4 Diamond
         <div className="text-3xl text-orange-500 font-bold">+</div> // 5 Cross
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
        {/* Header */}
        <div className="p-2 flex justify-between items-center bg-slate-900/50">
           <button onClick={onBack} className="p-2 bg-slate-700 rounded-full"><X size={20}/></button>
           <div className={`font-mono text-xl font-bold ${timeRemaining < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              00:{timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining}
           </div>
        </div>

        {/* Game Area */}
        {!gameActive && !winningPlayer ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Swords size={64} className="text-yellow-400 mb-4"/>
                <h1 className="text-3xl font-bold text-center">Vormen Duel</h1>
                <p className="text-slate-400 text-center max-w-xs">Verzamel 3 dezelfde vormen. <br/>Gooi 1 weg, pak 1 uit de pot.</p>
                <button onClick={initGame} className="bg-green-600 px-8 py-4 rounded-full font-bold text-xl shadow-lg hover:bg-green-500 transition-colors animate-bounce mt-8">
                    Start Spel
                </button>
            </div>
        ) : (
            <div className="flex-1 flex flex-col justify-between p-4 relative">
                
                {/* Player 2 Area (Top) */}
                <div className={`bg-slate-700/50 p-2 rounded-xl border-2 transition-colors ${currentPlayer === 2 ? 'border-yellow-400 bg-slate-700' : 'border-transparent'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-red-400">Speler 2</span>
                        <button 
                            onClick={() => handleSabotage(2)} 
                            disabled={currentPlayer !== 2 || sabotageUsed.p2 || turnPhase !== 'discard'}
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
                    <div className="text-sm text-slate-400 uppercase tracking-widest mb-2 font-bold">{statusMsg}</div>
                    <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-900/30 rounded-2xl w-full min-h-[120px]">
                         {centerTiles.length === 0 && <div className="text-slate-600 text-xs self-center">Lege Pot</div>}
                         {centerTiles.map((val, i) => renderCard(val, () => handleCenterClick(i), turnPhase !== 'pick', i === centerTiles.length - 1))}
                    </div>
                </div>

                {/* Player 1 Area (Bottom) */}
                <div className={`bg-slate-700/50 p-2 rounded-xl border-2 transition-colors ${currentPlayer === 1 ? 'border-yellow-400 bg-slate-700' : 'border-transparent'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-blue-400">Speler 1</span>
                        <button 
                            onClick={() => handleSabotage(1)} 
                            disabled={currentPlayer !== 1 || sabotageUsed.p1 || turnPhase !== 'discard'}
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
                        <div className="flex gap-2">
                             {(winningPlayer === 1 ? p1Hand : p2Hand).map((v, i) => <div key={i} className="scale-75">{renderShape(v)}</div>)}
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

const AgilityGame = ({ onGameOver, onBack }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Game State Refs (Mutable for loop)
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

  // Constants
  const GAME_DURATION = 30;
  const GROUND_Y = 320; // Adjusted for responsive canvas
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
       // Set Canvas Size
       canvas.width = window.innerWidth;
       canvas.height = window.innerHeight;
       // Init Player
       gameStateRef.current.player.x = canvas.width / 4;
       gameStateRef.current.player.groundY = canvas.height - 100;
       gameStateRef.current.player.y = canvas.height - 100;
       gameStateRef.current.nextObstacleX = canvas.width;
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

  const playWinSound = () => {
      playTone(523.25, 'sine', 0.1); 
      setTimeout(() => playTone(659.25, 'sine', 0.1), 100); 
      setTimeout(() => playTone(783.99, 'sine', 0.2), 200); 
  };
  const playLoseSound = () => {
      playTone(440.00, 'square', 0.1); 
      setTimeout(() => playTone(392.00, 'square', 0.1), 100); 
      setTimeout(() => playTone(349.23, 'square', 0.2), 200);
  };

  const initGame = () => {
     const state = gameStateRef.current;
     const canvas = canvasRef.current;
     
     state.hasStarted = true;
     state.isGameOver = false;
     state.startTime = Date.now();
     state.gameTime = 0;
     state.score = 0;
     state.obstacles = [];
     state.powerup = null;
     state.nextPowerupTime = 0;
     state.scrollSpeed = 3;
     state.beatSpacing = 200;
     state.player.y = state.player.groundY;
     state.player.velocityY = 0;
     state.player.isJumping = false;
     state.nextObstacleX = canvas.width;

     setUiState({ score: 0, time: 0, gameOver: false, started: true });
     
     if (requestRef.current) cancelAnimationFrame(requestRef.current);
     requestRef.current = requestAnimationFrame(gameLoop);
  };

  const jump = () => {
    const state = gameStateRef.current;
    if (!state.hasStarted) {
        initGame();
        return;
    }
    if (!state.player.isJumping && !state.isGameOver) {
        state.player.isJumping = true;
        state.player.velocityY = -15; // Jump Strength
        playTone(150, 'square', 0.1); // Jump Sound
    } else if (state.isGameOver) {
        // Restart logic if needed, but App usually handles it via prop
    }
  };

  const updateRhythm = (timeFactor) => {
      const state = gameStateRef.current;
      let speedFactor = 1.0 + timeFactor * 3.0;
      state.scrollSpeed = 3 * speedFactor;
      // Recalc beat spacing based on speed
      const currentBPM = 100 * speedFactor;
      const secondsPerBeat = 60 / currentBPM;
      state.beatSpacing = state.scrollSpeed * (secondsPerBeat * 60);
      if (state.beatSpacing < 80) state.beatSpacing = 80;
      if (state.beatSpacing > 300) state.beatSpacing = 300;
  };

  const spawnEntities = (canvas) => {
      const state = gameStateRef.current;
      // Obstacles
      if (state.nextObstacleX < canvas.width + state.beatSpacing) {
          const type = state.rhythmPattern[state.patternIndex];
          if (type === 1) playTone(1000, 'square', 0.05, 0.1); // Cardio Beep
          
          state.obstacles.push({ x: state.nextObstacleX, type: type, size: 20, hasScored: false });
          state.nextObstacleX += state.beatSpacing;
          state.patternIndex = (state.patternIndex + 1) % state.rhythmPattern.length;
      }
      // Powerup
      if (state.gameTime >= state.nextPowerupTime && state.powerup === null) {
          state.powerup = { x: canvas.width + 50, y: state.player.groundY - 100, radius: 12 };
          state.nextPowerupTime = state.gameTime + POWERUP_INTERVAL;
      }
  };

  const gameLoop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const state = gameStateRef.current;

      state.gameTime = (Date.now() - state.startTime) / 1000;
      
      // Update UI occasionally or every frame
      setUiState(prev => ({ ...prev, score: state.score, time: state.gameTime, gameOver: state.isGameOver }));

      // Win Condition
      if (state.gameTime >= GAME_DURATION && !state.isGameOver) {
          state.isGameOver = true;
          playWinSound();
          setTimeout(() => onGameOver({ score: state.score, message: `Hartslag Ritme: ${state.score} punten!` }), 2000);
      }

      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Line
      const lineY = state.player.groundY + 10;
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(canvas.width, lineY);
      ctx.stroke();

      if (!state.isGameOver) {
          const timeFactor = Math.min(state.gameTime / GAME_DURATION, 1);
          updateRhythm(timeFactor);
          spawnEntities(canvas);

          // Update Obstacles
          state.obstacles.forEach(obs => obs.x -= state.scrollSpeed);
          state.obstacles = state.obstacles.filter(obs => obs.x > -50);
          
          // Scroll the spawn point as well so it doesn't drift away
          state.nextObstacleX -= state.scrollSpeed;

          // Update Powerup
          if (state.powerup) {
              state.powerup.x -= state.scrollSpeed;
              if (state.powerup.x < -50) state.powerup = null;
          }

          // Update Player
          if (state.player.isJumping || state.player.y < state.player.groundY) {
              state.player.velocityY += 0.8; // Gravity
              state.player.y += state.player.velocityY;
          }
          if (state.player.y > state.player.groundY) {
              state.player.y = state.player.groundY;
              state.player.velocityY = 0;
              state.player.isJumping = false;
          }

          // Collisions & Score
          state.obstacles.forEach(obs => {
               // Hit box check (Player is circle approx 15 radius)
               const pX = state.player.x;
               const pY = state.player.y - 25; // Center of body
               
               if (obs.x > pX - 20 && obs.x < pX + 20) {
                   if (obs.type === 1) { // Spike
                       if (state.player.y > lineY - OBSTACLE_HEIGHT) {
                           state.isGameOver = true;
                           playLoseSound();
                           setTimeout(() => onGameOver({ score: state.score, message: `Hartstilstand! Score: ${state.score}` }), 1500);
                       }
                   }
               }
               // Score pass
               if (obs.type === 1 && !obs.hasScored && obs.x < pX - 20) {
                   state.score++;
                   obs.hasScored = true;
               }
          });

          // Powerup Collision
          if (state.powerup) {
              const dx = state.player.x - state.powerup.x;
              const dy = (state.player.y - 40) - state.powerup.y;
              if (Math.sqrt(dx*dx + dy*dy) < 30) {
                  state.score += 2;
                  playTone(1500, 'triangle', 0.1);
                  state.powerup = null;
              }
          }
      }

      // DRAWING
      // Obstacles
      state.obstacles.forEach(obs => {
          ctx.beginPath();
          const color = obs.type === 1 ? '#ff4500' : '#0080ff';
          ctx.fillStyle = color;
          ctx.moveTo(obs.x - 10, lineY);
          ctx.lineTo(obs.x, lineY - (obs.type === 1 ? OBSTACLE_HEIGHT : -OBSTACLE_HEIGHT));
          ctx.lineTo(obs.x + 10, lineY);
          ctx.fill();
      });

      // Powerup
      if (state.powerup) {
          ctx.beginPath();
          ctx.fillStyle = '#00ffff';
          ctx.arc(state.powerup.x, state.powerup.y, 10 + Math.sin(state.gameTime * 10)*2, 0, Math.PI*2);
          ctx.fill();
      }

      // Player
      const pX = state.player.x;
      const pY = state.player.y;
      
      // Body
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pX, pY - 25, 10, 0, Math.PI*2); // Body
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pX, pY - 50, 15, 0, Math.PI*2); // Head
      ctx.stroke();

      if (!state.isGameOver) {
          requestRef.current = requestAnimationFrame(gameLoop);
      }
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
