export enum GameType {
  F1 = 'FORMULE_1',
  MUSIC = 'MUZIEK',
  SINTERKLAAS = 'SINTERKLAAS',
  AGILITY = 'BEHENDIGHEID'
}

export interface GameResult {
  score: number;
  message: string;
}

export interface GameProps {
  onGameOver: (result: GameResult) => void;
  onBack: () => void;
}