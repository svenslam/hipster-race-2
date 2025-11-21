import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../../types';
import { X, Play } from 'lucide-react';

const COLORS = [
  { id: 0, color: 'bg-green-500', active: 'bg-green-300 shadow-[0_0_30px_#86efac]', sound: 261.63 }, // C4
  { id: 1, color: 'bg-red-500', active: 'bg-red-300 shadow-[0_0_30px_#fca5a5]', sound: 329.63 },   // E4
  { id: 2, color: 'bg-yellow-500', active: 'bg-yellow-300 shadow-[0_0_30px_#fde047]', sound: 392.00 }, // G4
  { id: 3, color: 'bg-blue-500', active: 'bg-blue-300 shadow-[0_0_30px_#93c5fd]', sound: 523.25 },  // C5
];

export const MusicGame: React.FC<GameProps> = ({ onGameOver, onBack }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'START' | 'PLAYING' | 'LISTENING' | 'GAME_OVER'>('START');
  
  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const playTone = (freq: number) => {
    if (!audioCtxRef.current) return;
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
  };

  const addToSequence = () => {
    const nextColor = Math.floor(Math.random() * 4);
    const newSequence = [...sequence, nextColor];
    setSequence(newSequence);
    playSequence(newSequence);
  };

  const playSequence = async (seq: number[]) => {
    setStatus('PLAYING');
    setIsPlayingSequence(true);
    setUserStep(0);
    
    // Wait a bit before starting
    await new Promise(r => setTimeout(r, 800));

    for (let i = 0; i < seq.length; i++) {
      const padIndex = seq[i];
      setActivePad(padIndex);
      playTone(COLORS[padIndex].sound);
      await new Promise(r => setTimeout(r, 400)); // Light on duration
      setActivePad(null);
      await new Promise(r => setTimeout(r, 200)); // Gap
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

  const handlePadClick = (index: number) => {
    if (status !== 'LISTENING') return;

    // Visual feedback
    setActivePad(index);
    playTone(COLORS[index].sound);
    setTimeout(() => setActivePad(null), 200);

    // Logic
    if (sequence[userStep] === index) {
      if (userStep === sequence.length - 1) {
        // Success for this round
        setScore(prev => prev + 1);
        setStatus('PLAYING'); // Lock input immediately
        setTimeout(addToSequence, 500);
      } else {
        setUserStep(prev => prev + 1);
      }
    } else {
      // Fail
      setStatus('GAME_OVER');
      // Error sound
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        osc.frequency.value = 150;
        osc.type = 'sawtooth';
        osc.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.5);
      }
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
               <button onClick={startGame} className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                 <Play size={20} fill="black" /> Start
               </button>
             </div>
           )}

           {COLORS.map((btn, i) => (
             <button
               key={i}
               className={`
                 rounded-2xl transition-all duration-100 border-b-4 border-black/20 active:border-b-0 active:translate-y-1
                 ${activePad === i ? btn.active : btn.color}
               `}
               onPointerDown={() => handlePadClick(i)}
               disabled={status !== 'LISTENING'}
             />
           ))}
        </div>
      </div>
    </div>
  );
};