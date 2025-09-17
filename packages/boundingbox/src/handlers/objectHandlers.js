/**
 * Object Event Handlers for Canvas
 *
 * Handles object selection, modification, and keyboard events
 */
export function setupObjectHandlers(canvas, config) {
    // Object selection
    canvas.on("selection:created", (event) => {
        const activeObject = event.selected?.[0];
        if (activeObject && activeObject.data?.boxId) {
            const boxId = activeObject.data.boxId;
            config.boundingBoxes.selectBox(boxId);
            config.eventHandlers.onAnnotationSelect?.(boxId);
        }
    });
    // Object modification
    canvas.on("object:modified", (event) => {
        const object = event.target;
        if (object && object.data?.boxId) {
            const boxId = object.data.boxId;
            const box = object;
            const imageCoords = config.displayToImageCoords(box.left, box.top);
            const updates = {
                x: imageCoords.x,
                y: imageCoords.y,
                width: (box.width * box.scaleX) / (config.scale || 1),
                height: (box.height * box.scaleY) / (config.scale || 1),
            };
            config.boundingBoxes.updateBox(boxId, updates);
            const updatedBox = config.boundingBoxes.getBox(boxId);
            if (updatedBox) {
                config.eventHandlers.onAnnotationUpdate?.(boxId, updatedBox);
            }
        }
    });
    // Keyboard shortcuts
    canvas.on("key:down", (event) => {
        if (event.e.key === "Delete" || event.e.key === "Backspace") {
            const activeObjects = canvas.getActiveObjects();
            activeObjects.forEach((obj) => {
                if (obj.data?.boxId) {
                    const boxId = obj.data.boxId;
                    config.boundingBoxes.removeBox(boxId);
                    config.eventHandlers.onAnnotationDelete?.(boxId);
                    canvas.remove(obj);
                }
            });
            canvas.discardActiveObject();
        }
    });
}
