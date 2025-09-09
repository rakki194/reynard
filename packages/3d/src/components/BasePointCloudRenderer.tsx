import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import type {
  BasePointCloudRendererProps,
  ThreeJSInterface,
  ThreeJSModule,
  PointsLike,
  SpriteLike,
  ThreeJSSpriteLike,
  RaycasterLike,
  Vector2Like,
  EmbeddingRenderingConfig,
} from "../types/rendering";
import { PointCloudMaterialManager } from "../managers/PointCloudMaterialManager";
import { PointCloudGeometryManager } from "../managers/PointCloudGeometryManager";
import { useThreeJSAnimations } from "../composables/useThreeJSAnimations";
import "./BasePointCloudRenderer.css";

export const BasePointCloudRenderer: Component<BasePointCloudRendererProps> = (
  props,
) => {
  const animations = useThreeJSAnimations();

  const [materialManager] = createSignal(
    new PointCloudMaterialManager({} as ThreeJSInterface),
  );
  const [geometryManager] = createSignal(
    new PointCloudGeometryManager({} as ThreeJSInterface),
  );
  const [pointCloud, setPointCloud] = createSignal<PointsLike | null>(null);
  const [thumbnailSprites, setThumbnailSprites] = createSignal<SpriteLike[]>(
    [],
  );
  const [textSprites, setTextSprites] = createSignal<SpriteLike[]>([]);
  const [isInitialized, setIsInitialized] = createSignal(false);

  let threeJS: ThreeJSInterface | null = null;
  let raycaster: RaycasterLike | null = null;
  let mouse: Vector2Like | null = null;

  createEffect(() => {
    if (!props.scene || !props.camera || !props.renderer) return;

    // Handle async initialization in a separate function
    const initializeRenderer = async () => {
      // Initialize Three.js
      if (!threeJS) {
        const THREE = (await import("three"))
          .default as unknown as ThreeJSModule;
        threeJS = THREE as unknown as ThreeJSInterface;
        materialManager().threeJS = threeJS;
        geometryManager().threeJS = threeJS;

        // Initialize raycaster and mouse
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
      }

      // Clear existing objects
      clearScene();

      // Create point cloud
      await createPointCloud();

      // Create thumbnails if enabled
      if (props.config.enableThumbnails) {
        await createThumbnailSprites();
      }

      // Create text sprites if enabled
      if (props.config.enableTextSprites) {
        await createTextSprites();
      }

      setIsInitialized(true);
    };

    // Execute async initialization
    initializeRenderer().catch(console.error);
  });

  const clearScene = () => {
    // Remove existing point cloud
    const currentPointCloud = pointCloud();
    if (currentPointCloud) {
      props.scene.remove(currentPointCloud);
      if (currentPointCloud.geometry?.dispose)
        currentPointCloud.geometry.dispose();
      if (currentPointCloud.material?.dispose)
        currentPointCloud.material.dispose();
    }

    // Remove thumbnail sprites
    thumbnailSprites().forEach((sprite) => {
      props.scene.remove(sprite);
      if (sprite.material?.dispose) sprite.material.dispose();
    });
    setThumbnailSprites([]);

    // Remove text sprites
    textSprites().forEach((sprite) => {
      props.scene.remove(sprite);
      if (sprite.material?.dispose) sprite.material.dispose();
    });
    setTextSprites([]);
  };

  const createPointCloud = async () => {
    if (!threeJS || !props.points || props.points.length === 0) return;

    const { Points } = threeJS;

    // Create geometry
    const geometry = geometryManager().createPointGeometry(
      props.points,
      props.config,
    );

    // Create material
    const material = materialManager().createPointMaterial(props.config);

    // Create points object
    const points = new Points(geometry, material) as PointsLike;
    points.userData = {
      type: "pointCloud",
      pointCount: props.points.length,
      config: props.config,
    };

    // Add to scene
    props.scene.add(points);
    setPointCloud(points);

    // Add click handler
    points.onClick = handlePointClick;
  };

  const createThumbnailSprites = async () => {
    if (!threeJS || !props.points) return;

    const { Sprite, SpriteMaterial, TextureLoader } = threeJS;
    const sprites: SpriteLike[] = [];

    for (const point of props.points) {
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
      sprite.position.set(...point.position);
      sprite.scale.setScalar(props.config.thumbnailSize);
      sprite.userData = {
        type: "thumbnail",
        pointId: point.id,
        point: point,
      };

      // Add hover effect
      sprite.onHover = () => handlePointHover(point.id);
      sprite.onLeave = () => handlePointLeave();

      props.scene.add(sprite);
      sprites.push(sprite as SpriteLike);
    }

    setThumbnailSprites(sprites);
  };

  const createTextSprites = async () => {
    if (!threeJS || !props.points) return;

    const { Sprite, SpriteMaterial, CanvasTexture } = threeJS;
    const sprites: SpriteLike[] = [];

    for (const point of props.points) {
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
      sprite.position.set(...point.position);
      sprite.position.y += 0.5; // Offset above point
      sprite.scale.setScalar(props.config.textSpriteSize);
      sprite.userData = {
        type: "text",
        pointId: point.id,
        point: point,
      };

      props.scene.add(sprite);
      sprites.push(sprite as SpriteLike);
    }

    setTextSprites(sprites);
  };

  const handlePointClick = (event: MouseEvent) => {
    if (!raycaster || !mouse || !props.camera) return;

    // Update mouse position
    const rect = props.renderer.domElement?.getBoundingClientRect();
    if (!rect) return;
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast
    raycaster.setFromCamera(mouse, props.camera);
    const intersects = raycaster.intersectObject(pointCloud()!);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const pointIndex = intersect.index;
      if (pointIndex !== undefined && props.points[pointIndex]) {
        const point = props.points[pointIndex];
        if (props.onPointSelect) {
          props.onPointSelect(point.id);
        }
      }
    }
  };

  const handlePointHover = (_pointId: string) => {
    // Highlight point on hover
    if (props.config.enableHighlighting) {
      // Implementation for highlighting
    }
  };

  const handlePointLeave = () => {
    // Remove highlight
    if (props.config.enableHighlighting) {
      // Implementation for removing highlight
    }
  };

  const updateConfiguration = (newConfig: EmbeddingRenderingConfig) => {
    if (props.onConfigChange) {
      props.onConfigChange(newConfig);
    }
  };

  const animate = () => {
    if (!isInitialized()) return;

    // Update animations
    animations.updateAnimations();

    // Render scene
    props.renderer.render(props.scene, props.camera);
  };

  createEffect(() => {
    if (!isInitialized()) return;

    const interval = setInterval(animate, 16); // ~60fps
    onCleanup(() => clearInterval(interval));
  });

  onCleanup(() => {
    clearScene();
    materialManager().disposeAllMaterials();
    geometryManager().disposeAllGeometries();
  });

  return (
    <div class="base-point-cloud-renderer">
      <div class="renderer-info">
        <div class="info-item">
          <span class="label">Points:</span>
          <span class="value">{props.points.length}</span>
        </div>
        <div class="info-item">
          <span class="label">Instancing:</span>
          <span class="value">
            {props.config.enableInstancing ? "Enabled" : "Disabled"}
          </span>
        </div>
        <div class="info-item">
          <span class="label">LOD:</span>
          <span class="value">
            {props.config.enableLOD ? "Enabled" : "Disabled"}
          </span>
        </div>
        <div class="info-item">
          <span class="label">Culling:</span>
          <span class="value">
            {props.config.enableCulling ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      <div class="renderer-controls">
        <button
          onClick={() =>
            updateConfiguration({
              ...props.config,
              enableInstancing: !props.config.enableInstancing,
            })
          }
          class={`control-button ${props.config.enableInstancing ? "active" : ""}`}
        >
          Toggle Instancing
        </button>

        <button
          onClick={() =>
            updateConfiguration({
              ...props.config,
              enableLOD: !props.config.enableLOD,
            })
          }
          class={`control-button ${props.config.enableLOD ? "active" : ""}`}
        >
          Toggle LOD
        </button>

        <button
          onClick={() =>
            updateConfiguration({
              ...props.config,
              enableCulling: !props.config.enableCulling,
            })
          }
          class={`control-button ${props.config.enableCulling ? "active" : ""}`}
        >
          Toggle Culling
        </button>
      </div>

      <div class="renderer-stats">
        <div class="stats-item">
          <span class="label">Materials:</span>
          <span class="value">{materialManager().getStats().cached}</span>
        </div>
        <div class="stats-item">
          <span class="label">Geometries:</span>
          <span class="value">{geometryManager().getStats().cached}</span>
        </div>
      </div>
    </div>
  );
};
