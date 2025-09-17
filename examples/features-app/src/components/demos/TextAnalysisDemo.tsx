/**
 * Text Analysis Demo Component
 * Demonstrates feature-aware text analysis capabilities
 */

import { createSignal } from "solid-js";
import { useFeatureAware, useFeatureStatus } from "reynard-features";
import { useI18n } from "reynard-themes";

export default function TextAnalysisDemo() {
  const { t } = useI18n();
  const { shouldRender, fallback } = useFeatureAware(
    "text-analysis",
    <div class="demo-content unavailable">
      <p>Text analysis is currently unavailable</p>
    </div>
  );

  const status = useFeatureStatus("text-analysis");
  const [inputText, setInputText] = createSignal("");
  const [analysisResult, setAnalysisResult] = createSignal<any>(null);
  const [isAnalyzing, setIsAnalyzing] = createSignal(false);

  const analyzeText = () => {
    if (inputText()) {
      setIsAnalyzing(true);
      // Simulate text analysis
      setTimeout(() => {
        const text = inputText();
        const words = text.split(/\s+/).length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const characters = text.length;
        const sentiment = Math.random() > 0.5 ? "positive" : "negative";

        setAnalysisResult({
          wordCount: words,
          sentenceCount: sentences,
          characterCount: characters,
          sentiment,
          keywords: text
            .split(/\s+/)
            .filter(word => word.length > 4)
            .slice(0, 5),
        });
        setIsAnalyzing(false);
      }, 1500);
    }
  };

  return (
    <div class="feature-demo">
      <h3>📄 Text Analysis</h3>
      <p>Analyze text content with NLP capabilities</p>

      {shouldRender() ? (
        <div class="demo-content">
          <p>Text analysis is fully available</p>

          {status()?.degraded && <div class="status-message warning">⚠️ {status()?.message}</div>}

          <div style={{ "margin-top": "var(--spacing)" }}>
            <textarea
              placeholder="Enter text to analyze..."
              value={inputText()}
              onInput={e => setInputText(e.target.value)}
              style={{
                width: "100%",
                "min-height": "100px",
                padding: "calc(var(--spacing) / 2)",
                border: "1px solid var(--border-color)",
                "border-radius": "var(--border-radius)",
                background: "var(--bg-color)",
                color: "var(--text-primary)",
                resize: "vertical",
              }}
            />

            <button
              class="btn"
              onClick={analyzeText}
              disabled={!inputText() || isAnalyzing()}
              style={{ "margin-top": "calc(var(--spacing) / 2)" }}
            >
              {isAnalyzing() ? "Analyzing..." : "Analyze Text"}
            </button>

            {isAnalyzing() && (
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
                  Processing text...
                </p>
              </div>
            )}

            {analysisResult() && (
              <div
                style={{
                  "margin-top": "var(--spacing)",
                  padding: "var(--spacing)",
                  background: "var(--secondary-bg)",
                  "border-radius": "var(--border-radius)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <strong>Analysis Results:</strong>
                <div
                  style={{
                    display: "grid",
                    "grid-template-columns": "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "calc(var(--spacing) / 2)",
                    "margin-top": "calc(var(--spacing) / 2)",
                  }}
                >
                  <div class="stat-card">
                    <div class="stat-value">{analysisResult().wordCount}</div>
                    <div class="stat-label">Words</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-value">{analysisResult().sentenceCount}</div>
                    <div class="stat-label">Sentences</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-value">{analysisResult().characterCount}</div>
                    <div class="stat-label">Characters</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-value" style={{ color: "var(--accent)" }}>
                      {analysisResult().sentiment}
                    </div>
                    <div class="stat-label">Sentiment</div>
                  </div>
                </div>
                {analysisResult().keywords.length > 0 && (
                  <div style={{ "margin-top": "var(--spacing)" }}>
                    <strong>Key Terms:</strong>
                    <div
                      style={{
                        display: "flex",
                        "flex-wrap": "wrap",
                        gap: "calc(var(--spacing) / 2)",
                        "margin-top": "calc(var(--spacing) / 2)",
                      }}
                    >
                      {analysisResult().keywords.map((keyword: string) => (
                        <span
                          style={{
                            background: "var(--accent)",
                            color: "white",
                            padding: "2px 8px",
                            "border-radius": "12px",
                            "font-size": "0.8rem",
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
