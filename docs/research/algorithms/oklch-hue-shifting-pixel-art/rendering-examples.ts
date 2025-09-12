/**
 * Example usage and rendering demonstrations
 * Shows how to use the canvas integration components together
 */

import type { OKLCHColor } from "reynard-colors";
import { PixelArtRenderer } from "./pixel-art-renderer";
import { SpriteRenderer, type PixelSprite } from "./sprite-renderer";
import { createTintedSprite, createBrightnessSprite } from "./sprite-effects";
import { createExampleCharacter } from "./sprite-utils";

/**
 * Example: Render a character with different lighting conditions
 */
export function renderCharacterWithLighting(
  renderer: PixelArtRenderer,
  spriteRenderer: SpriteRenderer,
  character: PixelSprite,
  x: number,
  y: number,
  lighting: "day" | "night" | "sunset",
): void {
  let modifiedSprite = character;

  switch (lighting) {
    case "night":
      modifiedSprite = createBrightnessSprite(character, -0.3);
      break;
    case "sunset":
      modifiedSprite = createTintedSprite(
        character,
        { l: 60, c: 0.2, h: 30 }, // Orange tint
        0.4,
      );
      break;
    case "day":
    default:
      // Use original sprite
      break;
  }

  spriteRenderer.drawSpriteWithPalette(
    modifiedSprite,
    x,
    y,
    modifiedSprite.palette,
  );
}

/**
 * Example: Create a simple scene with multiple characters
 */
export function createSimpleScene(
  canvas: HTMLCanvasElement,
  pixelSize: number = 4,
): void {
  const renderer = new PixelArtRenderer(canvas, pixelSize);
  const spriteRenderer = new SpriteRenderer(renderer);

  // Clear canvas with background color
  renderer.clear();
  renderer.drawRect(0, 0, canvas.width / pixelSize, canvas.height / pixelSize, {
    l: 80,
    c: 0.05,
    h: 120, // Light green background
  });

  // Create character
  const character = createExampleCharacter();

  // Render characters in different lighting conditions
  renderCharacterWithLighting(
    renderer,
    spriteRenderer,
    character,
    10,
    10,
    "day",
  );
  renderCharacterWithLighting(
    renderer,
    spriteRenderer,
    character,
    20,
    10,
    "sunset",
  );
  renderCharacterWithLighting(
    renderer,
    spriteRenderer,
    character,
    30,
    10,
    "night",
  );
}

/**
 * Example: Animate a character with hue shifting
 */
export function animateCharacterWithHueShift(
  canvas: HTMLCanvasElement,
  pixelSize: number = 4,
): void {
  const renderer = new PixelArtRenderer(canvas, pixelSize);
  const spriteRenderer = new SpriteRenderer(renderer);

  const character = createExampleCharacter();
  let hueShift = 0;

  const animate = () => {
    renderer.clear();

    // Draw character with current hue shift
    spriteRenderer.drawSpriteWithHueShift(character, 10, 10, hueShift);

    // Update hue shift
    hueShift = (hueShift + 2) % 360;

    requestAnimationFrame(animate);
  };

  animate();
}

/**
 * Example: Create a color palette demonstration
 */
export function createPaletteDemo(
  canvas: HTMLCanvasElement,
  pixelSize: number = 4,
): void {
  const renderer = new PixelArtRenderer(canvas, pixelSize);

  // Define a color palette
  const palette: OKLCHColor[] = [
    { l: 20, c: 0.2, h: 0 }, // Dark red
    { l: 40, c: 0.2, h: 0 }, // Medium red
    { l: 60, c: 0.2, h: 0 }, // Light red
    { l: 20, c: 0.2, h: 120 }, // Dark green
    { l: 40, c: 0.2, h: 120 }, // Medium green
    { l: 60, c: 0.2, h: 120 }, // Light green
    { l: 20, c: 0.2, h: 240 }, // Dark blue
    { l: 40, c: 0.2, h: 240 }, // Medium blue
    { l: 60, c: 0.2, h: 240 }, // Light blue
  ];

  renderer.clear();

  // Draw color swatches
  for (let i = 0; i < palette.length; i++) {
    const x = (i % 3) * 10;
    const y = Math.floor(i / 3) * 10;
    renderer.drawRect(x, y, 8, 8, palette[i]);
  }
}

/**
 * Example: Performance test with many sprites
 */
export function performanceTest(
  canvas: HTMLCanvasElement,
  pixelSize: number = 2,
  spriteCount: number = 100,
): void {
  const renderer = new PixelArtRenderer(canvas, pixelSize);
  const spriteRenderer = new SpriteRenderer(renderer);

  const character = createExampleCharacter();
  const sprites: Array<{ x: number; y: number; hueShift: number }> = [];

  // Generate random sprite positions and hue shifts
  for (let i = 0; i < spriteCount; i++) {
    sprites.push({
      x: Math.random() * (canvas.width / pixelSize - 8),
      y: Math.random() * (canvas.height / pixelSize - 8),
      hueShift: Math.random() * 360,
    });
  }

  const animate = () => {
    renderer.clear();

    // Draw all sprites
    sprites.forEach((sprite) => {
      spriteRenderer.drawSpriteWithHueShift(
        character,
        sprite.x,
        sprite.y,
        sprite.hueShift,
      );
    });

    requestAnimationFrame(animate);
  };

  animate();
}
