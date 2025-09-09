/**
 * Feature Dashboard Component
 * Shows real-time feature status and statistics
 */

import { createMemo } from "solid-js";
import {
  useFeatures,
  useFeaturesByCategory,
  useCriticalFeatures,
} from "reynard-features";
import { useI18n } from "reynard-themes";

export default function FeatureDashboard() {
  const { t } = useI18n();
  const { featureSummary } = useFeatures();
  const criticalFeatures = useCriticalFeatures();

  const coreFeatures = useFeaturesByCategory("core");
  const mlFeatures = useFeaturesByCategory("ml");
  const integrationFeatures = useFeaturesByCategory("integration");
  const utilityFeatures = useFeaturesByCategory("utility");
  const uiFeatures = useFeaturesByCategory("ui");
  const dataFeatures = useFeaturesByCategory("data");

  const summary = createMemo(() => featureSummary());

  return (
    <div class="feature-dashboard">
      {/* Feature Statistics */}
      <div class="feature-panel">
        <h3>📊 Feature Overview</h3>
        <div class="feature-stats">
          <div class="stat-card">
            <div class="stat-value">{summary().total}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-value success">{summary().available}</div>
            <div class="stat-label">Available</div>
          </div>
          <div class="stat-card">
            <div class="stat-value warning">{summary().degraded}</div>
            <div class="stat-label">Degraded</div>
          </div>
          <div class="stat-card">
            <div class="stat-value danger">{summary().unavailable}</div>
            <div class="stat-label">Unavailable</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{Math.round(summary().successRate)}%</div>
            <div class="stat-label">Success Rate</div>
          </div>
        </div>

        {/* Critical Features Status */}
        <div class="critical-features-section">
          <h4 class="critical-features-title">🚨 Critical Features</h4>
          <div
            class="status-message"
            classList={{
              success: criticalFeatures().available,
              error: !criticalFeatures().available,
            }}
          >
            {criticalFeatures().available
              ? "✅ All critical features available"
              : "❌ Some critical features unavailable"}
          </div>
          {!criticalFeatures().available && (
            <div class="critical-features-details">
              Unavailable:{" "}
              {criticalFeatures()
                .unavailable.map((f) => f.name)
                .join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* Features by Category */}
      <div class="feature-panel">
        <h3>📂 Features by Category</h3>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-status available" />
            <div class="feature-info">
              <div class="feature-name">Core ({coreFeatures().length})</div>
              <div class="feature-description">
                Essential application features
              </div>
            </div>
            <div class="feature-category">core</div>
          </div>

          <div class="feature-item">
            <div class="feature-status available" />
            <div class="feature-info">
              <div class="feature-name">ML/AI ({mlFeatures().length})</div>
              <div class="feature-description">
                Machine learning capabilities
              </div>
            </div>
            <div class="feature-category">ml</div>
          </div>

          <div class="feature-item">
            <div class="feature-status available" />
            <div class="feature-info">
              <div class="feature-name">
                Integration ({integrationFeatures().length})
              </div>
              <div class="feature-description">
                Third-party service integrations
              </div>
            </div>
            <div class="feature-category">integration</div>
          </div>

          <div class="feature-item">
            <div class="feature-status available" />
            <div class="feature-info">
              <div class="feature-name">
                Utility ({utilityFeatures().length})
              </div>
              <div class="feature-description">
                Supporting utilities and tools
              </div>
            </div>
            <div class="feature-category">utility</div>
          </div>

          <div class="feature-item">
            <div class="feature-status available" />
            <div class="feature-info">
              <div class="feature-name">UI ({uiFeatures().length})</div>
              <div class="feature-description">User interface features</div>
            </div>
            <div class="feature-category">ui</div>
          </div>

          <div class="feature-item">
            <div class="feature-status available" />
            <div class="feature-info">
              <div class="feature-name">Data ({dataFeatures().length})</div>
              <div class="feature-description">
                Data processing and management
              </div>
            </div>
            <div class="feature-category">data</div>
          </div>
        </div>
      </div>
    </div>
  );
}
