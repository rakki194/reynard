/**
 * 3D Test Setup - For packages that need Three.js and 3D graphics APIs
 */
import { vi } from "vitest";
import { setupBrowserTest } from "./browser-setup.js";
/**
 * Setup for 3D packages (reynard-3d, etc.)
 * Includes Three.js, OrbitControls, and 3D graphics mocks
 */
export function setup3DTest() {
    setupBrowserTest();
    // Mock Three.js
    global.THREE = {
        // Core classes
        Scene: class MockScene {
            constructor() {
                Object.defineProperty(this, "add", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "remove", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clear", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "traverse", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getObjectByName", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getObjectById", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getObjectByProperty", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        PerspectiveCamera: class MockCamera {
            constructor() {
                Object.defineProperty(this, "updateProjectionMatrix", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "lookAt", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        WebGLRenderer: class MockRenderer {
            constructor() {
                Object.defineProperty(this, "setSize", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "render", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setClearColor", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setClearAlpha", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setPixelRatio", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setAnimationLoop", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getSize", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => ({ width: 800, height: 600 }))
                });
                Object.defineProperty(this, "getPixelRatio", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => 1)
                });
                Object.defineProperty(this, "getContext", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getInfo", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => ({ memory: { geometries: 0, textures: 0 } }))
                });
            }
        },
        // Lights
        AmbientLight: class MockAmbientLight {
            constructor() {
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        DirectionalLight: class MockDirectionalLight {
            constructor() {
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        PointLight: class MockPointLight {
            constructor() {
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Colors and vectors
        Color: class MockColor {
            constructor() {
                Object.defineProperty(this, "set", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setHex", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setRGB", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setHSL", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        Vector3: class MockVector3 {
            constructor() {
                Object.defineProperty(this, "set", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "add", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "sub", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "multiply", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "divide", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "length", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => 1)
                });
                Object.defineProperty(this, "normalize", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        Vector2: class MockVector2 {
            constructor() {
                Object.defineProperty(this, "set", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "add", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "sub", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "multiply", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "divide", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "length", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => 1)
                });
                Object.defineProperty(this, "normalize", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Math utilities
        Clock: class MockClock {
            constructor() {
                Object.defineProperty(this, "getElapsedTime", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => 0)
                });
                Object.defineProperty(this, "getDelta", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => 0.016)
                });
            }
        },
        Matrix4: class MockMatrix4 {
            constructor() {
                Object.defineProperty(this, "set", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "multiply", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "multiplyMatrices", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "makeRotationX", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "makeRotationY", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "makeRotationZ", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "makeTranslation", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "makeScale", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Geometries
        BufferGeometry: class MockBufferGeometry {
            constructor() {
                Object.defineProperty(this, "setAttribute", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getAttribute", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "deleteAttribute", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "addGroup", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clearGroups", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "computeBoundingBox", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "computeBoundingSphere", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        Float32BufferAttribute: class MockFloat32BufferAttribute {
            constructor() {
                Object.defineProperty(this, "set", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getX", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getY", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getZ", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setX", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setY", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setZ", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        InstancedBufferGeometry: class MockInstancedBufferGeometry {
            constructor() {
                Object.defineProperty(this, "setAttribute", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getAttribute", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "deleteAttribute", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        InstancedBufferAttribute: class MockInstancedBufferAttribute {
            constructor() {
                Object.defineProperty(this, "set", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getX", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getY", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getZ", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setX", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setY", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setZ", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Objects
        Object3D: class MockObject3D {
            constructor() {
                Object.defineProperty(this, "add", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "remove", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clear", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "traverse", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getObjectByName", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getObjectById", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "getObjectByProperty", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrix", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrixWorld", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        Group: class MockGroup {
            constructor() {
                Object.defineProperty(this, "add", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "remove", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clear", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "traverse", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        Mesh: class MockMesh {
            constructor() {
                Object.defineProperty(this, "add", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "remove", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clear", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "traverse", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrix", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrixWorld", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        Points: class MockPoints {
            constructor() {
                Object.defineProperty(this, "add", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "remove", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clear", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "traverse", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrix", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrixWorld", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        Line: class MockLine {
            constructor() {
                Object.defineProperty(this, "add", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "remove", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clear", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "traverse", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrix", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrixWorld", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Materials
        PointsMaterial: class MockPointsMaterial {
            constructor() {
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        MeshBasicMaterial: class MockMeshBasicMaterial {
            constructor() {
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        MeshStandardMaterial: class MockMeshStandardMaterial {
            constructor() {
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        LineBasicMaterial: class MockLineBasicMaterial {
            constructor() {
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Geometries
        SphereGeometry: class MockSphereGeometry {
            constructor() {
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        BoxGeometry: class MockBoxGeometry {
            constructor() {
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        CylinderGeometry: class MockCylinderGeometry {
            constructor() {
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Textures
        TextureLoader: class MockTextureLoader {
            constructor() {
                Object.defineProperty(this, "load", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => Promise.resolve({}))
                });
            }
        },
        CanvasTexture: class MockCanvasTexture {
            constructor() {
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Sprites
        Sprite: class MockSprite {
            constructor() {
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrix", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "updateMatrixWorld", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        SpriteMaterial: class MockSpriteMaterial {
            constructor() {
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispose", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Helpers
        AxesHelper: class MockAxesHelper {
            constructor() {
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        GridHelper: class MockGridHelper {
            constructor() {
                Object.defineProperty(this, "addEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "removeEventListener", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "dispatchEvent", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        // Math utilities
        Frustum: class MockFrustum {
            constructor() {
                Object.defineProperty(this, "setFromProjectionMatrix", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "intersectsObject", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => true)
                });
                Object.defineProperty(this, "intersectsSphere", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => true)
                });
                Object.defineProperty(this, "intersectsBox", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => true)
                });
            }
        },
        Sphere: class MockSphere {
            constructor() {
                Object.defineProperty(this, "set", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setFromPoints", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        Box3: class MockBox3 {
            constructor() {
                Object.defineProperty(this, "set", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setFromObject", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setFromPoints", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "clone", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "copy", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
            }
        },
        Raycaster: class MockRaycaster {
            constructor() {
                Object.defineProperty(this, "set", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "setFromCamera", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn()
                });
                Object.defineProperty(this, "intersectObject", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => [])
                });
                Object.defineProperty(this, "intersectObjects", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: vi.fn(() => [])
                });
            }
        },
        // Constants
        PCFSoftShadowMap: 1,
        ACESFilmicToneMapping: 1,
        SRGBColorSpace: 1,
    };
    // Mock OrbitControls
    global.OrbitControls = class MockOrbitControls {
        constructor() {
            Object.defineProperty(this, "addEventListener", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: vi.fn()
            });
            Object.defineProperty(this, "removeEventListener", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: vi.fn()
            });
            Object.defineProperty(this, "dispose", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: vi.fn()
            });
            Object.defineProperty(this, "update", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: vi.fn()
            });
        }
        set enabled(_value) { }
        get enabled() {
            return true;
        }
        set enableDamping(_value) { }
        set dampingFactor(_value) { }
        set enableZoom(_value) { }
        set enablePan(_value) { }
        set enableRotate(_value) { }
        set minDistance(_value) { }
        set maxDistance(_value) { }
        set maxPolarAngle(_value) { }
        set autoRotate(_value) { }
        set autoRotateSpeed(_value) { }
        set zoomSpeed(_value) { }
        set rotateSpeed(_value) { }
        set panSpeed(_value) { }
        set target(_value) { }
        get target() {
            return { x: 0, y: 0, z: 0 };
        }
    };
}
