import type { ThreeJS } from "../types/three";

/**
 * Composable for creating Three.js materials and geometries for maze rendering
 * Handles material creation with proper colors, metalness, and roughness
 */
export function useMazeMaterials() {
  const createMazeMaterials = (THREE: ThreeJS) => {
    const wallGeometry = new THREE.BoxGeometry(1, 2, 0.1);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.3,
      roughness: 0.7,
    });

    const floorGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.1,
      roughness: 0.9,
    });

    const exitGeometry = new THREE.BoxGeometry(1, 0.1, 1);
    const exitMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.1,
      roughness: 0.9,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3,
    });

    return { wallGeometry, wallMaterial, floorGeometry, floorMaterial, exitGeometry, exitMaterial };
  };

  return {
    createMazeMaterials,
  };
}
