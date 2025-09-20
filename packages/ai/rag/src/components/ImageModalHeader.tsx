/**
 * Image Modal Header Component
 *
 * Header with image info and control buttons
 */
import { Button } from "reynard-components-core";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
import { formatDimensions, formatFileSize } from "../utils/image-modal-utils";
// Helper function to get icon as JSX element
const getIcon = name => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    // eslint-disable-next-line solid/no-innerhtml
    return <div class="icon-wrapper" innerHTML={icon.outerHTML} />;
  }
  return null;
};
export const ImageModalHeader = props => {
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
        <Button variant="secondary" size="small" onClick={props.onToggleMetadata} icon={getIcon("info")}>
          {props.showMetadata ? "Hide" : "Show"} Metadata
        </Button>

        <Button variant="secondary" size="small" onClick={props.onToggleEmbeddingInfo} icon={getIcon("brain")}>
          {props.showEmbeddingInfo ? "Hide" : "Show"} Embedding
        </Button>

        <Button variant="secondary" size="small" onClick={props.onCopyPath} icon={getIcon("copy")}>
          Copy Path
        </Button>

        <Button variant="secondary" size="small" onClick={props.onDownload} icon={getIcon("download")}>
          Download
        </Button>
      </div>
    </div>
  );
};
