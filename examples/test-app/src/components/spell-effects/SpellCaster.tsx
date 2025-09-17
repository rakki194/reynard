/**
 * 🦊 Spell Caster Component
 * Interactive spell casting interface with mathematical magic effects
 */

import { Component } from "solid-js";
import { Card } from "reynard-components";
import { SpellCasterCanvas } from "./SpellCasterCanvas";
import { SpellCasterControls } from "./SpellCasterControls";
import { createSpellCasterLogic } from "./SpellCasterLogic";

export const SpellCaster: Component = () => {
  console.log("🦊 SpellCaster: Component initializing");
  const spellLogic = createSpellCasterLogic();
  console.log("🦊 SpellCaster: Spell logic created", spellLogic);

  const handleAnimationEngineReady = (engine: unknown) => {
    console.log("🦊 SpellCaster: Animation engine ready", engine);
    // Animation engine is ready, but we don't need to store it here
    // since the canvas component manages it
  };

  return (
    <div class="spell-caster">
      <Card class="spell-caster-container">
        <div class="spell-caster-header">
          <h2>🦊 Mathematical Spell Caster</h2>
          <p>Cast spells using phyllotactic mathematics and OKLCH color magic</p>
        </div>

        <div class="spell-caster-content">
          <SpellCasterCanvas
            activeSpells={spellLogic.activeSpells()}
            onAnimationEngineReady={handleAnimationEngineReady}
          />

          <SpellCasterControls
            selectedSpellType={spellLogic.selectedSpellType()}
            onSpellTypeChange={spellLogic.setSelectedSpellType}
            spellIntensity={spellLogic.spellIntensity()}
            onIntensityChange={spellLogic.setSpellIntensity}
            spellDuration={spellLogic.spellDuration()}
            onDurationChange={spellLogic.setSpellDuration}
            isCasting={spellLogic.isCasting()}
            onCastSpell={() => spellLogic.castSpell(spellLogic.selectedSpellType())}
            onClearAll={spellLogic.clearAllSpells}
          />
        </div>
      </Card>
    </div>
  );
};
