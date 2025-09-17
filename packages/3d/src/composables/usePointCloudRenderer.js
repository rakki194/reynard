import { createSignal } from "solid-js";
import { PointCloudMaterialManager } from "../managers/PointCloudMaterialManager";
import { PointCloudGeometryManager } from "../managers/PointCloudGeometryManager";
import { SpriteManager } from "../managers/SpriteManager";
export function usePointCloudRenderer(threeJS) {
    const [materialManager] = createSignal(new PointCloudMaterialManager(threeJS));
    const [geometryManager] = createSignal(new PointCloudGeometryManager(threeJS));
    const [spriteManager] = createSignal(new SpriteManager(threeJS));
    const [pointCloud, setPointCloud] = createSignal(null);
    const createPointCloud = async (points, config, scene, onPointClick) => {
        if (!points || points.length === 0) {
            throw new Error("No points provided for point cloud creation");
        }
        const { Points } = threeJS;
        // Create geometry
        const geometry = geometryManager().createPointGeometry(points, config);
        // Create material
        const material = materialManager().createPointMaterial(config);
        // Create points object
        const pointsObject = new Points(geometry, material);
        pointsObject.userData = {
            type: "pointCloud",
            pointCount: points.length,
            config: config,
        };
        // Add to scene
        scene.add(pointsObject);
        setPointCloud(pointsObject);
        // Add click handler
        pointsObject.onClick = onPointClick;
        return pointsObject;
    };
    const clearPointCloud = (scene) => {
        const currentPointCloud = pointCloud();
        if (currentPointCloud) {
            scene.remove(currentPointCloud);
            if (currentPointCloud.geometry?.dispose)
                currentPointCloud.geometry.dispose();
            if (currentPointCloud.material?.dispose)
                currentPointCloud.material.dispose();
            setPointCloud(null);
        }
    };
    const dispose = () => {
        materialManager().disposeAllMaterials();
        geometryManager().disposeAllGeometries();
    };
    return {
        materialManager,
        geometryManager,
        spriteManager,
        pointCloud,
        createPointCloud,
        clearPointCloud,
        dispose,
    };
}
