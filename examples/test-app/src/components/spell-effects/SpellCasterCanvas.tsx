/**
 * 🦊 Spell Caster Canvas Component
 * Canvas rendering for spell effects
 */

import { Component, onMount, onCleanup } from "solid-js";
import { SpellRenderer } from "./SpellRenderer";
import { createAnimationEngine } from "../../utils/animationEngine";
import type { SpellEffect } from "./SpellEffectTypes";

interface SpellCasterCanvasProps {
  activeSpells: SpellEffect[];
  onAnimationEngineReady: (engine: ReturnType<typeof createAnimationEngine>) => void;
}

export const SpellCasterCanvas: Component<SpellCasterCanvasProps> = (props) => {
  console.log("🦊 SpellCasterCanvas: Component initializing with props", { activeSpellsCount: props.activeSpells.length });
  let canvasRef: HTMLCanvasElement | undefined;
  let spellRenderer: SpellRenderer | undefined;
  let animationEngine: ReturnType<typeof createAnimationEngine> | undefined;

  // Create animation engine
  onMount(() => {
    console.log("🦊 SpellCasterCanvas: onMount - setting up canvas and animation");
    if (canvasRef) {
      console.log("🦊 SpellCasterCanvas: Creating spell renderer");
      spellRenderer = new SpellRenderer(canvasRef);
      console.log("🦊 SpellCasterCanvas: Creating animation engine");
      animationEngine = createAnimationEngine({
        frameRate: 60,
        maxFPS: 120,
        enableVSync: true,
        enablePerformanceMonitoring: true,
      });

      // Notify parent that animation engine is ready
      console.log("🦊 SpellCasterCanvas: Notifying parent that animation engine is ready");
      props.onAnimationEngineReady(animationEngine);

      // Start animation loop immediately
      console.log("🦊 SpellCasterCanvas: Starting animation loop");
      animationEngine.start({
        onUpdate: (deltaTime: number) => {
          if (spellRenderer) {
            console.log("🦊 SpellCasterCanvas: Updating spells", { deltaTime, activeSpellsCount: props.activeSpells.length });
            spellRenderer.updateSpells(performance.now());
          }
        },
        onRender: () => {
          if (spellRenderer) {
            console.log("🦊 SpellCasterCanvas: Rendering spells", { activeSpellsCount: props.activeSpells.length });
            spellRenderer.renderSpells(props.activeSpells);
          }
        },
      });

      // Test render to make sure canvas is working
      setTimeout(() => {
        if (spellRenderer) {
          console.log("🦊 SpellCasterCanvas: Test render");
          spellRenderer.renderSpells([]);
        }
      }, 100);
    } else {
      console.log("🦊 SpellCasterCanvas: onMount - no canvas ref available");
    }
  });

  onCleanup(() => {
    if (animationEngine) {
      animationEngine.stop();
    }
  });

  return (
    <div class="spell-canvas-container">
      <canvas
        ref={canvasRef}
        class="spell-canvas"
        width={600}
        height={400}
      />
      
      {/* Spell info overlay */}
      <div class="spell-overlay">
        <div class="spell-stats">
          <span>Active Spells: {props.activeSpells.length}</span>
          <span>FPS: {animationEngine?.getPerformanceStats().currentFPS.toFixed(1) || "0"}</span>
        </div>
      </div>
    </div>
  );
};
