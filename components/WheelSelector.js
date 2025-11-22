
import React, { useState, useRef } from 'react';
import { GameType } from '../types.js';
import { Loader2 } from 'lucide-react';

export const WheelSelector = ({ onSpinComplete, isSpinningExternal }) => {
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
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-8 text-white drop-shadow-lg">
          ▼
        </div>
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
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin" /> Draait...
          </span>
        ) : (
          "DRAAI HET WIEL"
        )}
      </button>
    </div>
  );
};
