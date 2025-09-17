/**
 * Image Display Component
 *
 * Handles image loading, error states, and zoom controls
 */
import { createSignal, Show } from "solid-js";
import { Button } from "reynard-components";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
// Helper function to get icon as JSX element
const getIcon = (name) => {
    const icon = getIconFromRegistry(name);
    if (icon) {
        // eslint-disable-next-line solid/no-innerhtml
        return <div class="icon-wrapper" innerHTML={icon.outerHTML}/>;
    }
    return null;
};
export const ImageDisplay = (props) => {
    const [imageError, setImageError] = createSignal(false);
    const [imageLoading, setImageLoading] = createSignal(true);
    const [imageScale, setImageScale] = createSignal(1);
    const handleImageLoad = () => {
        setImageLoading(false);
    };
    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };
    const handleRetry = () => {
        setImageError(false);
        setImageLoading(true);
        props.onRetry?.();
    };
    return (<div class="rag-image-display">
      <div class="image-container">
        <Show when={imageLoading()}>
          <div class="image-loading">
            <div class="loading-spinner"></div>
            <span>Loading image...</span>
          </div>
        </Show>

        <Show when={imageError()}>
          <div class="image-error">
            <div class="error-icon">{getIcon("image-error")}</div>
            <span>Failed to load image</span>
            <Button onClick={handleRetry}>Retry</Button>
          </div>
        </Show>

        <Show when={!imageLoading() && !imageError()}>
          <img src={props.previewPath || props.imagePath} alt={props.imageId} class="main-image" style={{
            transform: `scale(${imageScale()})`,
        }} onLoad={handleImageLoad} onError={handleImageError}/>
        </Show>
      </div>

      {/* Image controls */}
      <div class="image-zoom-controls">
        <Button variant="secondary" size="small" onClick={() => setImageScale(Math.max(0.25, imageScale() - 0.25))} icon={getIcon("zoom-out")}>
          Zoom Out
        </Button>

        <span class="zoom-level">{Math.round(imageScale() * 100)}%</span>

        <Button variant="secondary" size="small" onClick={() => setImageScale(Math.min(3, imageScale() + 0.25))} icon={getIcon("zoom-in")}>
          Zoom In
        </Button>

        <Button variant="secondary" size="small" onClick={() => setImageScale(1)} icon={getIcon("zoom-reset")}>
          Reset
        </Button>
      </div>
    </div>);
};
