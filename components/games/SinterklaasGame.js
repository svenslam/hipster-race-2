
import React, { useState, useEffect, useRef } from 'react';
import { X, Swords, Trophy, ShieldAlert } from 'lucide-react';

export const SinterklaasGame = ({ onGameOver, onBack }) => {
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
     const opponent = player; // The one clicking
     const activePlayer = opponent === 1 ? 2 : 1;
     
     if(!gameActive || activePlayer !== currentPlayer || turnPhase !== 'pick') return;
     if((opponent === 1 && sabotageUsed.p1) || (opponent === 2 && sabotageUsed.p2)) return;

     setSabotageUsed(prev => ({ ...prev, [opponent === 1 ? 'p1' : 'p2']: true }));
     
     let newDeck = [...deck, ...centerTiles];
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

  const renderShape = (val) => {
     const shapes = [
         <div className="w-8 h-8 bg-red-500 rounded-full shadow-inner"></div>, 
         <div className="w-8 h-8 bg-blue-500 rounded-md shadow-inner"></div>,   
         <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] border-b-green-500"></div>, 
         <div className="text-3xl text-yellow-400">★</div>, 
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
                <p className="text-slate-400 text-center max-w-xs">Verzamel 3 dezelfde vormen. <br/>Gooi 1 weg, pak 1 uit de pot.</p>
                <button onClick={initGame} className="bg-green-600 px-8 py-4 rounded-full font-bold text-xl shadow-lg hover:bg-green-500 transition-colors animate-bounce mt-8">
                    Start Spel
                </button>
            </div>
        ) : (
            <div className="flex-1 flex flex-col justify-between p-4 relative">
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

                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-sm text-slate-400 uppercase tracking-widest mb-2 font-bold text-center">{statusMsg}</div>
                    <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-900/30 rounded-2xl w-full min-h-[120px]">
                         {centerTiles.length === 0 && <div className="text-slate-600 text-xs self-center">Lege Pot</div>}
                         {centerTiles.map((val, i) => renderCard(val, () => handleCenterClick(i), turnPhase !== 'pick', i === centerTiles.length - 1))}
                    </div>
                </div>

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
