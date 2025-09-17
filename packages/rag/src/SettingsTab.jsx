/**
 * RAG Settings Tab Component
 *
 * Orchestrates search settings and system statistics display
 * using modular components following Reynard architecture.
 */
import { SearchSettings, SystemStats } from "./components";
export function SettingsTab(props) {
    return (<div class="settings-tab-content">
      <SearchSettings embeddingModel={props.embeddingModel} onEmbeddingModelChange={props.onEmbeddingModelChange} maxResults={props.maxResults} onMaxResultsChange={props.onMaxResultsChange} similarityThreshold={props.similarityThreshold} onSimilarityThresholdChange={props.onSimilarityThresholdChange} enableReranking={props.enableReranking} onEnableRerankingChange={props.onEnableRerankingChange}/>
      <SystemStats stats={props.stats}/>
    </div>);
}
