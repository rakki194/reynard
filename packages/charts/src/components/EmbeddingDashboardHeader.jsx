/**
 * Embedding Dashboard Header Component
 *
 * Handles the dashboard header with tab navigation.
 */
export const EmbeddingDashboardHeader = (props) => {
    return (<div class="dashboard-header">
      <h2>Embedding Visualization Dashboard</h2>
      <div class="dashboard-controls">
        <button class={`tab-button ${props.activeTab === "distribution" ? "active" : ""}`} onClick={() => props.onTabChange("distribution")}>
          Distribution
        </button>
        <button class={`tab-button ${props.activeTab === "pca" ? "active" : ""}`} onClick={() => props.onTabChange("pca")}>
          PCA Analysis
        </button>
        <button class={`tab-button ${props.activeTab === "quality" ? "active" : ""}`} onClick={() => props.onTabChange("quality")}>
          Quality Metrics
        </button>
        <button class={`tab-button ${props.activeTab === "3d" ? "active" : ""}`} onClick={() => props.onTabChange("3d")}>
          3D Visualization
        </button>
      </div>
    </div>);
};
