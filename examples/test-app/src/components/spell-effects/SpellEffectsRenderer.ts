/**
 * 🦊 Spell Effects Renderer
 * Specialized rendering for different spell types
 */

import type { SpellEffect, SpellAnimation } from "./SpellEffectTypes";

export class SpellEffectsRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Render spell-specific visual effects
   */
  renderSpellSpecificEffects(spell: SpellEffect, animation: SpellAnimation): void {
    const centerX = this.ctx.canvas.width / 2;
    const centerY = this.ctx.canvas.height / 2;
    const progress = animation.progress;
    const intensity = animation.intensity;

    this.ctx.save();
    this.ctx.globalAlpha = (1 - progress) * intensity;

    switch (spell.type) {
      case "fire":
        this.renderFireEffects(centerX, centerY, spell);
        break;
      case "ice":
        this.renderIceEffects(centerX, centerY, spell);
        break;
      case "lightning":
        this.renderLightningEffects(centerX, centerY, spell);
        break;
      case "healing":
        this.renderHealingEffects(centerX, centerY, spell);
        break;
      default:
        this.renderGenericEffects(centerX, centerY, spell);
    }

    this.ctx.restore();
  }

  private renderFireEffects(x: number, y: number, spell: SpellEffect): void {
    // Fire particles
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 50 + Math.sin(performance.now() * 0.001 + i) * 20;
      const particleX = x + Math.cos(angle) * radius;
      const particleY = y + Math.sin(angle) * radius;
      
      this.ctx.fillStyle = spell.colorScheme.glow;
      this.ctx.beginPath();
      this.ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private renderIceEffects(x: number, y: number, spell: SpellEffect): void {
    // Ice crystals
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 40;
      const crystalX = x + Math.cos(angle) * radius;
      const crystalY = y + Math.sin(angle) * radius;
      
      this.ctx.strokeStyle = spell.colorScheme.primary;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(crystalX, crystalY);
      this.ctx.lineTo(crystalX + 10, crystalY + 10);
      this.ctx.lineTo(crystalX - 5, crystalY + 15);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  private renderLightningEffects(x: number, y: number, spell: SpellEffect): void {
    // Lightning bolts
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const boltLength = 60 + Math.sin(performance.now() * 0.01) * 20;
      
      this.ctx.strokeStyle = spell.colorScheme.glow;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      
      for (let j = 0; j < 5; j++) {
        const segmentLength = boltLength / 5;
        const segmentX = x + Math.cos(angle) * segmentLength * j;
        const segmentY = y + Math.sin(angle) * segmentLength * j;
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        
        this.ctx.lineTo(segmentX + offsetX, segmentY + offsetY);
      }
      this.ctx.stroke();
    }
  }

  private renderHealingEffects(x: number, y: number, spell: SpellEffect): void {
    // Healing orbs
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + performance.now() * 0.001;
      const radius = 30 + Math.sin(performance.now() * 0.002) * 10;
      const orbX = x + Math.cos(angle) * radius;
      const orbY = y + Math.sin(angle) * radius;
      
      this.ctx.fillStyle = spell.colorScheme.primary;
      this.ctx.beginPath();
      this.ctx.arc(orbX, orbY, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private renderGenericEffects(x: number, y: number, spell: SpellEffect): void {
    // Generic magical aura
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 50);
    gradient.addColorStop(0, spell.colorScheme.glow);
    gradient.addColorStop(1, "transparent");
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 50, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
