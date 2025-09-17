/**
 * useBoundingBoxes composable
 *
 * Manages a collection of bounding boxes with reactive state and manipulation functions.
 * This is the core state management for bounding box annotations.
 */
import { createSignal, createMemo } from "solid-js";
import { validateBoundingBox } from "../utils/validation";
export function useBoundingBoxes(options = {}) {
    const { initialBoxes = [], imageInfo, enableValidation = true } = options;
    const [boxes, setBoxes] = createSignal(initialBoxes);
    const [selectedBoxId, setSelectedBoxId] = createSignal(initialBoxes.length > 0 ? initialBoxes[0].id : null);
    // Validation errors for each box
    const [validationErrors, setValidationErrors] = createSignal({});
    // Memoized computed values
    const boxCount = createMemo(() => boxes().length);
    const selectedBox = createMemo(() => {
        const id = selectedBoxId();
        return id ? boxes().find((box) => box.id === id) : undefined;
    });
    // Validate all boxes when they change
    const validateAllBoxes = (boxList) => {
        if (!enableValidation || !imageInfo)
            return;
        const errors = {};
        boxList.forEach((box) => {
            const validation = validateBoundingBox(box, imageInfo);
            if (!validation.isValid) {
                errors[box.id] = validation.errors;
            }
        });
        setValidationErrors(errors);
    };
    // Watch for changes in boxes and validate
    createMemo(() => {
        validateAllBoxes(boxes());
    });
    function addBox(box) {
        if (enableValidation && imageInfo) {
            const validation = validateBoundingBox(box, imageInfo);
            if (!validation.isValid) {
                console.warn("[useBoundingBoxes] Invalid box:", validation.errors);
                // Store validation errors even for rejected boxes
                setValidationErrors((prev) => ({
                    ...prev,
                    [box.id]: validation.errors,
                }));
                return false;
            }
        }
        setBoxes((prev) => {
            // Check for duplicate ID
            if (prev.some((b) => b.id === box.id)) {
                console.warn("[useBoundingBoxes] Box with ID already exists:", box.id);
                return prev;
            }
            return [...prev, box];
        });
        setSelectedBoxId(box.id);
        return true;
    }
    function updateBox(id, updates) {
        setBoxes((prev) => {
            const boxIndex = prev.findIndex((box) => box.id === id);
            if (boxIndex === -1) {
                console.warn("[useBoundingBoxes] Box not found:", id);
                return prev;
            }
            const updatedBox = { ...prev[boxIndex], ...updates };
            if (enableValidation && imageInfo) {
                const validation = validateBoundingBox(updatedBox, imageInfo);
                if (!validation.isValid) {
                    console.warn("[useBoundingBoxes] Invalid box update:", validation.errors);
                    return prev;
                }
            }
            const newBoxes = [...prev];
            newBoxes[boxIndex] = updatedBox;
            return newBoxes;
        });
        return true;
    }
    function removeBox(id) {
        setBoxes((prev) => {
            const boxExists = prev.some((box) => box.id === id);
            if (!boxExists) {
                console.warn("[useBoundingBoxes] Box not found:", id);
                return prev;
            }
            return prev.filter((box) => box.id !== id);
        });
        if (selectedBoxId() === id) {
            setSelectedBoxId(null);
        }
        return true;
    }
    function selectBox(id) {
        if (id && !boxes().some((box) => box.id === id)) {
            console.warn("[useBoundingBoxes] Box not found:", id);
            return;
        }
        setSelectedBoxId(id);
    }
    function clearBoxes() {
        setBoxes([]);
        setSelectedBoxId(null);
        setValidationErrors({});
    }
    function getBox(id) {
        return boxes().find((box) => box.id === id);
    }
    function hasBox(id) {
        return boxes().some((box) => box.id === id);
    }
    return {
        boxes,
        setBoxes,
        addBox,
        updateBox,
        removeBox,
        selectBox,
        selectedBoxId,
        clearBoxes,
        getBox,
        hasBox,
        boxCount,
        selectedBox,
        validationErrors,
    };
}
