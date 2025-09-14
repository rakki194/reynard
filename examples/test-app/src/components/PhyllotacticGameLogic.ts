/**
 * 🦊 Phyllotactic Game Logic
 * Game state management and logic
 */

import { createSignal } from "solid-js";
import {
  PhyllotacticSpiralLogic,
  type SpiralPoint,
  type GameConfig,
} from "./PhyllotacticSpiralLogic";
import {
  createDefaultConfig,
  createDefaultAnimationConfig,
} from "./PhyllotacticGameConfig";
import { createGameActions } from "./PhyllotacticGameActions";
import { createAnimationFunctions } from "./PhyllotacticGameAnimation";

export function createPhyllotacticGameLogic() {
  console.log("🦊 PhyllotacticGameLogic: Creating game logic");
  const [spiralPoints, setSpiralPoints] = createSignal<SpiralPoint[]>([]);
  const [isRunning, setIsRunning] = createSignal(false);
  const [currentAngle, setCurrentAngle] = createSignal(0);
  const [config, setConfig] = createSignal<GameConfig>(createDefaultConfig());
  const [animationConfig, setAnimationConfig] = createSignal(
    createDefaultAnimationConfig(),
  );
  const [showSpellCaster, setShowSpellCaster] = createSignal(false);
  console.log("🦊 PhyllotacticGameLogic: Signals created", {
    isRunning: isRunning(),
    showSpellCaster: showSpellCaster(),
  });

  let spiralLogic: PhyllotacticSpiralLogic | undefined;

  // Initialize spiral logic
  const initializeSpiralLogic = () => {
    console.log(
      "🦊 PhyllotacticGameLogic: Initializing spiral logic with config",
      config(),
    );
    spiralLogic = new PhyllotacticSpiralLogic(config());
    const initialPoints = spiralLogic.initializeSpiral();
    console.log(
      "🦊 PhyllotacticGameLogic: Initial spiral points generated",
      initialPoints.length,
    );
    setSpiralPoints(initialPoints);

    // Recreate game actions and animation functions with the initialized spiral logic
    console.log(
      "🦊 PhyllotacticGameLogic: Recreating game actions and animation functions with spiral logic",
    );
    gameActions = createGameActions(
      config,
      setConfig,
      spiralLogic,
      setSpiralPoints,
    );
    animationFunctions = createAnimationFunctions(
      isRunning,
      setIsRunning,
      currentAngle,
      setCurrentAngle,
      config,
      spiralPoints,
      setSpiralPoints,
      spiralLogic,
    );
  };

  // Create game actions and animation functions that will be updated when spiral logic is initialized
  let gameActions = createGameActions(
    config,
    setConfig,
    spiralLogic,
    setSpiralPoints,
  );
  let animationFunctions = createAnimationFunctions(
    isRunning,
    setIsRunning,
    currentAngle,
    setCurrentAngle,
    config,
    spiralPoints,
    setSpiralPoints,
    spiralLogic,
  );

  const updateAnimationConfig = (
    newConfig: Partial<typeof animationConfig>,
  ) => {
    console.log("🦊 PhyllotacticGameLogic: Updating animation config", {
      oldConfig: animationConfig(),
      newConfig,
    });
    setAnimationConfig((prev) => ({ ...prev, ...newConfig }));
  };

  return {
    spiralPoints,
    isRunning,
    currentAngle,
    config,
    animationConfig,
    showSpellCaster,
    setShowSpellCaster,
    initializeSpiralLogic,
    get updateSpiral() {
      return animationFunctions.updateSpiral;
    },
    get toggleAnimation() {
      return animationFunctions.toggleAnimation;
    },
    get applyPattern() {
      return gameActions.applyPattern;
    },
    get updateConfig() {
      return gameActions.updateConfig;
    },
    updateAnimationConfig,
  };
}
