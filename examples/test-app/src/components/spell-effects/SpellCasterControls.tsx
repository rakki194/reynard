/**
 * 🦊 Spell Caster Controls
 * Control interface for spell casting
 */

import { Component, For } from "solid-js";
import { Button } from "reynard-components";
import { getIcon } from "reynard-fluent-icons";
import type { SpellType } from "./SpellEffectTypes";
import { getSpellPattern } from "./SpellPatterns";

interface SpellCasterControlsProps {
  selectedSpellType: SpellType;
  onSpellTypeChange: (type: SpellType) => void;
  spellIntensity: number;
  onIntensityChange: (intensity: number) => void;
  spellDuration: number;
  onDurationChange: (duration: number) => void;
  isCasting: boolean;
  onCastSpell: () => void;
  onClearAll: () => void;
}

const spellTypes: SpellType[] = [
  "fire",
  "ice",
  "lightning",
  "earth",
  "water",
  "wind",
  "light",
  "shadow",
  "healing",
  "chaos",
];

export const SpellCasterControls: Component<SpellCasterControlsProps> = (
  props,
) => {
  return (
    <div class="spell-controls">
      <div class="spell-type-selector">
        <h4>Spell Types</h4>
        <div class="spell-buttons">
          <For each={spellTypes}>
            {(spellType) => (
              <Button
                variant={
                  props.selectedSpellType === spellType
                    ? "primary"
                    : "secondary"
                }
                size="sm"
                onClick={() => props.onSpellTypeChange(spellType)}
                disabled={props.isCasting}
              >
                {spellType.charAt(0).toUpperCase() + spellType.slice(1)}
              </Button>
            )}
          </For>
        </div>
      </div>

      <div class="spell-parameters">
        <h4>Spell Parameters</h4>
        <div class="parameter-controls">
          <div class="parameter-item">
            <label for="intensity-slider">
              Intensity: {props.spellIntensity.toFixed(1)}
            </label>
            <input
              type="range"
              id="intensity-slider"
              min="0.1"
              max="2.0"
              step="0.1"
              value={props.spellIntensity}
              onInput={(e: any) =>
                props.onIntensityChange(parseFloat(e.target.value))
              }
              disabled={props.isCasting}
            />
          </div>

          <div class="parameter-item">
            <label for="duration-slider">
              Duration: {props.spellDuration}ms
            </label>
            <input
              type="range"
              id="duration-slider"
              min="1000"
              max="10000"
              step="500"
              value={props.spellDuration}
              onInput={(e: any) =>
                props.onDurationChange(parseInt(e.target.value))
              }
              disabled={props.isCasting}
            />
          </div>
        </div>
      </div>

      <div class="spell-actions">
        <Button
          variant="success"
          size="lg"
          onClick={props.onCastSpell}
          disabled={props.isCasting}
          leftIcon={getIcon("sparkle")}
        >
          {props.isCasting ? "Casting..." : "Cast Spell"}
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            console.log("🦊 SpellCasterControls: Test spell button clicked");
            props.onCastSpell();
          }}
          leftIcon={getIcon("test")}
        >
          Test Spell
        </Button>

        <Button
          variant="danger"
          size="md"
          onClick={props.onClearAll}
          leftIcon={getIcon("delete")}
        >
          Clear All
        </Button>
      </div>

      <div class="spell-info">
        <h4>
          Current Spell:{" "}
          {props.selectedSpellType.charAt(0).toUpperCase() +
            props.selectedSpellType.slice(1)}
        </h4>
        <p>{getSpellPattern(props.selectedSpellType).description}</p>
        <div class="spell-details">
          <div class="detail-item">
            <span>
              Points: {getSpellPattern(props.selectedSpellType).pointCount}
            </span>
          </div>
          <div class="detail-item">
            <span>
              Growth:{" "}
              {getSpellPattern(props.selectedSpellType).spiralGrowth.toFixed(1)}
            </span>
          </div>
          <div class="detail-item">
            <span>
              Speed:{" "}
              {getSpellPattern(props.selectedSpellType).rotationSpeed.toFixed(
                1,
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
