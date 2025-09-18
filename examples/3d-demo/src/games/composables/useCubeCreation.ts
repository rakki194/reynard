import type { CollectibleCube } from "./useCubeCollectorState";
import type { ThreeScene, ThreeJS } from "../types/three";

export const useCubeCreation = () => {
  const createCollectibleCubes = async (scene: ThreeScene, THREE: ThreeJS): Promise<CollectibleCube[]> => {
    const newCubes: CollectibleCube[] = [];

    for (let i = 0; i < 10; i++) {
      const cube = await createSingleCube(THREE, i);
      scene.add(cube.mesh);
      newCubes.push(cube);
    }

    return newCubes;
  };

  const createSingleCube = async (THREE: ThreeJS, id: number): Promise<CollectibleCube> => {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
      metalness: 0.3,
      roughness: 0.7,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((Math.random() - 0.5) * 15, Math.random() * 2 + 0.5, (Math.random() - 0.5) * 15);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return {
      id,
      mesh,
      collected: false,
      points: Math.floor(Math.random() * 50) + 10,
    };
  };

  return {
    createCollectibleCubes,
    createSingleCube,
  };
};
