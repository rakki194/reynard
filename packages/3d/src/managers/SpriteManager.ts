import type {
  ThreeJSInterface,
  SpriteLike,
  ThreeJSSpriteLike,
  EmbeddingRenderingConfig,
  EmbeddingPoint,
} from "../types/rendering";

export class SpriteManager {
  public threeJS: ThreeJSInterface;

  constructor(threeJS: ThreeJSInterface) {
    this.threeJS = threeJS;
  }

  async createThumbnailSprites(
    points: EmbeddingPoint[],
    config: EmbeddingRenderingConfig,
    scene: any,
    onHover: (pointId: string) => void,
    onLeave: () => void,
  ): Promise<SpriteLike[]> {
    const { Sprite, SpriteMaterial, TextureLoader } = this.threeJS;
    const sprites: SpriteLike[] = [];

    for (const point of points) {
      if (!point.imageThumbnail && !point.thumbnailDataUrl) continue;

      // Create texture
      let texture;
      if (point.thumbnailDataUrl) {
        texture = new TextureLoader().load(point.thumbnailDataUrl);
      } else if (point.imageThumbnail) {
        texture = new TextureLoader().load(point.imageThumbnail);
      }

      if (!texture) continue;

      // Create sprite material
      const material = new SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      });

      // Create sprite
      const sprite = new Sprite(material) as ThreeJSSpriteLike;
      sprite.position.set(
        point.position[0],
        point.position[1],
        point.position[2],
      );
      sprite.scale.setScalar(config.thumbnailSize);
      sprite.userData = {
        type: "thumbnail",
        pointId: point.id,
        point: point,
      };

      // Add hover effect
      sprite.onHover = () => onHover(point.id);
      sprite.onLeave = () => onLeave();

      scene.add(sprite);
      sprites.push(sprite as SpriteLike);
    }

    return sprites;
  }

  async createTextSprites(
    points: EmbeddingPoint[],
    config: EmbeddingRenderingConfig,
    scene: any,
  ): Promise<SpriteLike[]> {
    const { Sprite, SpriteMaterial, CanvasTexture } = this.threeJS;
    const sprites: SpriteLike[] = [];

    for (const point of points) {
      if (!point.textContent) continue;

      // Create canvas for text
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) continue;

      canvas.width = 256;
      canvas.height = 64;

      // Draw text
      context.fillStyle = "rgba(0, 0, 0, 0.8)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "white";
      context.font = "16px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(point.textContent, canvas.width / 2, canvas.height / 2);

      // Create texture and sprite
      const texture = new CanvasTexture(canvas);
      const material = new SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
      });

      const sprite = new Sprite(material) as ThreeJSSpriteLike;
      sprite.position.set(
        point.position[0],
        point.position[1],
        point.position[2],
      );
      sprite.position.y += 0.5; // Offset above point
      sprite.scale.setScalar(config.textSpriteSize);
      sprite.userData = {
        type: "text",
        pointId: point.id,
        point: point,
      };

      scene.add(sprite);
      sprites.push(sprite as SpriteLike);
    }

    return sprites;
  }

  disposeSprites(sprites: SpriteLike[], scene: any): void {
    sprites.forEach((sprite) => {
      scene.remove(sprite);
      if (sprite.material?.dispose) sprite.material.dispose();
    });
  }
}
