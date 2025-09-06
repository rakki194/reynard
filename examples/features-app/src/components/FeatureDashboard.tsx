/**
 * Feature Dashboard Component
 * Shows real-time feature status and statistics
 */

import { createMemo } from "solid-js";
import { 
  useFeatures, 
  useFeaturesByCategory, 
  useFeaturesByPriority,
  useCriticalFeatures 
} from "reynard-features";
import { useLanguage } from "reynard-core";

export default function FeatureDashboard() {
  const { t } = useLanguage();
  const { featureSummary, availableFeatures, degradedFeatures } = useFeatures();
  const criticalFeatures = useCriticalFeatures();
  
  const coreFeatures = useFeaturesByCategory("core");
  const mlFeatures = useFeaturesByCategory("ml");
  const integrationFeatures = useFeaturesByCategory("integration");
  const utilityFeatures = useFeaturesByCategory("utility");
  const uiFeatures = useFeaturesByCategory("ui");
  const dataFeatures = useFeaturesByCategory("data");

  const criticalFeaturesList = useFeaturesByPriority("critical");
  const highFeaturesList = useFeaturesByPriority("high");
  const mediumFeaturesList = useFeaturesByPriority("medium");
  const lowFeaturesList = useFeaturesByPriority("low");

  const summary = createMemo(() => featureSummary());

  return (
    <div class="feature-dashboard">
      {/* Feature Statistics */}
      <div class="feature-panel">
        <h3>📊 {t("features.overview")}</h3>
        <div class="feature-stats">
          <div class="stat-card">
            <div class="stat-value">{summary().total}</div>
            <div class="stat-label">{t("features.total")}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--success);">{summary().available}</div>
            <div class="stat-label">{t("features.available")}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--warning);">{summary().degraded}</div>
            <div class="stat-label">{t("features.degraded")}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="color: var(--danger);">{summary().unavailable}</div>
            <div class="stat-label">{t("features.unavailable")}</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{Math.round(summary().successRate)}%</div>
            <div class="stat-label">{t("features.successRate")}</div>
          </div>
        </div>
        
        {/* Critical Features Status */}
        <div style="margin-top: var(--spacing);">
          <h4 style="margin: 0 0 calc(var(--spacing) / 2) 0; color: var(--accent);">
            🚨 {t("features.critical")} Features
          </h4>
          <div class="status-message" classList={{
            success: criticalFeatures().available,
            error: !criticalFeatures().available
          }}>
            {criticalFeatures().available ? "✅ All critical features available" : "❌ Some critical features unavailable"}
          </div>
          {!criticalFeatures().available && (
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: calc(var(--spacing) / 2);">
              Unavailable: {criticalFeatures().unavailable.map(f => f.name).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* Features by Category */}
      <div class="feature-panel">
        <h3>📂 Features by Category</h3>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-status available"></div>
            <div class="feature-info">
              <div class="feature-name">Core ({coreFeatures().length})</div>
              <div class="feature-description">Essential application features</div>
            </div>
            <div class="feature-category">core</div>
          </div>
          
          <div class="feature-item">
            <div class="feature-status available"></div>
            <div class="feature-info">
              <div class="feature-name">ML/AI ({mlFeatures().length})</div>
              <div class="feature-description">Machine learning capabilities</div>
            </div>
            <div class="feature-category">ml</div>
          </div>
          
          <div class="feature-item">
            <div class="feature-status available"></div>
            <div class="feature-info">
              <div class="feature-name">Integration ({integrationFeatures().length})</div>
              <div class="feature-description">Third-party service integrations</div>
            </div>
            <div class="feature-category">integration</div>
          </div>
          
          <div class="feature-item">
            <div class="feature-status available"></div>
            <div class="feature-info">
              <div class="feature-name">Utility ({utilityFeatures().length})</div>
              <div class="feature-description">Supporting utilities and tools</div>
            </div>
            <div class="feature-category">utility</div>
          </div>
          
          <div class="feature-item">
            <div class="feature-status available"></div>
            <div class="feature-info">
              <div class="feature-name">UI ({uiFeatures().length})</div>
              <div class="feature-description">User interface features</div>
            </div>
            <div class="feature-category">ui</div>
          </div>
          
          <div class="feature-item">
            <div class="feature-status available"></div>
            <div class="feature-info">
              <div class="feature-name">Data ({dataFeatures().length})</div>
              <div class="feature-description">Data processing and management</div>
            </div>
            <div class="feature-category">data</div>
          </div>
        </div>
      </div>
    </div>
  );
}
