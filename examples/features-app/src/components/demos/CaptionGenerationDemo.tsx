/**
 * Caption Generation Demo Component
 * Demonstrates feature-aware caption generation capabilities
 */

import { createSignal } from "solid-js";
import { useFeatureAware, useFeatureStatus } from "reynard-features";
import { useLanguage } from "reynard-core";

export default function CaptionGenerationDemo() {
  const { t } = useLanguage();
  const { shouldRender, fallback } = useFeatureAware(
    "caption-generation",
    <div class="demo-content unavailable">
      <p>{t("demo.captionGeneration.unavailable")}</p>
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
      <h3>📝 {t("demo.captionGeneration.title")}</h3>
      <p>{t("demo.captionGeneration.description")}</p>
      
      {shouldRender() ? (
        <div class="demo-content" classList={{
          degraded: status()?.degraded
        }}>
          {status()?.available && !status()?.degraded ? (
            <p>{t("demo.captionGeneration.available")}</p>
          ) : status()?.degraded ? (
            <p>{t("demo.captionGeneration.degraded")}</p>
          ) : null}
          
          {status()?.degraded && (
            <div class="status-message warning">
              ⚠️ {status()?.message}
            </div>
          )}
          
          <div style="margin-top: var(--spacing);">
            <textarea
              placeholder="Enter text to generate a caption for..."
              value={inputText()}
              onInput={(e) => setInputText(e.target.value)}
              style="width: 100%; min-height: 80px; padding: calc(var(--spacing) / 2); border: 1px solid var(--border-color); border-radius: var(--border-radius); background: var(--bg-color); color: var(--text-primary); resize: vertical;"
            />
            
            <button 
              class="btn" 
              onClick={generateCaption}
              disabled={!inputText() || status()?.degraded}
              style="margin-top: calc(var(--spacing) / 2);"
            >
              Generate Caption
            </button>
            
            {generatedCaption() && (
              <div style="margin-top: var(--spacing); padding: var(--spacing); background: var(--secondary-bg); border-radius: var(--border-radius); border: 1px solid var(--border-color);">
                <strong>Generated Caption:</strong>
                <p style="margin: calc(var(--spacing) / 2) 0 0 0;">{generatedCaption()}</p>
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
