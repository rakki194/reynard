/**
 * 🦊 Phyllotactic Game Controls
 * Control interface for the spiral animation game
 */

import { Component } from "solid-js";
import { Button } from "reynard-components";
import { getIcon } from "reynard-fluent-icons";

interface PhyllotacticGameControlsProps {
  isRunning: boolean;
  onToggleAnimation: () => void;
  onApplyPattern: (pattern: "sunflower" | "pinecone" | "cactus") => void;
  showSpellCaster: boolean;
  onToggleSpellCaster: () => void;
}

export const PhyllotacticGameControls: Component<PhyllotacticGameControlsProps> = (props) => {
  console.log("🦊 PhyllotacticGameControls: Component rendering with props", { 
    isRunning: props.isRunning, 
    showSpellCaster: props.showSpellCaster,
    hasOnToggleAnimation: !!props.onToggleAnimation,
    hasOnToggleSpellCaster: !!props.onToggleSpellCaster
  });
  
  return (
    <div class="controls-panel">
      <div class="pattern-buttons">
        <Button variant="secondary" size="sm" onClick={() => props.onApplyPattern("sunflower")}>
          🌻 Sunflower
        </Button>
        <Button variant="secondary" size="sm" onClick={() => props.onApplyPattern("pinecone")}>
          🌲 Pinecone
        </Button>
        <Button variant="secondary" size="sm" onClick={() => props.onApplyPattern("cactus")}>
          🌵 Cactus
        </Button>
      </div>

      <div class="animation-controls">
        <Button
          variant={props.isRunning ? "danger" : "success"}
          onClick={() => {
            console.log("🦊 PhyllotacticGameControls: Play/Pause button clicked", { 
              currentState: props.isRunning, 
              onToggleAnimation: props.onToggleAnimation 
            });
            props.onToggleAnimation();
          }}
          leftIcon={getIcon(props.isRunning ? "pause" : "play")}
        >
          {props.isRunning ? "Pause" : "Play"}
        </Button>
      </div>

      <div class="spell-caster-toggle">
        <Button
          variant="primary"
          onClick={() => {
            console.log("🦊 PhyllotacticGameControls: Spell Caster toggle button clicked", { 
              currentState: props.showSpellCaster, 
              onToggleSpellCaster: props.onToggleSpellCaster 
            });
            props.onToggleSpellCaster();
          }}
          leftIcon={getIcon("sparkle")}
        >
          {props.showSpellCaster ? "Hide" : "Show"} Spell Caster
        </Button>
      </div>
    </div>
  );
};
