/**
 * RAG Search Interface Component
 *
 * Focused component for search UI elements and basic interactions.
 * Extracted from RAGSearch.tsx to follow the 140-line axiom.
 */
import { createSignal, Show } from "solid-js";
import { Tabs, Button, Select, TextField } from "reynard-components-core";
import { Icon } from "reynard-components-core";
import { RAGTabPanels } from "../RAGTabPanels";
import { createRAGTabConfig } from "../tab-config";
import type { RAGSearchProps, RAGModality } from "../types";

export interface RAGSearchInterfaceProps {
  // Core props
  props: RAGSearchProps;

  // State from parent
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Search state
  modality: () => RAGModality;
  setModality: (modality: RAGModality) => void;
  topK: () => number;
  setTopK: (topK: any) => void;

  // Handlers
  onSearch: (query: string, modality: RAGModality, topK: number) => Promise<void>;
  onFileModalOpen: (filePath: string, fileName: string, content: string) => void;
  onImageModalOpen: (imagePath: string, imageId: string, score: number) => void;
  on3DModalOpen: (query: string, results: any[]) => void;

  // RAG state (passed from parent)
  ragState: any;
}

export function RAGSearchInterface(props: RAGSearchInterfaceProps) {
  const [query, setQuery] = createSignal("");

  // Create tab configuration
  const tabConfig = createRAGTabConfig();

  const handleSearch = async () => {
    const currentQuery = query();
    if (!currentQuery.trim()) return;

    await props.onSearch(currentQuery, props.modality(), props.topK());
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div class="rag-search-interface">
      {/* Search Header */}
      <div class="search-header">
        <div class="search-controls">
          <TextField
            value={query()}
            onInput={e => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search documents, code, or images..."
            fullWidth
          />

          <div class="search-options">
            <Select
              value={props.modality()}
              onChange={e => props.setModality(e.target.value as RAGModality)}
              options={[
                { value: "docs", label: "Documents" },
                { value: "code", label: "Code" },
                { value: "images", label: "Images" },
                { value: "captions", label: "Captions" },
              ]}
            />

            <Select
              value={props.topK().toString()}
              onChange={e => props.setTopK(parseInt(e.target.value))}
              options={[
                { value: "10", label: "10 results" },
                { value: "20", label: "20 results" },
                { value: "50", label: "50 results" },
                { value: "100", label: "100 results" },
              ]}
            />

            <Button onClick={handleSearch} variant="primary" leftIcon={<Icon name="search" />}>
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs activeTab={props.activeTab} onTabChange={props.setActiveTab} items={tabConfig} />

      {/* Tab Content */}
      <RAGTabPanels
        activeTab={props.activeTab}
        ragState={props.ragState}
        onFileModalOpen={props.onFileModalOpen}
        onImageModalOpen={props.onImageModalOpen}
        on3DModalOpen={props.on3DModalOpen}
      />
    </div>
  );
}
