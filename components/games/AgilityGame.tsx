
import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../../types.ts';
import { X, Target } from 'lucide-react';

export const AgilityGame: React.FC<GameProps> = ({ onGameOver, onBack }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [targetPos, setTargetPos] = useState({ top: 50, left: 50 });
  const [gameStarted, setGameStarted] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch(e) {
      console.error("AudioContext failed", e);
    }
    setGameStarted(true);
    moveTarget();

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Use timeout to break render cycle
          setTimeout(() => {
             onGameOver({ score: 0, message: '' }); // Placeholder, logic below
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch(e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array prevents timer reset on score change

  // Effect to trigger game over when time hits 0 (using effect ensures we have latest score)
  useEffect(() => {
    if (timeLeft === 0) {
      onGameOver({ score, message: `Reflex test: ${score} hits in 15s!` });
    }
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
    const top = Math.floor(Math.random() * 70) + 15; // 15-85% to keep away from edges
    const left = Math.floor(Math.random() * 70) + 15;
    setTargetPos({ top, left });
  };

  const handleHit = (e: React.PointerEvent) => {
    e.preventDefault(); // Prevent double firing
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
          <button
            onPointerDown={handleHit}
            className="absolute w-24 h-24 -ml-12 -mt-12 bg-game-accent rounded-full shadow-[0_0_15px_rgba(236,72,153,0.6)] border-4 border-white active:scale-90 transition-transform flex items-center justify-center animate-pulse-fast cursor-pointer tap-highlight-transparent"
            style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%`, touchAction: 'none' }}
          >
            <Target className="text-white w-12 h-12 pointer-events-none" />
          </button>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
           <Target size={200} />
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-500 bg-slate-900">
        Tik zo vaak mogelijk op de roze cirkel!
      </div>
    </div>
  );
};
