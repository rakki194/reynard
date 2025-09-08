/**
 * Point Cloud Generator Module
 * Creates and manages Three.js point cloud geometry
 */

export interface PointCloudConfig {
  pointCount: number;
  colorPalette: number[];
}

export const createPointCloud = async (
  scene: any,
  config: PointCloudConfig
): Promise<any> => {
  const THREE = await import('three');
  
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(config.pointCount * 3);
  const colors = new Float32Array(config.pointCount * 3);

  for (let i = 0; i < config.pointCount; i++) {
    // Generate random positions in a sphere
    const radius = Math.random() * 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Use random colors
    const colorIndex = i % config.colorPalette.length;
    const color = new THREE.Color(config.colorPalette[colorIndex]);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  
  return points;
};
