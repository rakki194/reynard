import { createSignal, For } from "solid-js";
import "./UnusedVariablesDemo.css";

export function UnusedVariablesDemo() {
  const [activeSection, setActiveSection] = createSignal("component-states");
  const [selectedTheme, setSelectedTheme] = createSignal("light");
  const [showGrid, setShowGrid] = createSignal(true);
  const [elevation, setElevation] = createSignal(2);
  const [opacity, setOpacity] = createSignal(50);
  const [borderRadius, setBorderRadius] = createSignal("md");

  const sections = [
    { id: "component-states", label: "Component States", icon: "🎯" },
    { id: "caption-tags", label: "Caption & Tags", icon: "🏷️" },
    { id: "theme-colors", label: "Theme Colors", icon: "🎨" },
    { id: "layout-grid", label: "Layout & Grid", icon: "📐" },
    { id: "animations", label: "Animations", icon: "🎭" },
    { id: "elevations", label: "Elevations", icon: "📦" },
    { id: "opacity-overlay", label: "Opacity & Overlay", icon: "🔍" },
    { id: "borders-radius", label: "Borders & Radius", icon: "🔧" },
  ];

  const themes = [
    { id: "light", label: "Light", color: "#f8f9fa" },
    { id: "dark", label: "Dark", color: "#1a1a1a" },
    { id: "gray", label: "Gray", color: "#6b7280" },
    { id: "banana", label: "Banana", color: "#fbbf24" },
    { id: "strawberry", label: "Strawberry", color: "#ef4444" },
    { id: "peanut", label: "Peanut", color: "#92400e" },
  ];

  const captionVariants = [
    { name: "primary", color: "var(--caption-primary)" },
    { name: "secondary", color: "var(--caption-secondary)" },
    { name: "success", color: "var(--caption-success)" },
    { name: "warning", color: "var(--caption-warning)" },
    { name: "error", color: "var(--caption-error)" },
  ];

  const gridColumns = ["xs", "sm", "md", "lg", "xl"];
  const elevations = [1, 2, 3, 4];
  const opacities = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const radiusSizes = ["sm", "md", "lg", "xl", "full"];

  return (
    <div class="unused-variables-demo">
      <div class="demo-header">
        <h2>🎨 Unused CSS Variables Showcase</h2>
        <p>
          Interactive demonstrations of unused CSS variables across Reynard
          projects
        </p>
      </div>

      <div class="demo-controls">
        <div class="control-group">
          <label for="active-section-select">Active Section:</label>
          <select
            id="active-section-select"
            value={activeSection()}
            onInput={(e) => setActiveSection(e.target.value)}
          >
            <For each={sections}>
              {(section) => (
                <option value={section.id}>
                  {section.icon} {section.label}
                </option>
              )}
            </For>
          </select>
        </div>

        <div class="control-group">
          <label for="theme-select">Theme:</label>
          <select
            id="theme-select"
            value={selectedTheme()}
            onInput={(e) => setSelectedTheme(e.target.value)}
          >
            <For each={themes}>
              {(theme) => <option value={theme.id}>{theme.label}</option>}
            </For>
          </select>
        </div>
      </div>

      <div class="demo-content" data-theme={selectedTheme()}>
        {/* Component States Section */}
        {activeSection() === "component-states" && (
          <div class="demo-section">
            <h3>🎯 Component States</h3>
            <div class="component-states-grid">
              <div class="state-demo">
                <h4>Button States</h4>
                <div class="button-group">
                  <button class="btn btn-active">Active State</button>
                  <button class="btn btn-disabled" disabled>
                    Disabled State
                  </button>
                  <button class="btn btn-loading">Loading State</button>
                  <button class="btn btn-selected">Selected State</button>
                </div>
              </div>

              <div class="state-demo">
                <h4>Action Buttons</h4>
                <div class="button-group">
                  <button class="btn btn-save">Save Action</button>
                  <button class="btn btn-cancel">Cancel Action</button>
                  <button class="btn btn-destructive">
                    Destructive Action
                  </button>
                </div>
              </div>

              <div class="state-demo">
                <h4>Interactive Elements</h4>
                <div class="interactive-demo">
                  <div class="editable-tag">
                    <span>Editable Tag</span>
                    <button class="remove-btn">×</button>
                  </div>
                  <div class="removable-item">
                    <span>Removable Item</span>
                    <button class="remove-btn">×</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Caption & Tags Section */}
        {activeSection() === "caption-tags" && (
          <div class="demo-section">
            <h3>🏷️ Caption & Tag System</h3>
            <div class="caption-demo">
              <h4>Caption Variants</h4>
              <div class="caption-grid">
                <For each={captionVariants}>
                  {(variant) => (
                    <div class={`caption-item caption-${variant.name}`}>
                      <span class="caption-text">{variant.name}</span>
                      <div class="caption-hover">Hover State</div>
                    </div>
                  )}
                </For>
              </div>

              <h4>Caption Spacing & Sizing</h4>
              <div class="spacing-demo">
                <div class="spacing-xs">XS Spacing</div>
                <div class="spacing-sm">SM Spacing</div>
                <div class="spacing-md">MD Spacing</div>
                <div class="spacing-lg">LG Spacing</div>
                <div class="spacing-xl">XL Spacing</div>
              </div>

              <h4>Caption Typography</h4>
              <div class="typography-demo">
                <div class="font-xs">Extra Small Text</div>
                <div class="font-sm">Small Text</div>
                <div class="font-md">Medium Text</div>
                <div class="font-lg">Large Text</div>
                <div class="font-xl">Extra Large Text</div>
              </div>
            </div>
          </div>
        )}

        {/* Theme Colors Section */}
        {activeSection() === "theme-colors" && (
          <div class="demo-section">
            <h3>🎨 Theme Color Variations</h3>
            <div class="theme-colors-demo">
              <div class="color-group">
                <h4>Primary Colors</h4>
                <div class="color-swatches">
                  <div class="color-swatch primary">Primary</div>
                  <div class="color-swatch primary-hover">Primary Hover</div>
                  <div class="color-swatch primary-active">Primary Active</div>
                  <div class="color-swatch primary-disabled">
                    Primary Disabled
                  </div>
                </div>
              </div>

              <div class="color-group">
                <h4>Secondary Colors</h4>
                <div class="color-swatches">
                  <div class="color-swatch secondary">Secondary</div>
                  <div class="color-swatch secondary-hover">
                    Secondary Hover
                  </div>
                  <div class="color-swatch secondary-active">
                    Secondary Active
                  </div>
                  <div class="color-swatch secondary-disabled">
                    Secondary Disabled
                  </div>
                </div>
              </div>

              <div class="color-group">
                <h4>Surface Colors</h4>
                <div class="color-swatches">
                  <div class="color-swatch surface">Surface</div>
                  <div class="color-swatch surface-hover">Surface Hover</div>
                  <div class="color-swatch surface-active">Surface Active</div>
                  <div class="color-swatch surface-selected">
                    Surface Selected
                  </div>
                </div>
              </div>

              <div class="color-group">
                <h4>Text Colors</h4>
                <div class="color-swatches">
                  <div class="color-swatch text-primary">Text Primary</div>
                  <div class="color-swatch text-secondary">Text Secondary</div>
                  <div class="color-swatch text-tertiary">Text Tertiary</div>
                  <div class="color-swatch text-disabled">Text Disabled</div>
                  <div class="color-swatch text-inverse">Text Inverse</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layout & Grid Section */}
        {activeSection() === "layout-grid" && (
          <div class="demo-section">
            <h3>📐 Layout & Grid System</h3>
            <div class="layout-demo">
              <div class="grid-controls">
                <label>
                  <input
                    type="checkbox"
                    checked={showGrid()}
                    onInput={(e) => setShowGrid(e.target.checked)}
                  />
                  Show Grid
                </label>
              </div>

              <div class="grid-demo" classList={{ "show-grid": showGrid() }}>
                <For each={gridColumns}>
                  {(size) => (
                    <div class={`grid-example grid-${size}`}>
                      <h4>Grid {size.toUpperCase()}</h4>
                      <div class={`grid-container grid-cols-${size}`}>
                        <For
                          each={Array(
                            parseInt(
                              size === "xs"
                                ? "2"
                                : size === "sm"
                                  ? "3"
                                  : size === "md"
                                    ? "4"
                                    : size === "lg"
                                      ? "6"
                                      : "8",
                            ),
                          )}
                        >
                          {(_, i) => (
                            <div class="grid-item">Item {i() + 1}</div>
                          )}
                        </For>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              <div class="sidebar-demo">
                <h4>Sidebar Layout</h4>
                <div class="sidebar-layout">
                  <div class="sidebar">Sidebar</div>
                  <div class="main-content">Main Content</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Animations Section */}
        {activeSection() === "animations" && (
          <div class="demo-section">
            <h3>🎭 Animation & Transitions</h3>
            <div class="animation-demo">
              <div class="timing-demo">
                <h4>Duration Variations</h4>
                <div class="timing-group">
                  <div class="timing-item fast">Fast Transition</div>
                  <div class="timing-item base">Base Transition</div>
                  <div class="timing-item slow">Slow Transition</div>
                </div>
              </div>

              <div class="easing-demo">
                <h4>Easing Functions</h4>
                <div class="easing-group">
                  <div class="easing-item standard">Standard Easing</div>
                  <div class="easing-item decelerate">Decelerate Easing</div>
                  <div class="easing-item accelerate">Accelerate Easing</div>
                </div>
              </div>

              <div class="transform-demo">
                <h4>Hover Transform</h4>
                <div class="transform-item">Hover me for transform</div>
              </div>
            </div>
          </div>
        )}

        {/* Elevations Section */}
        {activeSection() === "elevations" && (
          <div class="demo-section">
            <h3>📦 Elevation & Shadows</h3>
            <div class="elevation-demo">
              <div class="elevation-controls">
                <label>
                  Elevation Level: {elevation()}
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={elevation()}
                    onInput={(e) => setElevation(parseInt(e.target.value))}
                  />
                </label>
              </div>

              <div class="elevation-grid">
                <For each={elevations}>
                  {(level) => (
                    <div class={`elevation-card elevation-${level}`}>
                      <h4>Elevation {level}</h4>
                      <p>Shadow level {level}</p>
                    </div>
                  )}
                </For>
              </div>

              <div class="shadow-demo">
                <h4>Shadow Variations</h4>
                <div class="shadow-group">
                  <div class="shadow-item shadow-sm">Small Shadow</div>
                  <div class="shadow-item shadow-md">Medium Shadow</div>
                  <div class="shadow-item shadow-xl">Extra Large Shadow</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Opacity & Overlay Section */}
        {activeSection() === "opacity-overlay" && (
          <div class="demo-section">
            <h3>🔍 Opacity & Overlay</h3>
            <div class="opacity-demo">
              <div class="opacity-controls">
                <label>
                  Opacity: {opacity()}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity()}
                    onInput={(e) => setOpacity(parseInt(e.target.value))}
                  />
                </label>
              </div>

              <div class="opacity-grid">
                <For each={opacities}>
                  {(opacityLevel) => (
                    <div class={`opacity-item opacity-${opacityLevel}`}>
                      {opacityLevel}% Opacity
                    </div>
                  )}
                </For>
              </div>

              <div class="overlay-demo">
                <h4>Overlay Backgrounds</h4>
                <div class="overlay-group">
                  <div class="overlay-item overlay-dark">Dark Overlay</div>
                  <div class="overlay-item overlay-darker">Darker Overlay</div>
                  <div class="overlay-item overlay-medium">Medium Overlay</div>
                  <div class="overlay-item overlay-light">Light Overlay</div>
                  <div class="overlay-item overlay-lighter">
                    Lighter Overlay
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Borders & Radius Section */}
        {activeSection() === "borders-radius" && (
          <div class="demo-section">
            <h3>🔧 Borders & Radius</h3>
            <div class="border-demo">
              <div class="radius-controls">
                <label>
                  Border Radius: {borderRadius()}
                  <select
                    value={borderRadius()}
                    onInput={(e) => setBorderRadius(e.target.value)}
                  >
                    <For each={radiusSizes}>
                      {(size) => (
                        <option value={size}>{size.toUpperCase()}</option>
                      )}
                    </For>
                  </select>
                </label>
              </div>

              <div class="radius-grid">
                <For each={radiusSizes}>
                  {(size) => (
                    <div class={`radius-item radius-${size}`}>
                      {size.toUpperCase()} Radius
                    </div>
                  )}
                </For>
              </div>

              <div class="border-demo">
                <h4>Border Widths</h4>
                <div class="border-group">
                  <div class="border-item border-thin">Thin Border</div>
                  <div class="border-item border-base">Base Border</div>
                  <div class="border-item border-thick">Thick Border</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
