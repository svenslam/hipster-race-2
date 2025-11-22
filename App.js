
import React, { useState } from 'react';
import { GameType } from './types.js';
import { WheelSelector } from './components/WheelSelector.js';
import { F1Game } from './components/games/F1Game.js';
import { MusicGame } from './components/games/MusicGame.js';
import { SinterklaasGame } from './components/games/SinterklaasGame.js';
import { AgilityGame } from './components/games/AgilityGame.js';
import { Trophy, LogOut } from 'lucide-react';

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
      case GameType.F1:
        return <F1Game onGameOver={handleGameOver} onBack={() => setActiveGame(null)} />;
      case GameType.MUSIC:
        return <MusicGame onGameOver={handleGameOver} onBack={() => setActiveGame(null)} />;
      case GameType.SINTERKLAAS:
        return <SinterklaasGame onGameOver={handleGameOver} onBack={() => setActiveGame(null)} />;
      case GameType.AGILITY:
        return <AgilityGame onGameOver={handleGameOver} onBack={() => setActiveGame(null)} />;
      default:
        return null;
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
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-game-secondary to-game-accent drop-shadow-lg mb-2">
              MINI GAME MIX
            </h1>
            <p className="text-slate-400 text-sm">Draai het wiel en speel!</p>
          </header>

          <div className="relative py-8">
             <WheelSelector onSpinComplete={handleGameSelection} isSpinningExternal={isSpinning} />
          </div>

          {lastResult && (
            <div className="bg-game-surface border border-game-primary/30 rounded-xl p-6 w-full text-center animate-fade-in shadow-2xl">
              <div className="flex justify-center mb-2">
                <Trophy className="w-10 h-10 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Spel Afgelopen!</h2>
              <div className="text-3xl font-black text-game-accent mb-2">{lastResult.score} Ptn</div>
              <p className="text-slate-300 text-sm">{lastResult.message}</p>
            </div>
          )}

          {onExit && (
            <button 
              onClick={onExit} 
              disabled={isSpinning}
              className="mt-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <LogOut size={16} /> Terug naar Hoofdmenu
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-full absolute top-0 left-0 bg-game-dark z-50">
          {renderGame()}
        </div>
      )}
    </div>
  );
}
