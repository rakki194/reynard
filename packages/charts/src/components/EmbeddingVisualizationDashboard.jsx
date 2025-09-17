/**
 * Embedding Visualization Dashboard
 *
 * Comprehensive dashboard for embedding analysis and visualization.
 * Integrates all embedding visualization components with real-time data.
 */
import { EmbeddingDashboardHeader } from "./EmbeddingDashboardHeader";
import { EmbeddingDashboardSidebar } from "./EmbeddingDashboardSidebar";
import { EmbeddingVisualizationContent } from "./EmbeddingVisualizationContent";
import { useEmbeddingDashboard } from "../composables/useEmbeddingDashboard";
import { useEmbeddingVisualization } from "../composables/useEmbeddingVisualization";
export const EmbeddingVisualizationDashboard = (props) => {
    const embeddingViz = useEmbeddingVisualization();
    const dashboard = useEmbeddingDashboard(() => props.isVisible ?? true);
    return (<div class={`reynard-embedding-visualization-dashboard ${props.class || ""}`}>
      <EmbeddingDashboardHeader activeTab={dashboard.activeTab()} onTabChange={dashboard.setActiveTab}/>

      <div class="dashboard-content">
        <EmbeddingDashboardSidebar stats={embeddingViz.stats()} availableMethods={embeddingViz.availableMethods()} reductionMethod={dashboard.reductionMethod()} reductionParams={dashboard.reductionParams()} maxSamples={dashboard.maxSamples()} isLoading={dashboard.isLoading()} onMethodChange={(method) => dashboard.setReductionMethod(method)} onParameterUpdate={dashboard.updateReductionParams} onMaxSamplesChange={dashboard.setMaxSamples} onPerformReduction={dashboard.performReduction}/>

        <EmbeddingVisualizationContent activeTab={dashboard.activeTab()} embeddingData={dashboard.embeddingData()} pcaData={dashboard.pcaData()} qualityData={dashboard.qualityData()} reductionResult={dashboard.reductionResult()} width={props.width} height={props.height} theme={props.theme} error={dashboard.error()} isLoading={dashboard.isLoading()} onRetry={dashboard.loadEmbeddingData}/>
      </div>
    </div>);
};
