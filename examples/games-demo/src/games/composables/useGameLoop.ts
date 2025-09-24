import type { CollectibleCube } from "./useCubeCollectorState";

export const useGameLoop = () => {
  const animateCubes = (cubes: CollectibleCube[]) => {
    cubes.forEach(cube => {
      if (!cube.collected) {
        cube.mesh.rotation.x += 0.01;
        cube.mesh.rotation.y += 0.01;
        // Note: position.y animation would need a different approach with our current interface
      }
    });
  };

  const updateTimer = (_timeLeft: number, setTimeLeft: (fn: (prev: number) => number) => void) => {
    setTimeLeft(prev => {
      if (prev <= 0) return 0;
      return prev - 0.016; // ~60fps
    });
  };

  return {
    animateCubes,
    updateTimer,
  };
};
