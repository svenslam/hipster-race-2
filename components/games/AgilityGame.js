
import React, { useState, useEffect, useRef } from 'react';
import { X, Activity } from 'lucide-react';

export const AgilityGame = ({ onGameOver, onBack }) => {
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
