/**
 * Validation utilities for annotations
 *
 * Provides validation functions for bounding boxes and other annotation types,
 * ensuring data integrity and proper constraints.
 */
import type { BoundingBox, PolygonAnnotation, ImageInfo, TransformConstraints } from "../types";
/**
 * Validate bounding box coordinates and dimensions
 */
export declare function validateBoundingBox(box: BoundingBox, imageInfo: ImageInfo): {
    isValid: boolean;
    errors: string[];
};
/**
 * Validate polygon annotation
 */
export declare function validatePolygonAnnotation(polygon: PolygonAnnotation, imageInfo: ImageInfo): {
    isValid: boolean;
    errors: string[];
};
/**
 * Validate transform constraints
 */
export declare function validateTransformConstraints(constraints: TransformConstraints): {
    isValid: boolean;
    errors: string[];
};
/**
 * Check if a bounding box meets size constraints
 */
export declare function checkBoundingBoxConstraints(box: BoundingBox, constraints: TransformConstraints): {
    meetsConstraints: boolean;
    violations: string[];
};
/**
 * Calculate the area of a bounding box
 */
export declare function calculateBoundingBoxArea(box: BoundingBox): number;
/**
 * Calculate the area of a polygon using the shoelace formula
 */
export declare function calculatePolygonArea(polygon: PolygonAnnotation): number;
/**
 * Check if two bounding boxes overlap
 */
export declare function boundingBoxesOverlap(box1: BoundingBox, box2: BoundingBox): boolean;
/**
 * Calculate intersection over union (IoU) of two bounding boxes
 */
export declare function calculateBoundingBoxIoU(box1: BoundingBox, box2: BoundingBox): number;
