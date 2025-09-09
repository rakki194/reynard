/**
 * useFileUpload Composable
 * Main file upload orchestrator that coordinates smaller modules
 */

import type { FileUploadProps } from "../types";
import { useUploadState } from "./useUploadState";
import { useFileOperations } from "./useFileOperations";
import { useUploadOperations } from "./useUploadOperations";
import {
  createUpdateItemFunction,
  createFileUploadActions,
} from "./useFileUploadHelpers";

export function useFileUpload(props: FileUploadProps) {
  const state = useUploadState();
  const fileOps = useFileOperations(props);
  const uploadOps = useUploadOperations(props);

  const updateItem = createUpdateItemFunction(state.setUploadItems);
  const actions = createFileUploadActions(
    fileOps,
    uploadOps,
    state,
    updateItem,
    props,
  );

  return {
    uploadItems: state.uploadItems,
    isUploading: state.isUploading,
    ...actions,
  };
}
