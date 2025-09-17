/**
 * Polygon Editor Composable
 *
 * Composable for managing polygon editing operations including vertex
 * manipulation, edge editing, and geometric transformations.
 * Leverages reynard-algorithms for robust geometric operations.
 */
import { type Point, type Polygon } from "reynard-algorithms";
import { SegmentationEditorConfig } from "../types/index.js";
export interface UsePolygonEditorOptions {
    config: SegmentationEditorConfig;
    onPolygonChange?: (polygon: Polygon, segmentationId?: string) => void;
}
export interface UsePolygonEditorReturn {
    addVertex: (polygon: Polygon, point: Point, index?: number) => Polygon;
    removeVertex: (polygon: Polygon, index: number) => Polygon;
    moveVertex: (polygon: Polygon, index: number, point: Point) => Polygon;
    insertVertex: (polygon: Polygon, edgeIndex: number, point: Point) => Polygon;
    simplifyPolygon: (polygon: Polygon, tolerance?: number) => Polygon;
    smoothPolygon: (polygon: Polygon, iterations?: number) => Polygon;
    scalePolygon: (polygon: Polygon, scale: number, center?: Point) => Polygon;
    rotatePolygon: (polygon: Polygon, angle: number, center?: Point) => Polygon;
    translatePolygon: (polygon: Polygon, offset: Point) => Polygon;
    validatePolygon: (polygon: Polygon) => boolean;
    getPolygonCenter: (polygon: Polygon) => Point;
    getPolygonBounds: (polygon: Polygon) => {
        min: Point;
        max: Point;
    };
    isPointInPolygon: (polygon: Polygon, point: Point) => boolean;
    getClosestVertex: (polygon: Polygon, point: Point) => {
        index: number;
        distance: number;
    };
    getClosestEdge: (polygon: Polygon, point: Point) => {
        index: number;
        distance: number;
        point: Point;
    };
    cleanup: () => void;
}
/**
 * Polygon editor composable leveraging reynard-algorithms
 */
export declare function usePolygonEditor(options: UsePolygonEditorOptions): UsePolygonEditorReturn;
