// Point cloud visualization composable for SolidJS
// Adapted from yipyap's EmbeddingPointCloud component

import { createSignal, createMemo } from 'solid-js';
import type { Point3D, PointCloudSettings, SearchIntegrationSettings, TouchEvent, MouseEvent } from '../types';
import { useThreeJSAnimations } from './useThreeJSAnimations';

// Lazy load Three.js components for performance
const loadThreeJS = async () => {
  const THREE = await import('three') as any;
  const {
    BufferGeometry,
    Float32BufferAttribute,
    Points,
    PointsMaterial,
    InstancedMesh,
    InstancedBufferGeometry,
    InstancedBufferAttribute,
    Color,
    Vector3,
    Frustum,
    Matrix4,
    Sphere,
    SphereGeometry,
    Box3,
    Raycaster,
    Vector2,
    Object3D,
    Group,
    TextureLoader,
    Sprite,
    SpriteMaterial,
    CanvasTexture,
    MeshBasicMaterial,
    Mesh,
    LineBasicMaterial,
    Line,
  } = THREE;

  return {
    BufferGeometry,
    Float32BufferAttribute,
    Points,
    PointsMaterial,
    InstancedMesh,
    InstancedBufferGeometry,
    InstancedBufferAttribute,
    Color,
    Vector3,
    Frustum,
    Matrix4,
    Sphere,
    SphereGeometry,
    Box3,
    Raycaster,
    Vector2,
    Object3D,
    Group,
    TextureLoader,
    Sprite,
    SpriteMaterial,
    CanvasTexture,
    MeshBasicMaterial,
    Mesh,
    LineBasicMaterial,
    Line,
  };
};

export function usePointCloud(
  points: () => Point3D[],
  settings: () => PointCloudSettings = () => ({}),
  searchIntegration: () => SearchIntegrationSettings = () => ({})
) {
  const animations = useThreeJSAnimations();

  // State for 3D visualization
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [threeJS, setThreeJS] = createSignal<unknown>(null);
  const [textureLoader, setTextureLoader] = createSignal<unknown>(null);
  const [raycaster, setRaycaster] = createSignal<unknown>(null);
  const [mouse, setMouse] = createSignal<unknown>(null);

  // Point cloud state
  const [pointCloud, setPointCloud] = createSignal<unknown>(null);
  const [_thumbnailTextures, _setThumbnailTextures] = createSignal<Map<string, unknown>>(new Map());
  const [_textSprites, _setTextSprites] = createSignal<Map<string, unknown>>(new Map());

  // Interaction state
  const [hoveredPoint, setHoveredPoint] = createSignal<Point3D | null>(null);
  const [selectedPoints, setSelectedPoints] = createSignal<Point3D[]>([]);
  const [_isDragging, _setIsDragging] = createSignal(false);
  const [_dragStart, _setDragStart] = createSignal<{ x: number; y: number } | null>(null);

  // Visualization settings
  const [_enableThumbnails, _setEnableThumbnails] = createSignal(true);
  const [_enableTextSprites, _setEnableTextSprites] = createSignal(true);
  const [_thumbnailSize, _setThumbnailSize] = createSignal(32);
  const [_textSpriteSize, _setTextSpriteSize] = createSignal(64);

  // Performance settings
  const maxPoints = createMemo(() => settings().maxPoints || 100000);
  const pointSize = createMemo(() => settings().pointSize || 2);
  const enableInstancing = createMemo(() => settings().enableInstancing ?? true);
  const enableLOD = createMemo(() => settings().enableLOD ?? true);
  const enableCulling = createMemo(() => settings().enableCulling ?? true);
  const lodDistance = createMemo(() => settings().lodDistance || 50);
  const lodLevels = createMemo(() => settings().lodLevels || 3);
  const enableHighlighting = createMemo(() => settings().enableHighlighting ?? true);
  const highlightColor = createMemo(() => settings().highlightColor || [1, 1, 0]);
  const highlightSize = createMemo(() => settings().highlightSize || 1.5);

  // Search integration settings
  const enableSearchIntegration = createMemo(() => searchIntegration().enableSearchIntegration ?? false);
  const searchQueryEmbedding = createMemo(() => searchIntegration().searchQueryEmbedding);
  const searchResults = createMemo(() => searchIntegration().searchResults || []);
  const reductionMethod = createMemo(() => searchIntegration().reductionMethod || 'tsne');
  const transformedData = createMemo(() => searchIntegration().transformedData || []);
  const originalIndices = createMemo(() => searchIntegration().originalIndices || []);
  const highlightQueryPoint = createMemo(() => searchIntegration().highlightQueryPoint ?? true);
  const showSimilarityPaths = createMemo(() => searchIntegration().showSimilarityPaths ?? true);
  const showSimilarityRadius = createMemo(() => searchIntegration().showSimilarityRadius ?? true);
  const radiusThreshold = createMemo(() => searchIntegration().radiusThreshold || 0.8);
  const maxPathLength = createMemo(() => searchIntegration().maxPathLength || 5);
  const queryPointColor = createMemo(() => searchIntegration().queryPointColor || [1, 0, 0]);
  const pathColor = createMemo(() => searchIntegration().pathColor || [0, 1, 1]);
  const radiusColor = createMemo(() => searchIntegration().radiusColor || [1, 0, 1]);

  // Search integration state
  const [searchIntegrationData, setSearchIntegrationData] = createSignal<unknown>(null);
  const [queryPointMesh, setQueryPointMesh] = createSignal<unknown>(null);
  const [pathMeshes, setPathMeshes] = createSignal<unknown[]>([]);
  const [radiusMesh, setRadiusMesh] = createSignal<unknown>(null);

  // Performance state
  const [visiblePoints, setVisiblePoints] = createSignal<Point3D[]>([]);
  const [_lodLevel, _setLodLevel] = createSignal(0);
  const [_frustumCulled, _setFrustumCulled] = createSignal(0);
  const [_occlusionCulled, _setOcclusionCulled] = createSignal(0);
  const [renderStats, setRenderStats] = createSignal({
    totalPoints: 0,
    visiblePoints: 0,
    renderedPoints: 0,
    fps: 60,
    memoryUsage: 0,
  });

  // Interaction state
  const [tooltipPosition, setTooltipPosition] = createSignal<{ x: number; y: number } | null>(null);
  const [_selectionGroups, _setSelectionGroups] = createSignal<Map<string, Point3D[]>>(new Map());

  /**
   * Initialize Three.js
   */
  const initializeThreeJS = async () => {
    try {
      setIsLoading(true);
      setError('');

      const threeJSModules = await loadThreeJS();
      setThreeJS(threeJSModules);

      // Initialize raycaster for interaction
      const newRaycaster = new threeJSModules.Raycaster();
      const newMouse = new threeJSModules.Vector2();
      setRaycaster(newRaycaster);
      setMouse(newMouse);

      // Initialize texture loader for thumbnails
      const newTextureLoader = new threeJSModules.TextureLoader();
      setTextureLoader(newTextureLoader);

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize Three.js:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize 3D components');
      setIsLoading(false);
    }
  };

  /**
   * Color mapping based on different strategies
   */
  const calculatePointColors = (points: Point3D[]): Point3D[] => {
    const colorMapping = settings().colorMapping || 'similarity';

    return points.map(point => {
      let color: [number, number, number] = [1, 1, 1];

      switch (colorMapping) {
        case 'similarity':
          // Color based on similarity to center point or query point
          if (point.similarity !== undefined) {
            // Use similarity value directly
            const similarity = Math.max(0, Math.min(1, point.similarity));
            color = [similarity, 1 - similarity, 0.5];
          } else {
            // Fallback to distance-based similarity
            const center = [0, 0, 0];
            const distance = Math.sqrt(
              Math.pow(point.position[0] - center[0], 2) +
              Math.pow(point.position[1] - center[1], 2) +
              Math.pow(point.position[2] - center[2], 2)
            );
            const normalizedDistance = Math.min(distance / 10, 1);
            color = [normalizedDistance, 1 - normalizedDistance, 0.5];
          }
          break;

        case 'cluster':
          // Color based on cluster ID
          if (point.clusterId) {
            const hash = point.clusterId.split('').reduce((a, b) => {
              a = (a << 5) - a + b.charCodeAt(0);
              return a & a;
            }, 0);
            const hue = Math.abs(hash) % 360;
            const rgb = hslToRgb(hue / 360, 0.7, 0.6);
            color = [rgb[0], rgb[1], rgb[2]];
          }
          break;

        case 'importance':
          // Color based on importance
          const importance = point.importance || 0.5;
          color = [importance, 1 - importance, 0.5];
          break;

        case 'confidence':
          // Color based on confidence
          const confidence = point.confidence || 0.5;
          color = [confidence, 1 - confidence, 0.5];
          break;

        case 'custom':
          // Use custom color if provided
          color = point.color || [1, 1, 1];
          break;
      }

      return { ...point, color };
    });
  };

  /**
   * Size mapping based on different strategies
   */
  const calculatePointSizes = (points: Point3D[]): Point3D[] => {
    const sizeMapping = settings().sizeMapping || 'uniform';

    return points.map(point => {
      let size = pointSize();

      switch (sizeMapping) {
        case 'importance':
          size = (point.importance || 0.5) * pointSize() * 2;
          break;

        case 'confidence':
          const confidence = point.confidence || 0.5;
          size = confidence * pointSize() * 2;
          break;

        case 'uniform':
          size = pointSize();
          break;
      }

      return { ...point, size };
    });
  };

  /**
   * Utility function to convert HSL to RGB
   */
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
  };

  /**
   * Process points with search integration highlighting
   */
  const processedPoints = createMemo(() => {
    const pointData = points().slice(0, maxPoints());
    const searchData = searchIntegrationData();

    if (!searchData || !enableSearchIntegration()) {
      return pointData;
    }

    // Apply search integration highlighting
    return pointData.map(point => {
      const highlightedPoint = { ...point };

      // Check if point is in highlighted results
      const isHighlighted = (searchData as any).highlighted_results?.some((result: { original_index: string | number }) => result.original_index === point.id);

      if (isHighlighted) {
        highlightedPoint.color = queryPointColor() as [number, number, number];
        highlightedPoint.size = (point.size || pointSize()) * 2;
      }

      return highlightedPoint;
    });
  });

  /**
   * Handle point selection via raycasting
   */
  const handlePointSelection = (event: MouseEvent | TouchEvent, camera: unknown, scene: unknown) => {
    if (!raycaster() || !mouse()) return;

    const target = (event as any).currentTarget as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    
    // Handle both MouseEvent and TouchEvent
    const clientX = 'clientX' in event ? event.clientX : event.touches[0]?.clientX || 0;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0]?.clientY || 0;
    
    (mouse() as any).x = ((clientX - rect.left) / rect.width) * 2 - 1;
    (mouse() as any).y = -((clientY - rect.top) / rect.height) * 2 + 1;

    (raycaster() as any).setFromCamera(mouse(), camera);

    // Find intersected points
    const intersects = (raycaster() as any).intersectObjects((scene as any).children, true);

    if (intersects.length > 0) {
      const intersectedPoint = intersects[0];
      const pointCloud = intersectedPoint.object;

      if (pointCloud.userData?.isPointCloud) {
        const pointIndex = intersectedPoint.index;
        const points = pointCloud.userData.points;
        const point = points[pointIndex];

        if (point) {
          if (event.ctrlKey || event.metaKey) {
            // Multi-select
            setSelectedPoints(prev => {
              const isSelected = prev.some(p => p.id === point.id);
              if (isSelected) {
                return prev.filter(p => p.id !== point.id);
              } else {
                return [...prev, point];
              }
            });
          } else {
            // Single select
            setSelectedPoints([point]);
          }
        }
      }
    } else {
      // Clicked on empty space
      if (!event.ctrlKey && !event.metaKey) {
        setSelectedPoints([]);
      }
    }
  };

  /**
   * Handle point hovering
   */
  const handlePointHover = (event: MouseEvent | TouchEvent, camera: unknown, scene: unknown) => {
    if (!raycaster() || !mouse()) return;

    const target = (event as any).currentTarget as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    
    // Handle both MouseEvent and TouchEvent
    const clientX = 'clientX' in event ? event.clientX : event.touches[0]?.clientX || 0;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0]?.clientY || 0;
    
    (mouse() as any).x = ((clientX - rect.left) / rect.width) * 2 - 1;
    (mouse() as any).y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Update tooltip position
    setTooltipPosition({ x: clientX, y: clientY });

    (raycaster() as any).setFromCamera(mouse(), camera);

    const intersects = (raycaster() as any).intersectObjects((scene as any).children, true);

    if (intersects.length > 0) {
      const intersectedPoint = intersects[0];
      const pointCloud = intersectedPoint.object;

      if (pointCloud.userData?.isPointCloud) {
        const pointIndex = intersectedPoint.index;
        const points = pointCloud.userData.points;
        const point = points[pointIndex];

        if (point && point.id !== hoveredPoint()?.id) {
          setHoveredPoint(point);
        }
      }
    } else {
      if (hoveredPoint()) {
        setHoveredPoint(null);
        setTooltipPosition(null);
      }
    }
  };

  return {
    // State
    isLoading,
    error,
    threeJS,
    textureLoader,
    raycaster,
    mouse,
    pointCloud,
    thumbnailTextures: _thumbnailTextures,
    textSprites: _textSprites,
    hoveredPoint,
    selectedPoints,
    isDragging: _isDragging,
    dragStart: _dragStart,
    enableThumbnails: _enableThumbnails,
    enableTextSprites: _enableTextSprites,
    thumbnailSize: _thumbnailSize,
    textSpriteSize: _textSpriteSize,
    visiblePoints,
    lodLevel: _lodLevel,
    frustumCulled: _frustumCulled,
    occlusionCulled: _occlusionCulled,
    renderStats,
    tooltipPosition,
    selectionGroups: _selectionGroups,
    searchIntegrationData,
    queryPointMesh,
    pathMeshes,
    radiusMesh,

    // Computed
    maxPoints,
    pointSize,
    enableInstancing,
    enableLOD,
    enableCulling,
    lodDistance,
    lodLevels,
    enableHighlighting,
    highlightColor,
    highlightSize,
    enableSearchIntegration,
    searchQueryEmbedding,
    searchResults,
    reductionMethod,
    transformedData,
    originalIndices,
    highlightQueryPoint,
    showSimilarityPaths,
    showSimilarityRadius,
    radiusThreshold,
    maxPathLength,
    queryPointColor,
    pathColor,
    radiusColor,
    processedPoints,

    // Methods
    initializeThreeJS,
    calculatePointColors,
    calculatePointSizes,
    handlePointSelection,
    handlePointHover,
    setSelectedPoints,
    setHoveredPoint,
    setTooltipPosition,
    setSearchIntegrationData,
    setQueryPointMesh,
    setPathMeshes,
    setRadiusMesh,
    setPointCloud,
    setVisiblePoints,
    setRenderStats,

    // Animation methods
    transitionToNewPoints: animations.createReductionTransition,
    animateClusterExpansion: animations.createClusterAnimation,
    flyToPoint: animations.createCameraFlyTo,
  };
}
