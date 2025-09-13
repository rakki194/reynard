/**
 * 🦊 Spell Renderer
 * Canvas-based spell effect rendering system
 */

import type { SpellEffect, SpellAnimation } from "./SpellEffectTypes";
import { calculateSpiralPosition } from "../../utils/phyllotacticMath";
import type { SpiralConfig } from "../../utils/phyllotacticMath";
import { SpellEffectsRenderer } from "./SpellEffectsRenderer";

export class SpellRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private activeSpells: Map<string, SpellAnimation> = new Map();
  private effectsRenderer: SpellEffectsRenderer;

  constructor(canvas: HTMLCanvasElement) {
    console.log("🦊 SpellRenderer: Constructor called", { canvas });
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("🦊 SpellRenderer: Failed to get 2D context");
      throw new Error("Failed to get 2D context");
    }
    this.ctx = context;
    this.effectsRenderer = new SpellEffectsRenderer(this.ctx);
    console.log("🦊 SpellRenderer: Constructor complete", { canvasWidth: canvas.width, canvasHeight: canvas.height });
  }

  /**
   * Start a spell animation
   */
  startSpell(spell: SpellEffect): void {
    console.log("🦊 SpellRenderer: startSpell called", spell);
    const animation: SpellAnimation = {
      isActive: true,
      startTime: performance.now(),
      duration: spell.duration,
      progress: 0,
      intensity: spell.intensity,
    };
    this.activeSpells.set(spell.id, animation);
    console.log("🦊 SpellRenderer: Spell animation started", { spellId: spell.id, activeSpellsCount: this.activeSpells.size });
  }

  /**
   * Stop a spell animation
   */
  stopSpell(spellId: string): void {
    this.activeSpells.delete(spellId);
  }

  /**
   * Update all active spell animations
   */
  updateSpells(currentTime: number): void {
    for (const [spellId, animation] of this.activeSpells) {
      const elapsed = currentTime - animation.startTime;
      animation.progress = Math.min(elapsed / animation.duration, 1);
      
      if (animation.progress >= 1) {
        this.activeSpells.delete(spellId);
      }
    }
  }

  /**
   * Render all active spells
   */
  renderSpells(spells: SpellEffect[]): void {
    console.log("🦊 SpellRenderer: renderSpells called", { spellsCount: spells.length, activeSpellsCount: this.activeSpells.size });
    
    // Clear canvas with a visible background
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set a more visible background
    this.ctx.fillStyle = "rgba(20, 20, 40, 0.8)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw a test pattern if no spells
    if (spells.length === 0) {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      this.ctx.font = "16px Arial";
      this.ctx.fillText("No active spells", 10, 30);
      return;
    }

    // Render each active spell
    for (const spell of spells) {
      const animation = this.activeSpells.get(spell.id);
      if (animation && animation.isActive) {
        console.log("🦊 SpellRenderer: Rendering spell", { spellId: spell.id, progress: animation.progress });
        this.renderSpell(spell, animation);
      } else {
        console.log("🦊 SpellRenderer: Skipping spell - no active animation", { spellId: spell.id, hasAnimation: !!animation });
      }
    }
  }

  /**
   * Render a single spell effect
   */
  private renderSpell(spell: SpellEffect, animation: SpellAnimation): void {
    const pattern = spell.pattern;
    const colors = spell.colorScheme;
    const progress = animation.progress;
    const intensity = animation.intensity;

    // Calculate spiral configuration
    const spiralConfig: SpiralConfig = {
      baseRadius: pattern.baseRadius,
      growthFactor: pattern.spiralGrowth,
      centerX: this.canvas.width / 2,
      centerY: this.canvas.height / 2,
    };

    // Calculate rotation angle based on time and speed
    const rotationAngle = (performance.now() * 0.001 * pattern.rotationSpeed) % (Math.PI * 2);

    // Render spiral points
    for (let i = 0; i < pattern.pointCount; i++) {
      const position = calculateSpiralPosition(i, rotationAngle, spiralConfig);
      
      // Calculate point properties based on progress and intensity
      const pointProgress = Math.min(i / pattern.pointCount, 1);
      const pointIntensity = intensity * (1 - pointProgress * 0.5);
      const pointAlpha = (1 - progress) * pointIntensity;
      
      // Skip if point is too transparent
      if (pointAlpha < 0.01) continue;

      // Set up rendering context
      this.ctx.save();
      this.ctx.globalAlpha = pointAlpha;
      
      // Create gradient for glow effect
      const gradient = this.ctx.createRadialGradient(
        position.x, position.y, 0,
        position.x, position.y, pattern.baseRadius * 0.5
      );
      gradient.addColorStop(0, colors.glow);
      gradient.addColorStop(1, colors.primary);
      
      // Draw point with glow - make it more visible
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(position.x, position.y, 5 + pointIntensity * 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw outer glow - make it more visible
      this.ctx.strokeStyle = colors.accent;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(position.x, position.y, 8 + pointIntensity * 4, 0, Math.PI * 2);
      this.ctx.stroke();
      
      this.ctx.restore();
    }

    // Render spell-specific effects
    this.effectsRenderer.renderSpellSpecificEffects(spell, animation);
  }

  /**
   * Get active spell count
   */
  getActiveSpellCount(): number {
    return this.activeSpells.size;
  }

  /**
   * Clear all spells
   */
  clearAllSpells(): void {
    this.activeSpells.clear();
  }
}