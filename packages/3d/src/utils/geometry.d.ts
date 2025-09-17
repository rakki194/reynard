import type { Vector3, BoundingBox } from "../types";
/**
 * Create a 3D vector
 */
export declare function createVector3(x?: number, y?: number, z?: number): Vector3;
/**
 * Add two 3D vectors
 */
export declare function addVector3(a: Vector3, b: Vector3): Vector3;
/**
 * Subtract two 3D vectors
 */
export declare function subtractVector3(a: Vector3, b: Vector3): Vector3;
/**
 * Multiply a 3D vector by a scalar
 */
export declare function multiplyVector3(vector: Vector3, scalar: number): Vector3;
/**
 * Calculate the length of a 3D vector
 */
export declare function lengthVector3(vector: Vector3): number;
/**
 * Normalize a 3D vector
 */
export declare function normalizeVector3(vector: Vector3): Vector3;
/**
 * Calculate the distance between two 3D points
 */
export declare function distanceVector3(a: Vector3, b: Vector3): number;
/**
 * Calculate the dot product of two 3D vectors
 */
export declare function dotVector3(a: Vector3, b: Vector3): number;
/**
 * Calculate the cross product of two 3D vectors
 */
export declare function crossVector3(a: Vector3, b: Vector3): Vector3;
/**
 * Linear interpolation between two 3D vectors
 */
export declare function lerpVector3(a: Vector3, b: Vector3, t: number): Vector3;
/**
 * Create a bounding box from an array of 3D points
 */
export declare function createBoundingBox(points: Vector3[]): BoundingBox;
/**
 * Calculate the center of a bounding box
 */
export declare function centerBoundingBox(box: BoundingBox): Vector3;
/**
 * Calculate the size of a bounding box
 */
export declare function sizeBoundingBox(box: BoundingBox): Vector3;
/**
 * Check if a point is inside a bounding box
 */
export declare function isPointInBoundingBox(point: Vector3, box: BoundingBox): boolean;
/**
 * Expand a bounding box to include a point
 */
export declare function expandBoundingBox(box: BoundingBox, point: Vector3): BoundingBox;
/**
 * Convert HSL to RGB
 */
export declare function hslToRgb(h: number, s: number, l: number): [number, number, number];
/**
 * Convert RGB to HSL
 */
export declare function rgbToHsl(r: number, g: number, b: number): [number, number, number];
/**
 * Generate a random color
 */
export declare function randomColor(): [number, number, number];
/**
 * Generate a color from a hash string
 */
export declare function colorFromHash(str: string): [number, number, number];
/**
 * Clamp a value between min and max
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Map a value from one range to another
 */
export declare function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number;
/**
 * Generate points in a sphere
 */
export declare function generateSpherePoints(center: Vector3, radius: number, count: number): Vector3[];
/**
 * Generate points in a cube
 */
export declare function generateCubePoints(center: Vector3, size: number, count: number): Vector3[];
