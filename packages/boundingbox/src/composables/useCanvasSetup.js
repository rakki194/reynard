/**
 * Canvas Setup Composable
 *
 * Handles canvas initialization and lifecycle management
 */
import { createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { createCanvas, addBoundingBoxesToCanvas, cleanupCanvas, } from "../utils/canvasSetup";
import { setupCanvasEventHandlers } from "../handlers/canvasEventHandlers";
import { displayToImageCoords, clampBoundingBoxToImage, } from "../utils/coordinateTransform";
export const useCanvasSetup = (config) => {
    const [canvasRef, setCanvasRef] = createSignal();
    const [fabricCanvas, setFabricCanvas] = createSignal();
    onMount(() => {
        const canvas = canvasRef();
        if (!canvas)
            return;
        const fabric = createCanvas(canvas, {
            containerWidth: config.containerWidth,
            containerHeight: config.containerHeight,
            imageInfo: config.imageInfo,
            config: config.config,
            boundingBoxes: config.boundingBoxes,
        });
        setFabricCanvas(fabric);
        // Setup event handlers
        setupCanvasEventHandlers(fabric, {
            config: config.config,
            eventHandlers: config.eventHandlers,
            scale: config.config.scale,
            boundingBoxes: config.boundingBoxActions,
            isDrawing: config.isDrawing,
            setIsDrawing: config.setIsDrawing,
            newBox: config.newBox,
            setNewBox: config.setNewBox,
            startPoint: config.startPoint,
            setStartPoint: config.setStartPoint,
            selectedLabelClass: config.selectedLabelClass,
            displayToImageCoords: (x, y) => displayToImageCoords({ x, y }, config.imageInfo, config.containerWidth, config.containerHeight),
            clampBoundingBoxToImage: (box) => clampBoundingBoxToImage(box, config.imageInfo),
        });
        // Add initial bounding boxes
        addBoundingBoxesToCanvas(fabric, config.boundingBoxes, {
            containerWidth: config.containerWidth,
            containerHeight: config.containerHeight,
            imageInfo: config.imageInfo,
            config: config.config,
            boundingBoxes: config.boundingBoxes,
        });
    });
    // Update canvas when bounding boxes change
    createEffect(() => {
        const fabric = fabricCanvas();
        if (!fabric)
            return;
        addBoundingBoxesToCanvas(fabric, config.boundingBoxes, {
            containerWidth: config.containerWidth,
            containerHeight: config.containerHeight,
            imageInfo: config.imageInfo,
            config: config.config,
            boundingBoxes: config.boundingBoxes,
        });
    });
    onCleanup(() => {
        const fabric = fabricCanvas();
        if (fabric) {
            cleanupCanvas(fabric);
        }
    });
    return {
        canvasRef: setCanvasRef,
        fabricCanvas: fabricCanvas(),
    };
};
