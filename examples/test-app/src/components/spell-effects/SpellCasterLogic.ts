/**
 * 🦊 Spell Caster Logic
 * Core logic for spell casting and management
 */

import { createSignal } from "solid-js";
import type { SpellEffect, SpellType } from "./SpellEffectTypes";
import { getSpellPattern } from "./SpellPatterns";
import { getSpellColors } from "./SpellColors";
import type { SpellRenderer } from "./SpellRenderer";

export function createSpellCasterLogic(spellRenderer?: SpellRenderer) {
  console.log("🦊 SpellCasterLogic: Creating spell caster logic", { hasSpellRenderer: !!spellRenderer });
  const [activeSpells, setActiveSpells] = createSignal<SpellEffect[]>([]);
  const [selectedSpellType, setSelectedSpellType] = createSignal<SpellType>("fire");
  const [isCasting, setIsCasting] = createSignal(false);
  const [spellIntensity, setSpellIntensity] = createSignal(1.0);
  const [spellDuration, setSpellDuration] = createSignal(3000);
  console.log("🦊 SpellCasterLogic: Signals created", { 
    activeSpellsCount: activeSpells().length, 
    selectedSpellType: selectedSpellType(), 
    isCasting: isCasting() 
  });

  // Spell casting functions
  const castSpell = (spellType: SpellType) => {
    console.log("🦊 SpellCasterLogic: castSpell called", { spellType, isCasting: isCasting() });
    if (isCasting()) {
      console.log("🦊 SpellCasterLogic: Already casting, ignoring request");
      return;
    }

    setIsCasting(true);
    console.log("🦊 SpellCasterLogic: Set isCasting to true");
    
    const pattern = getSpellPattern(spellType);
    const colors = getSpellColors(spellType);
    console.log("🦊 SpellCasterLogic: Got pattern and colors", { pattern, colors });
    
    const spell: SpellEffect = {
      id: `spell-${Date.now()}-${Math.random()}`,
      name: `${spellType} spell`,
      type: spellType,
      pattern,
      colorScheme: colors,
      intensity: spellIntensity(),
      duration: spellDuration(),
      radius: pattern.baseRadius,
      speed: pattern.rotationSpeed,
    };
    console.log("🦊 SpellCasterLogic: Created spell", spell);

    setActiveSpells(prev => {
      const newSpells = [...prev, spell];
      console.log("🦊 SpellCasterLogic: Added spell to active spells", { count: newSpells.length });
      return newSpells;
    });
    
    if (spellRenderer) {
      console.log("🦊 SpellCasterLogic: Starting spell in renderer");
      spellRenderer.startSpell(spell);
    } else {
      console.log("🦊 SpellCasterLogic: No spell renderer available");
    }

    // Remove spell after duration
    setTimeout(() => {
      console.log("🦊 SpellCasterLogic: Spell duration expired, removing", spell.id);
      setActiveSpells(prev => prev.filter(s => s.id !== spell.id));
      if (spellRenderer) {
        spellRenderer.stopSpell(spell.id);
      }
      setIsCasting(false);
    }, spellDuration());
  };

  const clearAllSpells = () => {
    setActiveSpells([]);
    if (spellRenderer) {
      spellRenderer.clearAllSpells();
    }
  };

  return {
    activeSpells,
    selectedSpellType,
    isCasting,
    spellIntensity,
    spellDuration,
    setSelectedSpellType,
    setSpellIntensity,
    setSpellDuration,
    castSpell,
    clearAllSpells,
  };
}
