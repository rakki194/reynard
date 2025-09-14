/**
 * 🦊 Phyllotactic Game Actions
 * Action functions for phyllotactic game logic
 */

import { NATURAL_PATTERNS } from "../utils/natural-patterns";
import type { GameConfig } from "./PhyllotacticSpiralLogic";

export function createGameActions(
  config: () => GameConfig,
  setConfig: (config: GameConfig) => void,
  spiralLogic:
    | {
        updateConfig: (config: GameConfig) => void;
        initializeSpiral: () => any;
      }
    | undefined,
  setSpiralPoints: (points: any[]) => void,
) {
  const updateConfig = (newConfig: Partial<GameConfig>) => {
    console.log("🦊 PhyllotacticGameActions: Updating config", {
      oldConfig: config(),
      newConfig,
      hasSpiralLogic: !!spiralLogic,
    });
    setConfig({ ...config(), ...newConfig });
    if (spiralLogic) {
      console.log(
        "🦊 PhyllotacticGameActions: Updating spiral logic and regenerating points",
      );
      spiralLogic.updateConfig({ ...config(), ...newConfig });
      const newPoints = spiralLogic.initializeSpiral();
      console.log("🦊 PhyllotacticGameActions: Generated new spiral points", {
        count: newPoints.length,
      });
      setSpiralPoints(newPoints);
    } else {
      console.warn(
        "🦊 PhyllotacticGameActions: No spiral logic available, config update ignored",
      );
    }
  };

  const applyPattern = (pattern: "sunflower" | "pinecone" | "cactus") => {
    console.log("🦊 PhyllotacticGameActions: Applying pattern", { pattern });
    const patternConfig = NATURAL_PATTERNS[pattern];
    console.log("🦊 PhyllotacticGameActions: Pattern config", patternConfig);
    const newConfig = {
      pointCount: patternConfig.pointCount,
      spiralGrowth: patternConfig.spiralGrowth,
      baseRadius: patternConfig.baseRadius,
    };
    console.log(
      "🦊 PhyllotacticGameActions: New config for pattern",
      newConfig,
    );
    updateConfig(newConfig);
  };

  return {
    updateConfig,
    applyPattern,
  };
}
