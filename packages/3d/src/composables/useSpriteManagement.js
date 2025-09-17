import { createEffect } from "solid-js";
export function useSpriteManagement(config) {
    const createThumbnailSprites = async () => {
        const renderer = config.pointCloudRenderer();
        const events = config.pointCloudEvents();
        if (!renderer || !events || !config.points)
            return;
        const sprites = await renderer.spriteManager().createThumbnailSprites(config.points, config.config, config.scene, (pointId) => events.handlePointHover(pointId, config.config), () => events.handlePointLeave(config.config));
        config.setThumbnailSprites(sprites);
    };
    const createTextSprites = async () => {
        const renderer = config.pointCloudRenderer();
        if (!renderer || !config.points)
            return;
        const sprites = await renderer
            .spriteManager()
            .createTextSprites(config.points, config.config, config.scene);
        config.setTextSprites(sprites);
    };
    createEffect(() => {
        if (config.pointCloudRenderer() &&
            config.pointCloudEvents() &&
            config.points) {
            createThumbnailSprites();
            createTextSprites();
        }
    });
    return {
        createThumbnailSprites,
        createTextSprites,
    };
}
