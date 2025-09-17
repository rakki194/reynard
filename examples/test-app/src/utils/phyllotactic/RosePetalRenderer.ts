/**
 * 🌹 Rose Petal Renderer
 * Handles the rendering of rose petals with beautiful organic shapes
 */

import type { RosePetal } from "./RosePetalTypes";

export class RosePetalRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  /**
   * Render all petals with beautiful organic shapes
   */
  renderPetals(petals: RosePetal[]): void {
    this.clearCanvas();
    this.drawBackground();

    // Sort petals by distance from center for proper layering
    const sortedPetals = [...petals].sort((a, b) => a.radius - b.radius);

    // Render each petal
    sortedPetals.forEach(petal => {
      if (petal.opacity <= 0) return;
      this.renderPetal(petal);
    });

    this.drawRoseCenter();
  }

  /**
   * Clear the canvas with gradient background
   */
  private clearCanvas(): void {
    const gradient = this.ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
    gradient.addColorStop(0, "#1a0a1a");
    gradient.addColorStop(0.5, "#2a1a2a");
    gradient.addColorStop(1, "#0a0a0a");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw background gradient
   */
  private drawBackground(): void {
    // Background is already drawn in clearCanvas
  }

  /**
   * Render individual petal with organic shape
   */
  private renderPetal(petal: RosePetal): void {
    this.ctx.save();

    // Move to petal position
    this.ctx.translate(petal.x, petal.y);
    this.ctx.rotate(petal.rotation);
    this.ctx.scale(petal.scale, petal.scale);

    // Set petal color with opacity
    this.ctx.fillStyle = petal.color;
    this.ctx.globalAlpha = petal.opacity;

    // Draw petal shape
    this.drawPetalShape(petal);

    this.ctx.restore();
  }

  /**
   * Draw individual petal shape with natural lobe separation
   */
  private drawPetalShape(petal: RosePetal): void {
    const size = petal.size;
    const width = size * 0.6;
    const height = size;

    // Draw sepals if visible
    if (petal.sepalVisible) {
      this.drawSepal(petal);
    }

    // Draw petal with lobe separation
    if (petal.lobeSeparation > 0.1) {
      this.drawPetalWithLobes(petal, width, height);
    } else {
      this.drawClosedPetal(petal, width, height);
    }
  }

  /**
   * Draw closed petal (bud phase)
   */
  private drawClosedPetal(petal: RosePetal, width: number, height: number): void {
    this.ctx.beginPath();

    // Create closed bud shape
    this.ctx.moveTo(0, -height * 0.2);
    this.ctx.bezierCurveTo(width * 0.2, -height * 0.3, width * 0.3, -height * 0.1, width * 0.1, 0);
    this.ctx.bezierCurveTo(width * 0.2, height * 0.1, width * 0.1, height * 0.2, 0, height * 0.1);
    this.ctx.bezierCurveTo(-width * 0.1, height * 0.2, -width * 0.2, height * 0.1, -width * 0.1, 0);
    this.ctx.bezierCurveTo(-width * 0.3, -height * 0.1, -width * 0.2, -height * 0.3, 0, -height * 0.2);

    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw petal with separated lobes (natural growth)
   */
  private drawPetalWithLobes(petal: RosePetal, width: number, height: number): void {
    const lobeSeparation = petal.lobeSeparation;
    const separationWidth = width * 0.1 * lobeSeparation;

    // Draw left lobe
    this.ctx.beginPath();
    this.ctx.moveTo(-separationWidth, -height * 0.3);

    // Left lobe top curve
    this.ctx.bezierCurveTo(
      -width * 0.3 + separationWidth,
      -height * 0.5,
      -width * 0.5 + separationWidth,
      -height * 0.2,
      -width * 0.2 + separationWidth,
      0
    );

    // Left lobe right side
    this.ctx.bezierCurveTo(
      -width * 0.4 + separationWidth,
      height * 0.2,
      -width * 0.3 + separationWidth,
      height * 0.4,
      -width * 0.1 + separationWidth,
      height * 0.6
    );

    // Left lobe bottom curve
    this.ctx.bezierCurveTo(
      -separationWidth,
      height * 0.6,
      -separationWidth,
      height * 0.4,
      -separationWidth,
      height * 0.2
    );

    // Left lobe left side
    this.ctx.bezierCurveTo(
      -separationWidth,
      0,
      -width * 0.5 + separationWidth,
      -height * 0.2,
      -width * 0.3 + separationWidth,
      -height * 0.5
    );

    this.ctx.closePath();
    this.ctx.fill();

    // Draw right lobe
    this.ctx.beginPath();
    this.ctx.moveTo(separationWidth, -height * 0.3);

    // Right lobe top curve
    this.ctx.bezierCurveTo(
      width * 0.3 - separationWidth,
      -height * 0.5,
      width * 0.5 - separationWidth,
      -height * 0.2,
      width * 0.2 - separationWidth,
      0
    );

    // Right lobe left side
    this.ctx.bezierCurveTo(
      width * 0.4 - separationWidth,
      height * 0.2,
      width * 0.3 - separationWidth,
      height * 0.4,
      width * 0.1 - separationWidth,
      height * 0.6
    );

    // Right lobe bottom curve
    this.ctx.bezierCurveTo(separationWidth, height * 0.6, separationWidth, height * 0.4, separationWidth, height * 0.2);

    // Right lobe right side
    this.ctx.bezierCurveTo(
      separationWidth,
      0,
      width * 0.5 - separationWidth,
      -height * 0.2,
      width * 0.3 - separationWidth,
      -height * 0.5
    );

    this.ctx.closePath();
    this.ctx.fill();

    // Add petal texture with subtle lines
    this.ctx.strokeStyle = petal.color;
    this.ctx.globalAlpha = petal.opacity * 0.3;
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();
  }

  /**
   * Draw sepal (green point alternating with petals)
   */
  private drawSepal(petal: RosePetal): void {
    this.ctx.save();

    // Position sepal at petal base
    const sepalOffset = petal.size * 0.3;
    this.ctx.translate(0, sepalOffset);

    // Draw green sepal
    this.ctx.fillStyle = "#4a7c59";
    this.ctx.globalAlpha = petal.opacity * 0.8;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, petal.size * 0.15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Draw the center of the rose
   */
  private drawRoseCenter(): void {
    this.ctx.save();
    this.ctx.translate(400, 300);

    // Draw center circle
    const centerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    centerGradient.addColorStop(0, "#8B4513");
    centerGradient.addColorStop(1, "#654321");

    this.ctx.fillStyle = centerGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
    this.ctx.fill();

    // Add center texture
    this.ctx.fillStyle = "#A0522D";
    this.ctx.globalAlpha = 0.6;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const x = Math.cos(angle) * 8;
      const y = Math.sin(angle) * 8;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  /**
   * Draw growth phase indicator
   */
  drawGrowthPhaseIndicator(growthPhase: string, petalCount: number, fps: number): void {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    this.ctx.font = "bold 18px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`🌹 Rose Growth: ${growthPhase.charAt(0).toUpperCase() + growthPhase.slice(1)}`, 20, 30);

    this.ctx.font = "14px Arial";
    this.ctx.fillText(`${petalCount} petals`, 20, 50);
    this.ctx.fillText(`FPS: ${fps}`, 20, 70);

    this.ctx.restore();
  }
}
