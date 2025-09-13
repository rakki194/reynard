/**
 * AI Batch Processing Dialog Component
 *
 * Handles batch processing dialog functionality.
 */

import { Component } from "solid-js";
import {
  BatchProcessingDialog,
  type FileItem,
  type GalleryCaptionResult,
} from "reynard-gallery-ai";
import { useNotifications } from "reynard-core";

interface AIBatchDialogProps {
  visible: boolean;
  items: FileItem[];
  onClose: () => void;
  onComplete: (results: GalleryCaptionResult[]) => void;
  onError: (error: Error) => void;
}

export const AIBatchDialog: Component<AIBatchDialogProps> = (props) => {
  const { notify } = useNotifications();

  return (
    <BatchProcessingDialog
      visible={props.visible}
      items={props.items}
      availableGenerators={["jtp2", "wdv3", "joy", "florence2"]}
      onClose={props.onClose}
      onComplete={(results: GalleryCaptionResult[]) => {
        console.log("Batch processing completed:", results);
        props.onComplete(results);
        notify(
          `Batch processing completed: ${results.length} items processed`,
          "success",
        );
      }}
      onError={(error: string) => {
        console.error("Batch processing error:", error);
        props.onError(new Error(error));
        notify(`Batch processing failed: ${error}`, "error");
      }}
    />
  );
};
