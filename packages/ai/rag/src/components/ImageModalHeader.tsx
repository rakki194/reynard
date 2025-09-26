/**
 * Image Modal Header Component
 *
 * Header with image info and control buttons
 */
import { Button } from "reynard-primitives";
import { Icon } from "reynard-primitives";
import { formatDimensions, formatFileSize } from "../utils/image-modal-utils";
export const ImageModalHeader = (props: any) => {
  return (
    <div class="rag-image-header">
      <div class="image-info">
        <div class="image-path">{props.imagePath}</div>
        <div class="image-stats">
          {formatDimensions(props.imageDimensions)} • {formatFileSize(props.imageSize)} •{" "}
          {props.imageFormat?.toUpperCase()}
        </div>
      </div>

      <div class="image-controls">
        <Button variant="secondary" size="sm" onClick={props.onToggleMetadata} leftIcon={<Icon name="info" />}>
          {props.showMetadata ? "Hide" : "Show"} Metadata
        </Button>

        <Button variant="secondary" size="sm" onClick={props.onToggleEmbeddingInfo} leftIcon={<Icon name="brain" />}>
          {props.showEmbeddingInfo ? "Hide" : "Show"} Embedding
        </Button>

        <Button variant="secondary" size="sm" onClick={props.onCopyPath} leftIcon={<Icon name="copy" />}>
          Copy Path
        </Button>

        <Button variant="secondary" size="sm" onClick={props.onDownload} leftIcon={<Icon name="download" />}>
          Download
        </Button>
      </div>
    </div>
  );
};
