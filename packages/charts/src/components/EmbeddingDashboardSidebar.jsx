/**
 * Embedding Dashboard Sidebar Component
 *
 * Handles the dashboard sidebar with stats and method selector.
 */
import { EmbeddingStatsPanel } from "./EmbeddingStatsPanel";
import { EmbeddingMethodSelector } from "./EmbeddingMethodSelector";
export const EmbeddingDashboardSidebar = props => {
    return (<div class="dashboard-sidebar">
      <EmbeddingStatsPanel stats={props.stats}/>
      <EmbeddingMethodSelector availableMethods={props.availableMethods} reductionMethod={props.reductionMethod} reductionParams={props.reductionParams} maxSamples={props.maxSamples} isLoading={props.isLoading} onMethodChange={props.onMethodChange} onParameterUpdate={props.onParameterUpdate} onMaxSamplesChange={props.onMaxSamplesChange} onPerformReduction={props.onPerformReduction}/>
    </div>);
};
