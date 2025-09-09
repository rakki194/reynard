/**
 * Object Detection Demo Component
 * Demonstrates feature-aware object detection capabilities
 */

import { createSignal } from "solid-js";
import { useFeatureAware, useFeatureStatus } from "reynard-features";
import { useI18n } from "reynard-themes";

export default function ObjectDetectionDemo() {
  const { t } = useI18n();
  const { shouldRender, fallback } = useFeatureAware(
    "object-detection",
    <div class="demo-content unavailable">
      <p>Object detection is currently unavailable</p>
    </div>,
  );

  const status = useFeatureStatus("object-detection");
  const [detectedObjects, setDetectedObjects] = createSignal<string[]>([]);
  const [isDetecting, setIsDetecting] = createSignal(false);

  const simulateDetection = () => {
    setIsDetecting(true);
    // Simulate detection process
    setTimeout(() => {
      const mockObjects = ["person", "car", "tree", "building", "dog"];
      const randomObjects = mockObjects
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);
      setDetectedObjects(randomObjects);
      setIsDetecting(false);
    }, 2000);
  };

  return (
    <div class="feature-demo">
      <h3>🎯 Object Detection</h3>
      <p>Detect and identify objects in images</p>

      {shouldRender() ? (
        <div class="demo-content">
          <p>Object detection is fully available</p>

          {status()?.degraded && (
            <div class="status-message warning">⚠️ {status()?.message}</div>
          )}

          <div style={{ "margin-top": "var(--spacing)" }}>
            <button
              class="btn"
              onClick={simulateDetection}
              disabled={isDetecting()}
            >
              {isDetecting()
                ? "Detecting Objects..."
                : "Simulate Object Detection"}
            </button>

            {isDetecting() && (
              <div
                style={{
                  "margin-top": "var(--spacing)",
                  "text-align": "center",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: "20px",
                    height: "20px",
                    border: "2px solid var(--accent)",
                    "border-top": "2px solid transparent",
                    "border-radius": "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                <p
                  style={{
                    "margin-top": "calc(var(--spacing) / 2)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Analyzing image...
                </p>
              </div>
            )}

            {detectedObjects().length > 0 && (
              <div
                style={{
                  "margin-top": "var(--spacing)",
                  padding: "var(--spacing)",
                  background: "var(--secondary-bg)",
                  "border-radius": "var(--border-radius)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <strong>Detected Objects:</strong>
                <div
                  style={{
                    display: "flex",
                    "flex-wrap": "wrap",
                    gap: "calc(var(--spacing) / 2)",
                    "margin-top": "calc(var(--spacing) / 2)",
                  }}
                >
                  {detectedObjects().map((object) => (
                    <span
                      style={{
                        background: "var(--accent)",
                        color: "white",
                        padding: "2px 8px",
                        "border-radius": "12px",
                        "font-size": "0.8rem",
                      }}
                    >
                      {object}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        fallback
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
