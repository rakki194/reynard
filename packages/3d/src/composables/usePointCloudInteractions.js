// Point cloud interaction handlers
// Extracted from usePointCloud for modularity
import { createSignal } from "solid-js";
export function usePointCloudInteractions() {
    // Interaction state
    const [hoveredPoint, setHoveredPoint] = createSignal(null);
    const [selectedPoints, setSelectedPoints] = createSignal([]);
    const [isDragging, setIsDragging] = createSignal(false);
    const [dragStart, setDragStart] = createSignal(null);
    const [tooltipPosition, setTooltipPosition] = createSignal(null);
    const [selectionGroups, setSelectionGroups] = createSignal(new Map());
    /**
     * Handle point selection via raycasting
     */
    const handlePointSelection = (event, camera, scene, raycaster, mouse) => {
        if (!raycaster || !mouse)
            return;
        const target = event.currentTarget;
        if (!target)
            return;
        const rect = target.getBoundingClientRect();
        // Handle both MouseEvent and TouchEvent
        const clientX = "clientX" in event ? event.clientX : event.touches[0]?.clientX || 0;
        const clientY = "clientY" in event ? event.clientY : event.touches[0]?.clientY || 0;
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        // Find intersected points
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            const intersectedPoint = intersects[0];
            const pointCloud = intersectedPoint.object;
            if (pointCloud.userData?.isPointCloud) {
                const pointIndex = intersectedPoint.index;
                const points = pointCloud.userData.points;
                const point = points[pointIndex];
                if (point) {
                    if (event.ctrlKey || event.metaKey) {
                        // Multi-select
                        setSelectedPoints((prev) => {
                            const isSelected = prev.some((p) => p.id === point.id);
                            if (isSelected) {
                                return prev.filter((p) => p.id !== point.id);
                            }
                            else {
                                return [...prev, point];
                            }
                        });
                    }
                    else {
                        // Single select
                        setSelectedPoints([point]);
                    }
                }
            }
        }
        else {
            // Clicked on empty space
            if (!event.ctrlKey && !event.metaKey) {
                setSelectedPoints([]);
            }
        }
    };
    /**
     * Handle point hovering
     */
    const handlePointHover = (event, camera, scene, raycaster, mouse) => {
        if (!raycaster || !mouse)
            return;
        const target = event.currentTarget;
        if (!target)
            return;
        const rect = target.getBoundingClientRect();
        // Handle both MouseEvent and TouchEvent
        const clientX = "clientX" in event ? event.clientX : event.touches[0]?.clientX || 0;
        const clientY = "clientY" in event ? event.clientY : event.touches[0]?.clientY || 0;
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        // Update tooltip position
        setTooltipPosition({ x: clientX, y: clientY });
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            const intersectedPoint = intersects[0];
            const pointCloud = intersectedPoint.object;
            if (pointCloud.userData?.isPointCloud) {
                const pointIndex = intersectedPoint.index;
                const points = pointCloud.userData.points;
                const point = points[pointIndex];
                if (point && point.id !== hoveredPoint()?.id) {
                    setHoveredPoint(point);
                }
            }
        }
        else {
            if (hoveredPoint()) {
                setHoveredPoint(null);
                setTooltipPosition(null);
            }
        }
    };
    return {
        // State
        hoveredPoint,
        selectedPoints,
        isDragging,
        dragStart,
        tooltipPosition,
        selectionGroups,
        // Methods
        setHoveredPoint,
        setSelectedPoints,
        setIsDragging,
        setDragStart,
        setTooltipPosition,
        setSelectionGroups,
        handlePointSelection,
        handlePointHover,
    };
}
