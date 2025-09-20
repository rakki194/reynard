# reynard-floating-panel

> Advanced floating panel system with staggered animations and state management for Reynard

A floating panel system based on Yipyap's BoundingBoxEditor implementation,
featuring staggered animations, state management, draggable panels, and overlay effects.

## ✨ Features

- **🎭 Staggered Animations**: Sophisticated entrance/exit animations with configurable delays
- **🎯 State Management**: Advanced overlay state coordination with transition phases
- **🖱️ Draggable Panels**: Full drag support with constraints and snap points
- **📏 Resizable Panels**: Resize handles with min/max constraints
- **🎨 Theme Support**: Multiple built-in themes (accent, warning, error, success, info)
- **♿ Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **📱 Responsive**: Mobile-first design that works across all device sizes
- **🎪 Backdrop Effects**: Blur effects and color-mixed backgrounds
- **⚡ Performance**: Optimized animations with reduced motion support

## 🚀 Quick Start

### Installation

```bash
npm install reynard-floating-panel solid-js
```

### Basic Usage

```tsx
import { FloatingPanelOverlay, FloatingPanel, useOverlayManager } from "reynard-floating-panel";
import type { FloatingPanel as FloatingPanelType } from "reynard-floating-panel";

function MyApp() {
  const overlayManager = useOverlayManager({
    config: {
      backdropBlur: 4,
      backdropColor: "rgb(0 0 0 / 0.2)",
      outlineColor: "#3b82f6",
    },
  });

  const panels: FloatingPanelType[] = [
    {
      id: "panel-1",
      position: { top: 20, left: 20 },
      size: { width: 300, height: 200 },
      content: <div>Panel 1 Content</div>,
      config: {
        draggable: true,
        closable: true,
        theme: "accent",
      },
    },
    {
      id: "panel-2",
      position: { top: 20, right: 20 },
      size: { width: 250, height: 150 },
      content: <div>Panel 2 Content</div>,
      config: {
        draggable: true,
        resizable: true,
        theme: "warning",
      },
    },
  ];

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <button onClick={() => overlayManager.toggleOverlay()}>Toggle Overlay</button>

      <FloatingPanelOverlay
        isActive={overlayManager.isActive()}
        transitionPhase={overlayManager.overlayState().transitionPhase}
      >
        {panels.map(panel => (
          <FloatingPanel key={panel.id} id={panel.id} position={panel.position} size={panel.size} config={panel.config}>
            {panel.content}
          </FloatingPanel>
        ))}
      </FloatingPanelOverlay>
    </div>
  );
}
```

## 🏗️ Architecture

### Core Components

- **FloatingPanelOverlay**: Main overlay container with backdrop and state management
- **FloatingPanel**: Individual draggable/resizable panels with animations

### Composables

- **useOverlayManager**: Manages overlay state and panel coordination
- **useStaggeredAnimation**: Handles animation timing
- **useDraggablePanel**: Provides drag functionality with constraints

### Animation System

The system uses an animation approach based on Yipyap's patterns:

```css
/* Staggered entrance animations */
.floating-panel-overlay.active .floating-panel:nth-child(1) {
  transition-delay: 0.1s;
}

.floating-panel-overlay.active .floating-panel:nth-child(2) {
  transition-delay: 0.2s;
}

.floating-panel-overlay.active .floating-panel:nth-child(3) {
  transition-delay: 0.3s;
}
```

### State Management

The overlay system uses transition phases for smooth state coordination:

- `idle`: No overlay active
- `entering`: Overlay starting to show
- `entering-active`: Panels starting to appear
- `active`: Full overlay with all panels visible
- `exiting`: Overlay starting to hide
- `exiting-active`: Panels starting to disappear

## 🎨 Theming

The system supports multiple built-in themes:

```tsx
<FloatingPanel
  config={{ theme: "accent" }} // Blue accent
  config={{ theme: "warning" }} // Orange warning
  config={{ theme: "error" }} // Red error
  config={{ theme: "success" }} // Green success
  config={{ theme: "info" }} // Cyan info
>
  Content
</FloatingPanel>
```

## 🖱️ Drag & Drop

Panels support drag functionality:

```tsx
const draggablePanel = useDraggablePanel(panelRef, {
  constraints: {
    minWidth: 200,
    minHeight: 100,
    maxWidth: 800,
    maxHeight: 600,
  },
  snapPoints: {
    x: [0, 100, 200, 300],
    y: [0, 50, 100, 150],
    tolerance: 10,
  },
});
```

## 🎭 Advanced Animations

Configure animation timing:

```tsx
const animation = useStaggeredAnimation({
  baseDelay: 0.1,
  staggerStep: 0.1,
  direction: "center-out", // or "forward", "reverse"
  duration: 300,
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
});
```

## 📱 Responsive Design

The system automatically adapts to different screen sizes:

```css
@media (max-width: 768px) {
  .floating-panel {
    --floating-panel-padding: calc(var(--spacing, 1rem) * 0.75);
    --floating-panel-radius: calc(var(--border-radius, 0.5rem) * 0.75);
  }
}
```

## ♿ Accessibility

- Full keyboard navigation support
- Screen reader compatible
- Reduced motion support
- High contrast mode support
- Focus management

## 🎯 Use Cases

Perfect for:

- **Annotation Tools**: Bounding box editors, image annotation
- **Dashboard Panels**: Configurable widget layouts
- **Modal Systems**: Advanced modal overlays
- **Tool Palettes**: Floating tool panels
- **Data Visualization**: Interactive overlay panels
- **Form Wizards**: Multi-step form interfaces

## 🔧 Configuration

### Overlay Configuration

```tsx
const overlayConfig = {
  backdropBlur: 4,
  backdropColor: "rgb(0 0 0 / 0.2)",
  backdropOpacity: 0.8,
  outlineColor: "#3b82f6",
  outlineStyle: "dashed",
  outlineWidth: 2,
  transitionDuration: 300,
  transitionEasing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  zIndex: 1000,
};
```

### Panel Configuration

```tsx
const panelConfig = {
  draggable: true,
  resizable: true,
  closable: true,
  backdrop: false,
  backdropBlur: false,
  animationDelay: 0,
  animationDuration: 300,
  showOnHover: false,
  hoverDelay: 500,
  persistent: true,
  theme: "default",
};
```

## 🧪 Testing

```bash
npm test
npm run test:coverage
npm run test:ui
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## 📚 Related Packages

- `reynard-boundingbox` - Uses this floating panel system
- `reynard-components` - Core Reynard components
- `reynard-themes` - Theme system integration
