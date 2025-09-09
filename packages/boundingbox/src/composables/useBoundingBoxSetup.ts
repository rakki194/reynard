/**
 * Bounding Box Setup Composable
 *
 * Handles bounding box management setup and configuration
 */

import { useBoundingBoxes } from "./useBoundingBoxes";
import { useBoxResize } from "./useBoxResize";
import { useBoxMove } from "./useBoxMove";
import type { BoundingBox, ImageInfo } from "../types";

export interface BoundingBoxSetup {
  boundingBoxes: ReturnType<typeof useBoundingBoxes>;
  boxResize: ReturnType<typeof useBoxResize>;
  boxMove: ReturnType<typeof useBoxMove>;
}

export const useBoundingBoxSetup = (
  initialBoxes: BoundingBox[],
  imageInfo: ImageInfo,
): BoundingBoxSetup => {
  const boundingBoxes = useBoundingBoxes({ initialBoxes, imageInfo });

  const boxResize = useBoxResize({
    minWidth: 10,
    minHeight: 10,
    maxWidth: imageInfo.width,
    maxHeight: imageInfo.height,
    enableProportionalResizing: true,
    enableCornerHandles: true,
    enableEdgeHandles: true,
  });

  const boxMove = useBoxMove(boundingBoxes, { imageInfo });

  return {
    boundingBoxes,
    boxResize,
    boxMove,
  };
};
