/**
 * RAG Search Tab Panels Component
 *
 * Renders the tab panels for RAG search interface
 * following Reynard modular conventions.
 */
import { TabPanel } from "reynard-components-core";
import { SearchTab } from "./SearchTab";
import { DocumentsTab } from "./DocumentsTab";
import { UploadTab } from "./UploadTab";
import { SettingsTab } from "./SettingsTab";
/**
 * Renders the tab panels for RAG search interface
 *
 * @param props Component props
 * @returns JSX element with tab panels
 */
export function RAGTabPanels(props) {
  return (
    <>
      {/* Search Tab */}
      <TabPanel tabId="search" activeTab={props.activeTab}>
        <SearchTab
          query={props.ragState.query()}
          onQueryChange={props.ragState.setQuery}
          onSearch={props.handlers.handleSearch}
          onKeyPress={props.handlers.handleKeyPress}
          isSearching={props.ragState.isSearching()}
          error={props.ragState.error()}
          results={props.ragState.results()}
          queryResponse={props.ragState.queryResponse()}
          onResultClick={props.handlers.handleResultClick}
        />
      </TabPanel>

      {/* Documents Tab */}
      <TabPanel tabId="documents" activeTab={props.activeTab}>
        <DocumentsTab
          documents={props.ragState.documents()}
          onRefresh={props.ragState.loadDocuments}
          onDeleteDocument={props.ragState.deleteDocument}
        />
      </TabPanel>

      {/* Upload Tab */}
      <TabPanel tabId="upload" activeTab={props.activeTab}>
        <UploadTab
          isUploading={props.ragState.isUploading()}
          uploadProgress={props.ragState.uploadProgress()}
          onFileSelect={props.handlers.handleFileSelect}
        />
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel tabId="settings" activeTab={props.activeTab}>
        <SettingsTab
          embeddingModel={props.ragState.embeddingModel()}
          onEmbeddingModelChange={props.ragState.setEmbeddingModel}
          maxResults={props.ragState.maxResults()}
          onMaxResultsChange={props.ragState.setMaxResults}
          similarityThreshold={props.ragState.similarityThreshold()}
          onSimilarityThresholdChange={props.ragState.setSimilarityThreshold}
          enableReranking={props.ragState.enableReranking()}
          onEnableRerankingChange={props.ragState.setEnableReranking}
          stats={props.ragState.stats()}
        />
      </TabPanel>
    </>
  );
}
