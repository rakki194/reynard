/**
 * 🪟 Floating Panel Demo
 * 
 * Showcase of floating panel animations and transitions
 */

import { Component, createSignal, For, Show } from "solid-js";
// import { FloatingPanel } from "reynard-floating-panel";

// Mock FloatingPanel component for demo
const FloatingPanel: Component<any> = (props) => {
  return (
    <div 
      class="floating-panel-mock"
      style={{
        position: "absolute",
        left: `${props.position.x}px`,
        top: `${props.position.y}px`,
        width: "300px",
        height: "200px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        "border-radius": "var(--radius-lg)",
        padding: "1rem",
        "box-shadow": "var(--shadow-lg)",
        "z-index": 1000
      }}
    >
      <div class="panel-header" style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem" }}>
        <h3 style={{ margin: 0, color: "var(--color-primary)" }}>{props.title}</h3>
        <button onClick={props.onClose} style={{ background: "none", border: "none", "font-size": "1.2rem", cursor: "pointer" }}>×</button>
      </div>
      <div class="panel-body">
        {props.children}
      </div>
    </div>
  );
};

export const FloatingPanelDemo: Component = () => {
  const [panels, setPanels] = createSignal([
    { id: 1, title: "Panel 1", content: "This is the first floating panel", position: { x: 100, y: 100 } },
    { id: 2, title: "Panel 2", content: "This is the second floating panel", position: { x: 300, y: 150 } },
    { id: 3, title: "Panel 3", content: "This is the third floating panel", position: { x: 500, y: 200 } },
  ]);

  const [activePanel, setActivePanel] = createSignal<number | null>(null);
  const [panelConfig, setPanelConfig] = createSignal({
    animationDuration: 300,
    easing: "ease-out",
    backdrop: true,
    draggable: true
  });

  const addPanel = () => {
    const newId = Math.max(...panels().map(p => p.id)) + 1;
    const newPanel = {
      id: newId,
      title: `Panel ${newId}`,
      content: `This is floating panel number ${newId}`,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      }
    };
    setPanels(prev => [...prev, newPanel]);
  };

  const removePanel = (id: number) => {
    setPanels(prev => prev.filter(p => p.id !== id));
    if (activePanel() === id) {
      setActivePanel(null);
    }
  };

  const togglePanel = (id: number) => {
    setActivePanel(activePanel() === id ? null : id);
  };

  return (
    <div class="floating-panel-demo">
      <div class="demo-header">
        <h1 class="page-title">🪟 Floating Panel Demo</h1>
        <p class="page-description">
          Interactive floating panels with smooth animations, drag-and-drop, and smart positioning.
        </p>
      </div>

      {/* Controls */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>🎛️</span>
          Panel Controls
        </h2>
        <div class="demo-controls">
          <div class="control-group">
            <label class="control-label">Animation Duration (ms)</label>
            <input
              type="range"
              min="100"
              max="1000"
              step="100"
              value={panelConfig().animationDuration}
              onInput={(e) => setPanelConfig(prev => ({
                ...prev,
                animationDuration: parseInt(e.currentTarget.value)
              }))}
            />
            <span class="control-value">{panelConfig().animationDuration}ms</span>
          </div>

          <div class="control-group">
            <label class="control-label">Easing</label>
            <select
              value={panelConfig().easing}
              onChange={(e) => setPanelConfig(prev => ({
                ...prev,
                easing: e.currentTarget.value
              }))}
            >
              <option value="ease-out">Ease Out</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-in-out">Ease In Out</option>
              <option value="linear">Linear</option>
            </select>
          </div>

          <div class="control-group">
            <label class="control-label">
              <input
                type="checkbox"
                checked={panelConfig().backdrop}
                onChange={(e) => setPanelConfig(prev => ({
                  ...prev,
                  backdrop: e.currentTarget.checked
                }))}
              />
              Show Backdrop
            </label>
          </div>

          <div class="control-group">
            <label class="control-label">
              <input
                type="checkbox"
                checked={panelConfig().draggable}
                onChange={(e) => setPanelConfig(prev => ({
                  ...prev,
                  draggable: e.currentTarget.checked
                }))}
              />
              Draggable
            </label>
          </div>

          <div class="control-group">
            <button class="control-button primary" onClick={addPanel}>
              ➕ Add Panel
            </button>
          </div>
        </div>
      </div>

      {/* Panel List */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>📋</span>
          Panel List
        </h2>
        <div class="panel-list">
          <For each={panels()}>
            {(panel) => (
              <div class="panel-item">
                <div class="panel-info">
                  <h4 class="panel-title">{panel.title}</h4>
                  <p class="panel-content">{panel.content}</p>
                  <div class="panel-position">
                    Position: ({panel.position.x}, {panel.position.y})
                  </div>
                </div>
                <div class="panel-actions">
                  <button
                    class="control-button"
                    onClick={() => togglePanel(panel.id)}
                  >
                    {activePanel() === panel.id ? "Hide" : "Show"}
                  </button>
                  <button
                    class="control-button danger"
                    onClick={() => removePanel(panel.id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Floating Panels */}
      <div class="floating-panels-container">
        <For each={panels()}>
          {(panel) => (
            <Show when={activePanel() === panel.id}>
              <FloatingPanel
                title={panel.title}
                position={panel.position}
                draggable={panelConfig().draggable}
                backdrop={panelConfig().backdrop}
                onClose={() => setActivePanel(null)}
                style={{
                  "animation-duration": `${panelConfig().animationDuration}ms`,
                  "animation-timing-function": panelConfig().easing
                }}
              >
                <div class="panel-content">
                  <p>{panel.content}</p>
                  <div class="panel-demo-content">
                    <h4>Panel Configuration:</h4>
                    <ul>
                      <li>Duration: {panelConfig().animationDuration}ms</li>
                      <li>Easing: {panelConfig().easing}</li>
                      <li>Backdrop: {panelConfig().backdrop ? "Yes" : "No"}</li>
                      <li>Draggable: {panelConfig().draggable ? "Yes" : "No"}</li>
                    </ul>
                  </div>
                </div>
              </FloatingPanel>
            </Show>
          )}
        </For>
      </div>

      {/* Code Example */}
      <div class="animation-card">
        <h2 class="card-title">
          <span>💻</span>
          Code Example
        </h2>
        <pre class="code-example">
{`import { FloatingPanel } from "reynard-floating-panel";

<FloatingPanel
  title="My Panel"
  position={{ x: 100, y: 100 }}
  draggable={true}
  backdrop={true}
  onClose={() => setActive(false)}
>
  <div>Panel content goes here</div>
</FloatingPanel>`}
        </pre>
      </div>
    </div>
  );
};
