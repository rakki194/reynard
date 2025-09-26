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

interface EmbeddingVisualizationDashboardProps {
  isVisible?: boolean;
  class?: string;
  data?: any;
  onDataUpdate?: (data: any) => void;
  [key: string]: any;
}

export const EmbeddingVisualizationDashboard = (props: EmbeddingVisualizationDashboardProps) => {
  const embeddingViz = useEmbeddingVisualization();
  const dashboard = useEmbeddingDashboard(() => props.isVisible ?? true);
  return (
    <div class={`reynard-embedding-visualization-dashboard ${props.class || ""}`}>
      <EmbeddingDashboardHeader
        activeTab={dashboard.activeTab()}
        onTabChange={(tab: string) => dashboard.setActiveTab(tab as any)}
      />

      <div class="dashboard-content">
        <EmbeddingDashboardSidebar
          stats={embeddingViz.stats()}
          availableMethods={embeddingViz.availableMethods()}
          reductionMethod={dashboard.reductionMethod()}
          reductionParams={dashboard.reductionParams()}
          maxSamples={dashboard.maxSamples()}
          isLoading={dashboard.isLoading()}
          onMethodChange={(method: string) => dashboard.setReductionMethod(method as any)}
          onParameterUpdate={(param: string, value: any) => dashboard.updateReductionParams(param, value)}
          onMaxSamplesChange={dashboard.setMaxSamples}
          onPerformReduction={dashboard.performReduction}
        />

        <EmbeddingVisualizationContent
          activeTab={dashboard.activeTab()}
          embeddingData={dashboard.embeddingData()}
          pcaData={dashboard.pcaData()}
          qualityData={dashboard.qualityData()}
          reductionResult={dashboard.reductionResult()}
          width={props.width}
          height={props.height}
          theme={props.theme}
          error={dashboard.error()}
          isLoading={dashboard.isLoading()}
          onRetry={dashboard.loadEmbeddingData}
        />
      </div>
    </div>
  );
};
