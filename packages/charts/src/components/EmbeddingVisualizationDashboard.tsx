/**
 * Embedding Visualization Dashboard
 * 
 * Comprehensive dashboard for embedding analysis and visualization.
 * Integrates all embedding visualization components with real-time data.
 */

import {
  Component,
  createSignal,
  createEffect,
  onMount,
  Show,
  For,
} from "solid-js";
import { EmbeddingDistributionChart } from "./EmbeddingDistributionChart";
import { PCAVarianceChart } from "./PCAVarianceChart";
import { EmbeddingQualityChart } from "./EmbeddingQualityChart";
import { Embedding3DVisualization } from "./Embedding3DVisualization";
import { useEmbeddingVisualization } from "../composables/useEmbeddingVisualization";
import { EmbeddingReductionRequest } from "../composables/useEmbeddingVisualization";

export interface EmbeddingVisualizationDashboardProps {
  /** Whether the dashboard is visible */
  isVisible?: boolean;
  /** Width of the dashboard */
  width?: number;
  /** Height of the dashboard */
  height?: number;
  /** Whether to show loading states */
  showLoading?: boolean;
  /** Theme for the dashboard */
  theme?: string;
  /** Custom class name */
  class?: string;
}

export const EmbeddingVisualizationDashboard: Component<EmbeddingVisualizationDashboardProps> = (props) => {
  const embeddingViz = useEmbeddingVisualization();
  
  // State
  const [activeTab, setActiveTab] = createSignal<'distribution' | 'pca' | 'quality' | '3d'>('distribution');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string>('');
  const [embeddingData, setEmbeddingData] = createSignal<any>(null);
  const [pcaData, setPcaData] = createSignal<any>(null);
  const [qualityData, setQualityData] = createSignal<any>(null);
  const [reductionMethod, setReductionMethod] = createSignal<'pca' | 'tsne' | 'umap'>('pca');
  const [reductionParams, setReductionParams] = createSignal<Record<string, any>>({});
  const [maxSamples, setMaxSamples] = createSignal(1000);
  const [reductionResult, setReductionResult] = createSignal<any>(null);

  // Load embedding data when component mounts
  createEffect(() => {
    if (props.isVisible !== false) {
      loadEmbeddingData();
    }
  });

  // Load embedding data and compute statistics
  const loadEmbeddingData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get embedding statistics
      const stats = embeddingViz.stats();
      if (!stats) {
        throw new Error('Failed to load embedding statistics');
      }

      // Generate sample embeddings for demonstration
      const sampleEmbeddings = embeddingViz.generateSampleEmbeddings(1000, stats.embedding_dimension);

      // Process distribution data
      const distributionData = embeddingViz.processDistributionData(sampleEmbeddings);
      setEmbeddingData(distributionData);

      // Process PCA data
      const pcaVarianceData = embeddingViz.processPCAVarianceData(sampleEmbeddings);
      setPcaData(pcaVarianceData);

      // Process quality data
      const qualityMetricsData = embeddingViz.processQualityMetricsData(sampleEmbeddings);
      setQualityData(qualityMetricsData);

    } catch (err) {
      console.error('Error loading embedding data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load embedding data');
    } finally {
      setIsLoading(false);
    }
  };

  // Perform dimensionality reduction
  const performReduction = async () => {
    try {
      setIsLoading(true);
      setError('');

      const request: EmbeddingReductionRequest = {
        method: reductionMethod(),
        parameters: reductionParams(),
        max_samples: maxSamples(),
        use_cache: true,
        random_seed: 42
      };

      const result = await embeddingViz.performReduction(request);
      
      if (!result.success) {
        throw new Error(result.error || 'Dimensionality reduction failed');
      }

      setReductionResult(result);
      console.log('Reduction completed:', result);
      
    } catch (err) {
      console.error('Error performing reduction:', err);
      setError(err instanceof Error ? err.message : 'Reduction failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Update reduction parameters
  const updateReductionParams = (key: string, value: any) => {
    setReductionParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderMethodSelector = () => {
    const methods = embeddingViz.availableMethods();
    if (!methods) return null;

    return (
      <div class="method-selector">
        <h3>Dimensionality Reduction</h3>
        <div class="method-controls">
          <div class="method-select">
            <label>Method:</label>
            <select 
              value={reductionMethod()} 
              onChange={(e) => setReductionMethod(e.currentTarget.value as any)}
            >
              <For each={Object.keys(methods.methods)}>
                {(method) => (
                  <option value={method}>
                    {methods.methods[method].name}
                  </option>
                )}
              </For>
            </select>
          </div>

          <div class="samples-control">
            <label>Max Samples:</label>
            <input 
              type="number" 
              value={maxSamples()} 
              min="100" 
              max="10000" 
              step="100"
              onChange={(e) => setMaxSamples(parseInt(e.currentTarget.value))}
            />
          </div>

          <button 
            class="reduce-button" 
            onClick={performReduction}
            disabled={isLoading()}
          >
            {isLoading() ? 'Processing...' : 'Perform Reduction'}
          </button>
        </div>

        <Show when={methods.methods[reductionMethod()]}>
          <div class="method-parameters">
            <h4>Parameters</h4>
            <For each={Object.entries(methods.methods[reductionMethod()].parameters)}>
              {([paramName, paramInfo]: [string, any]) => (
                <div class="parameter-control">
                  <label>{paramInfo.description}:</label>
                  <Show when={paramInfo.type === 'integer'}>
                    <input 
                      type="number" 
                      value={reductionParams()[paramName] || paramInfo.default}
                      min={paramInfo.min}
                      max={paramInfo.max}
                      onChange={(e) => updateReductionParams(paramName, parseInt(e.currentTarget.value))}
                    />
                  </Show>
                  <Show when={paramInfo.type === 'float'}>
                    <input 
                      type="number" 
                      step="0.1"
                      value={reductionParams()[paramName] || paramInfo.default}
                      min={paramInfo.min}
                      max={paramInfo.max}
                      onChange={(e) => updateReductionParams(paramName, parseFloat(e.currentTarget.value))}
                    />
                  </Show>
                  <Show when={paramInfo.type === 'boolean'}>
                    <input 
                      type="checkbox" 
                      checked={reductionParams()[paramName] || paramInfo.default}
                      onChange={(e) => updateReductionParams(paramName, e.currentTarget.checked)}
                    />
                  </Show>
                  <Show when={paramInfo.type === 'string' && paramInfo.options}>
                    <select 
                      value={reductionParams()[paramName] || paramInfo.default}
                      onChange={(e) => updateReductionParams(paramName, e.currentTarget.value)}
                    >
                      <For each={paramInfo.options}>
                        {(option: string) => (
                          <option value={option}>{option}</option>
                        )}
                      </For>
                    </select>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    );
  };

  const renderStatsPanel = () => {
    const stats = embeddingViz.stats();
    if (!stats) return null;

    return (
      <div class="stats-panel">
        <h3>Embedding Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Total Embeddings:</div>
            <div class="stat-value">{stats.total_embeddings.toLocaleString()}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Dimensions:</div>
            <div class="stat-value">{stats.embedding_dimension}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Quality Score:</div>
            <div class="stat-value">{(stats.quality_score * 100).toFixed(1)}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Last Updated:</div>
            <div class="stat-value">{new Date(stats.last_updated).toLocaleString()}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div class={`reynard-embedding-visualization-dashboard ${props.class || ""}`}>
      <div class="dashboard-header">
        <h2>Embedding Visualization Dashboard</h2>
        <div class="dashboard-controls">
          <button 
            class={`tab-button ${activeTab() === 'distribution' ? 'active' : ''}`}
            onClick={() => setActiveTab('distribution')}
          >
            Distribution
          </button>
          <button 
            class={`tab-button ${activeTab() === 'pca' ? 'active' : ''}`}
            onClick={() => setActiveTab('pca')}
          >
            PCA Analysis
          </button>
          <button 
            class={`tab-button ${activeTab() === 'quality' ? 'active' : ''}`}
            onClick={() => setActiveTab('quality')}
          >
            Quality Metrics
          </button>
          <button 
            class={`tab-button ${activeTab() === '3d' ? 'active' : ''}`}
            onClick={() => setActiveTab('3d')}
          >
            3D Visualization
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="dashboard-sidebar">
          {renderStatsPanel()}
          {renderMethodSelector()}
        </div>

        <div class="dashboard-main">
          <Show when={error()}>
            <div class="error-message">
              <h4>Error</h4>
              <p>{error()}</p>
              <button onClick={loadEmbeddingData}>Retry</button>
            </div>
          </Show>

          <Show when={!isLoading() && !error()}>
            <div class="visualization-content">
              <Show when={activeTab() === 'distribution' && embeddingData()}>
                <div class="chart-section">
                  <h4>Embedding Value Distribution</h4>
                  <div class="chart-grid">
                    <EmbeddingDistributionChart
                      title="Embedding Value Histogram"
                      type="histogram"
                      data={embeddingData()}
                      width={props.width || 400}
                      height={props.height || 300}
                      xAxisLabel="Embedding Value"
                      yAxisLabel="Frequency"
                      showStatistics={true}
                      theme={props.theme}
                    />
                    <EmbeddingDistributionChart
                      title="Embedding Value Box Plot"
                      type="boxplot"
                      data={embeddingData()}
                      width={props.width || 400}
                      height={props.height || 300}
                      xAxisLabel="Statistic"
                      yAxisLabel="Value"
                      showStatistics={true}
                      theme={props.theme}
                    />
                  </div>
                </div>
              </Show>

              <Show when={activeTab() === 'pca' && pcaData()}>
                <div class="chart-section">
                  <h4>PCA Explained Variance Analysis</h4>
                  <PCAVarianceChart
                    title="Explained Variance by Principal Components"
                    data={pcaData()}
                    width={props.width || 600}
                    height={props.height || 400}
                    showCumulative={true}
                    showRecommendations={true}
                    maxComponents={20}
                    theme={props.theme}
                  />
                </div>
              </Show>

              <Show when={activeTab() === 'quality' && qualityData()}>
                <div class="chart-section">
                  <h4>Embedding Quality Analysis</h4>
                  <div class="chart-grid">
                    <EmbeddingQualityChart
                      title="Quality Metrics"
                      type="quality-bar"
                      data={qualityData()}
                      width={props.width || 400}
                      height={props.height || 300}
                      showAssessment={true}
                      theme={props.theme}
                    />
                    <EmbeddingQualityChart
                      title="Overall Quality Score"
                      type="quality-gauge"
                      data={qualityData()}
                      width={props.width || 400}
                      height={props.height || 300}
                      showAssessment={true}
                      theme={props.theme}
                    />
                  </div>
                </div>
              </Show>

              <Show when={activeTab() === '3d'}>
                <div class="chart-section">
                  <h4>3D Embedding Visualization</h4>
                  <Show when={reductionResult()}>
                    <Embedding3DVisualization
                      data={reductionResult()}
                      width={props.width || 800}
                      height={props.height || 600}
                      pointSize={2}
                      enableHighlighting={true}
                      showSimilarityPaths={true}
                      theme={props.theme}
                      onPointClick={(index, data) => {
                        console.log('Point clicked:', index, data);
                      }}
                      onPointHover={(index, data) => {
                        console.log('Point hovered:', index, data);
                      }}
                    />
                  </Show>
                  <Show when={!reductionResult()}>
                    <div class="3d-placeholder">
                      <p>Perform a dimensionality reduction to see 3D visualization</p>
                      <p>Use the controls in the sidebar to reduce embeddings to 3D</p>
                    </div>
                  </Show>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
