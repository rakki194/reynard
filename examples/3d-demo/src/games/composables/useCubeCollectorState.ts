import { createSignal } from "solid-js";
import type { ThreeMesh } from "../types/three";

export interface CollectibleCube {
  id: number;
  mesh: ThreeMesh;
  collected: boolean;
  points: number;
}

export const useCubeCollectorState = () => {
  const [score, setScore] = createSignal(0);
  const [cubes, setCubes] = createSignal<CollectibleCube[]>([]);
  const [gameStarted, setGameStarted] = createSignal(false);
  const [timeLeft, setTimeLeft] = createSignal(60);

  const updateScore = (points: number) => {
    const newScore = score() + points;
    setScore(newScore);
    return newScore;
  };

  const collectCube = (cubeId: number) => {
    setCubes(prev => prev.map(c => (c.id === cubeId ? { ...c, collected: true } : c)));
  };

  const getRemainingCubes = () => cubes().filter(c => !c.collected);

  const isGameWon = () => getRemainingCubes().length === 0;

  const resetGame = () => {
    setScore(0);
    setCubes([]);
    setGameStarted(false);
    setTimeLeft(60);
  };

  return {
    score,
    cubes,
    gameStarted,
    timeLeft,
    setScore,
    setCubes,
    setGameStarted,
    setTimeLeft,
    updateScore,
    collectCube,
    getRemainingCubes,
    isGameWon,
    resetGame,
  };
};
