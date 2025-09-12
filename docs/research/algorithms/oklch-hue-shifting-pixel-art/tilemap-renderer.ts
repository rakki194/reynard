/**
 * Tilemap rendering utilities for pixel art
 * Handles tilemap drawing with viewport culling
 */

import { PixelArtRenderer } from "./pixel-art-renderer";
import { SpriteRenderer, type PixelSprite } from "./sprite-renderer";

/**
 * Tilemap data structure
 */
export interface Tilemap {
  width: number;
  height: number;
  tileSize: number;
  tiles: number[][]; // 2D array of tile indices
  tileSprites: PixelSprite[]; // Array of tile sprites
}

/**
 * Tilemap renderer
 */
export class TilemapRenderer {
  private renderer: PixelArtRenderer;
  private spriteRenderer: SpriteRenderer;

  constructor(renderer: PixelArtRenderer) {
    this.renderer = renderer;
    this.spriteRenderer = new SpriteRenderer(renderer);
  }

  /**
   * Draw the entire tilemap
   */
  drawTilemap(
    tilemap: Tilemap,
    offsetX: number = 0,
    offsetY: number = 0,
  ): void {
    for (let row = 0; row < tilemap.height; row++) {
      for (let col = 0; col < tilemap.width; col++) {
        const tileIndex = tilemap.tiles[row][col];

        if (tileIndex === 0) continue; // Skip empty tiles

        const spriteIndex = tileIndex - 1; // Convert to 0-based index
        if (spriteIndex >= 0 && spriteIndex < tilemap.tileSprites.length) {
          const sprite = tilemap.tileSprites[spriteIndex];
          const x = offsetX + col * tilemap.tileSize;
          const y = offsetY + row * tilemap.tileSize;

          this.spriteRenderer.drawSprite(sprite, x, y);
        }
      }
    }
  }

  /**
   * Draw a portion of the tilemap (for viewport culling)
   */
  drawTilemapViewport(
    tilemap: Tilemap,
    viewportX: number,
    viewportY: number,
    viewportWidth: number,
    viewportHeight: number,
  ): void {
    const startCol = Math.max(0, Math.floor(viewportX / tilemap.tileSize));
    const endCol = Math.min(
      tilemap.width,
      Math.ceil((viewportX + viewportWidth) / tilemap.tileSize),
    );
    const startRow = Math.max(0, Math.floor(viewportY / tilemap.tileSize));
    const endRow = Math.min(
      tilemap.height,
      Math.ceil((viewportY + viewportHeight) / tilemap.tileSize),
    );

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tileIndex = tilemap.tiles[row][col];

        if (tileIndex === 0) continue; // Skip empty tiles

        const spriteIndex = tileIndex - 1; // Convert to 0-based index
        if (spriteIndex >= 0 && spriteIndex < tilemap.tileSprites.length) {
          const sprite = tilemap.tileSprites[spriteIndex];
          const x = col * tilemap.tileSize - viewportX;
          const y = row * tilemap.tileSize - viewportY;

          this.spriteRenderer.drawSprite(sprite, x, y);
        }
      }
    }
  }

  /**
   * Get the underlying pixel art renderer
   */
  getRenderer(): PixelArtRenderer {
    return this.renderer;
  }

  /**
   * Get the sprite renderer
   */
  getSpriteRenderer(): SpriteRenderer {
    return this.spriteRenderer;
  }
}
