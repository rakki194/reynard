import { Component, createSignal, createEffect } from "solid-js";
import { useFloatingPanels } from "../composables/useFloatingPanels";

export const FloatingPanelDebugger: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  const floatingPanels = useFloatingPanels();

  createEffect(() => {
    const states = floatingPanels.panelStates();
    console.log("🦦> Floating Panel Debug Info:", {
      panelStates: states,
      isAnyPanelVisible: floatingPanels.isAnyPanelVisible(),
      timestamp: new Date().toISOString(),
    });

    // Log individual panel states
    Object.entries(states).forEach(([key, value]) => {
      console.log(`🦦> Panel ${key}:`, value ? "✅ Visible" : "❌ Hidden");
    });
  });

  if (!isVisible()) {
    return (
      <button
        onClick={() => {
          console.log(
            "🦦> Debug panels button clicked, setting visible to true",
          );
          setIsVisible(true);
        }}
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          "z-index": "9999",
          background: "red",
          color: "white",
          padding: "8px",
          border: "none",
          "border-radius": "4px",
          cursor: "pointer",
        }}
      >
        🐛 Debug Panels
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        left: "10px",
        "z-index": "9999",
        background: "rgba(0,0,0,0.9)",
        color: "white",
        padding: "16px",
        "border-radius": "8px",
        "font-family": "monospace",
        "font-size": "12px",
        "max-width": "400px",
        "max-height": "300px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          "margin-bottom": "12px",
        }}
      >
        <h3 style={{ margin: 0, color: "#00ff00" }}>🦦 Floating Panel Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: "transparent",
            border: "1px solid white",
            color: "white",
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ "margin-bottom": "8px" }}>
        <strong>Panel States:</strong>
        <pre style={{ margin: "4px 0", "font-size": "11px" }}>
          {JSON.stringify(floatingPanels.panelStates(), null, 2)}
        </pre>
      </div>

      <div style={{ "margin-bottom": "8px" }}>
        <strong>Any Panel Visible:</strong>{" "}
        {floatingPanels.isAnyPanelVisible() ? "✅ Yes" : "❌ No"}
      </div>

      <div style={{ "margin-bottom": "8px" }}>
        <strong>Panel Controls:</strong>
        <div style={{ "font-size": "11px", "margin-top": "4px" }}>
          Use the buttons below to control panel visibility
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
        <button
          onClick={() => {
            console.log("🦦> Debug: Show Color button clicked");
            floatingPanels.showPanel("colorPicker");
            console.log(
              "🦦> Debug: Panel states after show color:",
              floatingPanels.panelStates(),
            );
          }}
          style={{
            background: floatingPanels.panelStates().colorPicker
              ? "#00ff00"
              : "#333",
            color: "white",
            border: "none",
            padding: "4px 8px",
            "border-radius": "4px",
            cursor: "pointer",
            "font-size": "11px",
          }}
        >
          Show Color
        </button>
        <button
          onClick={() => floatingPanels.showPanel("toolControls")}
          style={{
            background: floatingPanels.panelStates().toolControls
              ? "#00ff00"
              : "#333",
            color: "white",
            border: "none",
            padding: "4px 8px",
            "border-radius": "4px",
            cursor: "pointer",
            "font-size": "11px",
          }}
        >
          Show Tools
        </button>
        <button
          onClick={() => floatingPanels.showPanel("canvasSize")}
          style={{
            background: floatingPanels.panelStates().canvasSize
              ? "#00ff00"
              : "#333",
            color: "white",
            border: "none",
            padding: "4px 8px",
            "border-radius": "4px",
            cursor: "pointer",
            "font-size": "11px",
          }}
        >
          Show Size
        </button>
        <button
          onClick={() => floatingPanels.showPanel("materialControls")}
          style={{
            background: floatingPanels.panelStates().materialControls
              ? "#00ff00"
              : "#333",
            color: "white",
            border: "none",
            padding: "4px 8px",
            "border-radius": "4px",
            cursor: "pointer",
            "font-size": "11px",
          }}
        >
          Show Material
        </button>
      </div>

      <div style={{ "margin-top": "8px", display: "flex", gap: "8px" }}>
        <button
          onClick={floatingPanels.showAllPanels}
          style={{
            background: "#0066ff",
            color: "white",
            border: "none",
            padding: "4px 8px",
            "border-radius": "4px",
            cursor: "pointer",
            "font-size": "11px",
          }}
        >
          Show All
        </button>
        <button
          onClick={floatingPanels.hideAllPanels}
          style={{
            background: "#ff6600",
            color: "white",
            border: "none",
            padding: "4px 8px",
            "border-radius": "4px",
            cursor: "pointer",
            "font-size": "11px",
          }}
        >
          Hide All
        </button>
      </div>
    </div>
  );
};
