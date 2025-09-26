/**
 * 🦊 Phyllotactic Spiral Animation Game
 * Interactive demonstration of mathematical phyllotaxis patterns
 */

import { Component, onMount } from "solid-js";
import { Card } from "reynard-primitives";
import { SpellCaster } from "./spell-effects/SpellCaster";
import { PhyllotacticGameControls } from "./PhyllotacticGameControls";
import { PhyllotacticCanvas } from "./PhyllotacticCanvas";
import { AnimationParameterControls } from "./AnimationParameterControls";
import { createPhyllotacticGameLogic } from "./PhyllotacticGameLogic";
import "./PhyllotacticSpiralGame.css";
import "./AnimationParameterControls.css";

export const PhyllotacticSpiralGame: Component = () => {
  console.log("🦊 PhyllotacticSpiralGame: Component initializing");
  const gameLogic = createPhyllotacticGameLogic();
  console.log("🦊 PhyllotacticSpiralGame: Game logic created", gameLogic);

  // Lifecycle
  onMount(() => {
    console.log("🦊 PhyllotacticSpiralGame: onMount - initializing spiral logic");
    gameLogic.initializeSpiralLogic();
    console.log("🦊 PhyllotacticSpiralGame: Spiral logic initialized");
  });

  return (
    <div class="phyllotactic-game">
      <Card class="game-container">
        <div class="game-header">
          <h2>🦊 Phyllotactic Spiral Animation</h2>
          <p>Mathematical patterns from nature with OKLCH color magic</p>
        </div>

        <div class="game-content">
          <PhyllotacticCanvas
            spiralPoints={gameLogic.spiralPoints()}
            isRunning={gameLogic.isRunning()}
            onUpdate={gameLogic.updateSpiral}
            animationConfig={gameLogic.animationConfig()}
          />

          <PhyllotacticGameControls
            isRunning={gameLogic.isRunning()}
            onToggleAnimation={() => {
              console.log("🦊 PhyllotacticSpiralGame: onToggleAnimation called from controls", {
                currentIsRunning: gameLogic.isRunning(),
              });
              gameLogic.toggleAnimation();
            }}
            onApplyPattern={gameLogic.applyPattern}
            showSpellCaster={gameLogic.showSpellCaster()}
            onToggleSpellCaster={() => {
              console.log("🦊 PhyllotacticSpiralGame: onToggleSpellCaster called from controls", {
                currentShowSpellCaster: gameLogic.showSpellCaster(),
              });
              gameLogic.setShowSpellCaster(!gameLogic.showSpellCaster());
            }}
          />

          <AnimationParameterControls
            config={gameLogic.config()}
            animationConfig={gameLogic.animationConfig()}
            onConfigChange={gameLogic.updateConfig}
            onAnimationConfigChange={gameLogic.updateAnimationConfig}
          />
        </div>
      </Card>

      {gameLogic.showSpellCaster() && (
        <div class="spell-caster-section">
          <SpellCaster />
        </div>
      )}
    </div>
  );
};
