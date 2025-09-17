/**
 * 🦊 Phyllotactic Game Animation
 * Animation functions for phyllotactic game logic
 */

import type { SpiralPoint } from "./PhyllotacticSpiralLogic";

export function createAnimationFunctions(
  isRunning: () => boolean,
  setIsRunning: (running: boolean) => void,
  currentAngle: () => number,
  setCurrentAngle: (angle: number) => void,
  config: () => any,
  spiralPoints: () => SpiralPoint[],
  setSpiralPoints: (points: SpiralPoint[]) => void,
  spiralLogic:
    | {
        updateSpiralPoints: (points: SpiralPoint[], angle: number) => SpiralPoint[];
      }
    | undefined
) {
  const updateSpiral = (deltaTime: number) => {
    if (!isRunning() || !spiralLogic) {
      console.log("🦊 PhyllotacticGameAnimation: updateSpiral skipped", {
        isRunning: isRunning(),
        hasSpiralLogic: !!spiralLogic,
      });
      return;
    }

    const newAngle = currentAngle() + (config().rotationSpeed * deltaTime) / 16.67;
    setCurrentAngle(newAngle);
    const updatedPoints = spiralLogic.updateSpiralPoints(spiralPoints(), newAngle);
    setSpiralPoints(updatedPoints);
    console.log("🦊 PhyllotacticGameAnimation: Spiral updated", {
      deltaTime,
      newAngle,
      pointsCount: updatedPoints.length,
    });
  };

  const toggleAnimation = () => {
    const newRunningState = !isRunning();
    console.log("🦊 PhyllotacticGameAnimation: Toggling animation", {
      from: isRunning(),
      to: newRunningState,
    });
    setIsRunning(newRunningState);
  };

  return {
    updateSpiral,
    toggleAnimation,
  };
}
