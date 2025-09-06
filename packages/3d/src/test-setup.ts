import '@testing-library/jest-dom';

// Mock Three.js for testing
(global as any).THREE = {
  Scene: class MockScene {},
  PerspectiveCamera: class MockCamera {},
  WebGLRenderer: class MockRenderer {},
  AmbientLight: class MockAmbientLight {},
  DirectionalLight: class MockDirectionalLight {},
  PointLight: class MockPointLight {},
  Color: class MockColor {},
  Vector3: class MockVector3 {},
  Clock: class MockClock {},
  PCFSoftShadowMap: 1,
  ACESFilmicToneMapping: 1,
  SRGBColorSpace: 1,
  BufferGeometry: class MockBufferGeometry {},
  Float32BufferAttribute: class MockFloat32BufferAttribute {},
  Points: class MockPoints {},
  PointsMaterial: class MockPointsMaterial {},
  InstancedMesh: class MockInstancedMesh {},
  InstancedBufferGeometry: class MockInstancedBufferGeometry {},
  InstancedBufferAttribute: class MockInstancedBufferAttribute {},
  Frustum: class MockFrustum {},
  Matrix4: class MockMatrix4 {},
  Sphere: class MockSphere {},
  SphereGeometry: class MockSphereGeometry {},
  Box3: class MockBox3 {},
  Raycaster: class MockRaycaster {},
  Vector2: class MockVector2 {},
  Object3D: class MockObject3D {},
  Group: class MockGroup {},
  TextureLoader: class MockTextureLoader {},
  Sprite: class MockSprite {},
  SpriteMaterial: class MockSpriteMaterial {},
  CanvasTexture: class MockCanvasTexture {},
  MeshBasicMaterial: class MockMeshBasicMaterial {},
  Mesh: class MockMesh {},
  LineBasicMaterial: class MockLineBasicMaterial {},
  Line: class MockLine {},
  BoxGeometry: class MockBoxGeometry {},
  CylinderGeometry: class MockCylinderGeometry {},
  MeshStandardMaterial: class MockMeshStandardMaterial {},
  AxesHelper: class MockAxesHelper {},
  GridHelper: class MockGridHelper {},
};

// Mock OrbitControls
(global as any).OrbitControls = class MockOrbitControls {
  constructor() {}
  addEventListener() {}
  removeEventListener() {}
  dispose() {}
  update() {}
  set enabled(_value: boolean) {}
  get enabled() { return true; }
  set enableDamping(_value: boolean) {}
  set dampingFactor(_value: number) {}
  set enableZoom(_value: boolean) {}
  set enablePan(_value: boolean) {}
  set enableRotate(_value: boolean) {}
  set minDistance(_value: number) {}
  set maxDistance(_value: number) {}
  set maxPolarAngle(_value: number) {}
  set autoRotate(_value: boolean) {}
  set autoRotateSpeed(_value: number) {}
  set zoomSpeed(_value: number) {}
  set rotateSpeed(_value: number) {}
  set panSpeed(_value: number) {}
  set target(_value: any) {}
  get target() { return { x: 0, y: 0, z: 0 }; }
};

// Mock ResizeObserver
global.ResizeObserver = class MockResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock performance.now
global.performance = {
  ...global.performance,
  now: () => Date.now(),
};
