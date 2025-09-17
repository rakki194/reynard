/**
 * Core types for annotation editing in Reynard
 *
 * This module defines the foundational types that can be shared between
 * bounding box editing and future polygon/segmentation editing.
 */
/**
 * Export formats for annotations
 */
export var AnnotationExportFormat;
(function (AnnotationExportFormat) {
    AnnotationExportFormat["COCO"] = "COCO";
    AnnotationExportFormat["VOC"] = "VOC";
    AnnotationExportFormat["YOLO"] = "YOLO";
    AnnotationExportFormat["LabelMe"] = "LabelMe";
    AnnotationExportFormat["Custom"] = "Custom";
})(AnnotationExportFormat || (AnnotationExportFormat = {}));
