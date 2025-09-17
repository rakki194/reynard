/**
 * Caption Generation Demo Component
 * Demonstrates feature-aware caption generation capabilities
 */

import { createSignal } from "solid-js";
import { useFeatureAware, useFeatureStatus } from "reynard-features";

export default function CaptionGenerationDemo() {
  const { shouldRender, fallback } = useFeatureAware(
    "caption-generation",
    <div class="demo-content unavailable">
      <p>Caption generation is currently unavailable</p>
    </div>
  );

  const status = useFeatureStatus("caption-generation");
  const [inputText, setInputText] = createSignal("");
  const [generatedCaption, setGeneratedCaption] = createSignal("");

  const generateCaption = () => {
    if (inputText()) {
      // Simulate caption generation
      setGeneratedCaption(`AI-generated caption for: "${inputText()}"`);
    }
  };

  return (
    <div class="feature-demo">
      <h3>📝 Caption Generation</h3>
      <p>Generate AI-powered captions for your content</p>

      {shouldRender() ? (
        <div
          class="demo-content"
          classList={{
            degraded: status()?.degraded,
          }}
        >
          {status()?.available && !status()?.degraded ? (
            <p>Caption generation is fully available</p>
          ) : status()?.degraded ? (
            <p>Caption generation is running in degraded mode</p>
          ) : null}

          {status()?.degraded && <div class="status-message warning">⚠️ {status()?.message}</div>}

          <div class="caption-demo-container">
            <textarea
              class="caption-textarea"
              placeholder="Enter text to generate a caption for..."
              value={inputText()}
              onInput={e => setInputText(e.target.value)}
            />

            <button
              class="btn caption-generate-btn"
              onClick={generateCaption}
              disabled={!inputText() || status()?.degraded}
            >
              Generate Caption
            </button>

            {generatedCaption() && (
              <div class="caption-result">
                <strong>Generated Caption:</strong>
                <p>{generatedCaption()}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        fallback
      )}
    </div>
  );
}
