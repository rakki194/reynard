# Image Viewer

Iteractive viewer with progressive loading, cursor-relative zoom, panning, and a minimap for navigation.

## Zoom and Pan

- Wheel zoom uses an exponential factor with `deltaY * -0.001` and clamps scale to `[1, 5]`.
- Zoom centers on the cursor by adjusting translation based on container-relative coordinates.
- Panning activates when zoomed: mousedown captures start offset; mousemove updates position; mouseup ends drag.
- Transforms are applied via `transform: scale(...) translate(...)` for smooth, GPU-accelerated updates.

## Minimap

- Shows when zoomed (`scale > 1`) and if enabled in the app context.
- A `ResizeObserver` updates the minimap viewport on container resize and on scale/position changes.
- Clicking the minimap sets the viewport center by mapping click coordinates to image space.

## Progressive Loading

- Thumbnail image renders first; preview fades in when loaded and hides the thumbnail.
- Animated images show a loading indicator until the preview is ready and display an animation badge with frame count and duration.

- Files:
  - `src/components/ImageViewer/*`
