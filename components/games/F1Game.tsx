import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../../types';
import { X } from 'lucide-react';

type GameState = 'IDLE' | 'WAITING' | 'LIGHTS_1' | 'LIGHTS_2' | 'LIGHTS_3' | 'LIGHTS_4' | 'LIGHTS_5' | 'READY' | 'GO' | 'FALSE_START' | 'FINISHED';

export const F1Game: React.FC<GameProps> = ({ onGameOver, onBack }) => {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const playTone = (freq: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle', duration: number) => {
    if (!audioCtxRef.current) return;
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
  };

  const startSequence = () => {
    if (attempts >= MAX_ATTEMPTS) return;

    setGameState('WAITING');
    setReactionTime(null);
    
    let delay = 500; 
    
    // Lights sequence - Faster (400ms interval)
    [1, 2, 3, 4, 5].forEach((i) => {
      timeoutRef.current = setTimeout(() => {
        setGameState(`LIGHTS_${i}` as GameState);
        playTone(440 + (i * 50), 'square', 0.08); 
      }, delay);
      delay += 400;
    });

    // Random time to go out (between 0.2s and 2.0s after 5th light)
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
    // Reset/Start conditions
    if (gameState === 'IDLE' || gameState === 'FINISHED' || gameState === 'FALSE_START') {
      if (attempts >= MAX_ATTEMPTS && gameState === 'FINISHED') {
        return; 
      }
      startSequence();
      return;
    }

    // False Start Condition
    if (gameState.startsWith('LIGHTS') || gameState === 'WAITING') {
      setGameState('FALSE_START');
      playTone(150, 'sawtooth', 0.5);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    // Success Condition
    if (gameState === 'GO') {
      const endTime = Date.now();
      const diff = endTime - startTimeRef.current;
      setReactionTime(diff);
      setTotalTime(prev => prev + diff);
      setAttempts(prev => prev + 1);
      setGameState('FINISHED');

      if (attempts + 1 >= MAX_ATTEMPTS) {
        // End of game
        setTimeout(() => {
           onGameOver({
             score: Math.floor((totalTime + diff) / MAX_ATTEMPTS),
             message: `Gemiddelde: ${Math.floor((totalTime + diff) / MAX_ATTEMPTS)}ms`
           });
        }, 2500); // Slightly longer wait so user can see the result
      }
    }
  };

  const getLightClass = (lightIndex: number) => {
    const activeMap: Record<string, number> = {
      'LIGHTS_1': 1, 'LIGHTS_2': 2, 'LIGHTS_3': 3, 'LIGHTS_4': 4, 'LIGHTS_5': 5,
      'READY': 5
    };
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

      {/* Lights Container */}
      <div className="flex justify-center gap-2 sm:gap-4 mb-12 px-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
             <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full transition-all duration-75 ${getLightClass(i)}`}></div>
             <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full opacity-30 bg-slate-900 border border-slate-700`}></div>
          </div>
        ))}
      </div>

      {/* Interaction Area */}
      <button 
        onPointerDown={handleTap}
        className={`
          flex-1 w-full rounded-2xl flex flex-col items-center justify-center text-3xl font-bold transition-colors touch-manipulation
          ${gameState === 'FALSE_START' ? 'bg-red-900/50 text-red-400' : ''}
          ${gameState === 'GO' ? 'bg-green-900/50 text-green-400' : ''}
          ${['IDLE', 'FINISHED'].includes(gameState) ? 'bg-slate-800 text-white hover:bg-slate-700' : ''}
          ${gameState.startsWith('LIGHTS') || gameState === 'WAITING' ? 'bg-black cursor-default' : ''}
        `}
      >
        {gameState === 'IDLE' && "Tik om te Starten"}
        {gameState === 'WAITING' && "Wacht..."}
        {gameState.startsWith('LIGHTS') && "Klaar..."}
        {gameState === 'GO' && `TIK NU!`}
        {gameState === 'FALSE_START' && (
          <div className="animate-pulse text-center">
            <div>VALSE START!</div>
            <div className="text-sm font-normal mt-2 opacity-70">Tik om opnieuw te proberen</div>
          </div>
        )}
        
        {gameState === 'FINISHED' && (
           <div className="text-center">
             <div className="text-5xl font-black mb-2">{reactionTime} <span className="text-2xl font-normal text-slate-400">ms</span></div>
             {attempts >= MAX_ATTEMPTS ? (
               <div className="animate-pulse text-game-accent font-bold mt-4">
                 SPEL COMPLEET!
                 <div className="text-sm text-white mt-1 font-normal">Gemiddelde: {Math.floor(totalTime / MAX_ATTEMPTS)} ms</div>
               </div>
             ) : (
               <div className="text-sm font-normal mt-2 opacity-70">Tik voor volgende ronde</div>
             )}
           </div>
        )}
      </button>
      
      <p className="text-center text-slate-500 text-xs mt-4">
        Wacht tot alle 5 lichten uitgaan en tik dan zo snel mogelijk.
      </p>
    </div>
  );
};
