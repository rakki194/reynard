import { createEffect } from "solid-js";
export function usePointCloudCreation(config) {
    const createPointCloud = async () => {
        if (!config.pointCloudRenderer() ||
            !config.points ||
            config.points.length === 0)
            return;
        const handlePointClick = (event) => {
            if (config.pointCloudEvents() && config.pointCloudRenderer()) {
                config
                    .pointCloudEvents()
                    .handlePointClick(event, config.pointCloudRenderer().pointCloud(), config.points, config.camera, config.renderer, config.onPointSelect);
            }
        };
        await config
            .pointCloudRenderer()
            .createPointCloud(config.points, config.config, config.scene, handlePointClick);
    };
    createEffect(() => {
        if (config.pointCloudRenderer() &&
            config.points &&
            config.points.length > 0) {
            createPointCloud();
        }
    });
    return {
        createPointCloud,
    };
}
