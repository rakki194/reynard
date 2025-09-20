/**
 * Segmentation Types
 *
 * Core types and interfaces for the Reynard segmentation system.
 * Extends existing annotation types with polygon-specific functionality.
 */
/**
 * Sources of segmentation data
 */
export var SegmentationSource;
(function (SegmentationSource) {
    SegmentationSource["MANUAL"] = "manual";
    SegmentationSource["AI_GENERATED"] = "ai_generated";
    SegmentationSource["IMPORTED"] = "imported";
    SegmentationSource["REFINED"] = "refined";
})(SegmentationSource || (SegmentationSource = {}));
// ========================================================================
// Export Format Types
// ========================================================================
/**
 * Segmentation export formats
 */
export var SegmentationExportFormat;
(function (SegmentationExportFormat) {
    SegmentationExportFormat["COCO"] = "coco";
    SegmentationExportFormat["YOLO"] = "yolo";
    SegmentationExportFormat["PASCAL_VOC"] = "pascal_voc";
    SegmentationExportFormat["LABELME"] = "labelme";
    SegmentationExportFormat["REYNARD"] = "reynard";
})(SegmentationExportFormat || (SegmentationExportFormat = {}));
