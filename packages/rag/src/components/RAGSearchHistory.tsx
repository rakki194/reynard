/**
 * RAG Search History Component
 * 
 * Component for displaying and managing search history
 * with filtering and quick re-search capabilities.
 */

import { Component, createSignal, createMemo, For, Show } from 'solid-js';
import { Button, TextField, Select, Card, Badge } from 'reynard-components';
import { getIcon as getIconFromRegistry } from 'reynard-fluent-icons';
import type { SearchHistoryItem, RAGModality } from '../types';

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    return <div innerHTML={icon as unknown as string} />;
  }
  return null;
};

export interface RAGSearchHistoryProps {
  searchHistory: SearchHistoryItem[];
  onSearchAgain: (query: string, modality: RAGModality) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  maxItems?: number;
  showFilters?: boolean;
}

export const RAGSearchHistory: Component<RAGSearchHistoryProps> = (props) => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedModality, setSelectedModality] = createSignal<RAGModality | 'all'>('all');
  const [sortBy, setSortBy] = createSignal<'timestamp' | 'resultCount' | 'topScore'>('timestamp');
  const [sortOrder, setSortOrder] = createSignal<'asc' | 'desc'>('desc');

  // Filter and sort search history
  const filteredHistory = createMemo(() => {
    let filtered = props.searchHistory.filter(item => {
      const matchesQuery = !searchQuery() || 
        item.query.toLowerCase().includes(searchQuery().toLowerCase());
      const matchesModality = selectedModality() === 'all' || 
        item.modality === selectedModality();
      
      return matchesQuery && matchesModality;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy()) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'resultCount':
          comparison = a.resultCount - b.resultCount;
          break;
        case 'topScore':
          comparison = a.topScore - b.topScore;
          break;
      }
      
      return sortOrder() === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const getModalityIcon = (modality: RAGModality) => {
    const iconMap: Record<RAGModality, string> = {
      docs: 'document',
      images: 'image',
      code: 'code',
      captions: 'text',
    };
    return getIcon(iconMap[modality]);
  };

  const getModalityColor = (modality: RAGModality): string => {
    const colorMap: Record<RAGModality, string> = {
      docs: 'blue',
      images: 'green',
      code: 'purple',
      captions: 'orange',
    };
    return colorMap[modality];
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <div class="rag-search-history">
      {/* Header */}
      <div class="history-header">
        <h3>Search History</h3>
        <div class="history-actions">
          <Button
            variant="secondary"
            size="small"
            onClick={props.onClearHistory}
            icon={getIcon('delete')}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Show when={props.showFilters}>
        <div class="history-filters">
          <TextField
            placeholder="Search history..."
            value={searchQuery()}
            onChange={(value) => setSearchQuery(value)}
            icon={getIcon('search')}
            size="small"
          />
          
          <Select
            value={selectedModality()}
            onChange={(value) => setSelectedModality(value as RAGModality | 'all')}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'docs', label: 'Documents' },
              { value: 'images', label: 'Images' },
              { value: 'code', label: 'Code' },
              { value: 'captions', label: 'Captions' },
            ]}
            size="small"
          />
          
          <Select
            value={sortBy()}
            onChange={(value) => setSortBy(value as 'timestamp' | 'resultCount' | 'topScore')}
            options={[
              { value: 'timestamp', label: 'Date' },
              { value: 'resultCount', label: 'Results' },
              { value: 'topScore', label: 'Score' },
            ]}
            size="small"
          />
          
          <Button
            variant="ghost"
            size="small"
            onClick={() => setSortOrder(sortOrder() === 'asc' ? 'desc' : 'asc')}
            icon={getIcon(sortOrder() === 'asc' ? 'arrow-up' : 'arrow-down')}
          >
            {sortOrder() === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>
      </Show>

      {/* History List */}
      <div class="history-list">
        <Show 
          when={filteredHistory().length > 0}
          fallback={
            <div class="history-empty">
              <div class="empty-icon">{getIcon('history')}</div>
              <p>No search history found</p>
              <Show when={searchQuery() || selectedModality() !== 'all'}>
                <p>Try adjusting your filters</p>
              </Show>
            </div>
          }
        >
          <For each={filteredHistory()}>
            {(item) => (
              <Card className="history-item">
                <div class="item-header">
                  <div class="item-query">
                    <span class="query-text">{item.query}</span>
                    <Badge variant={getModalityColor(item.modality)}>
                      {getModalityIcon(item.modality)}
                      {item.modality}
                    </Badge>
                  </div>
                  
                  <div class="item-actions">
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => props.onSearchAgain(item.query, item.modality)}
                      icon={getIcon('search')}
                    >
                      Search Again
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => props.onRemoveItem(item.id)}
                      icon={getIcon('delete')}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                
                <div class="item-meta">
                  <div class="meta-item">
                    <span class="meta-label">Time:</span>
                    <span class="meta-value">{formatTimestamp(item.timestamp)}</span>
                  </div>
                  
                  <div class="meta-item">
                    <span class="meta-label">Results:</span>
                    <span class="meta-value">{item.resultCount}</span>
                  </div>
                  
                  <div class="meta-item">
                    <span class="meta-label">Top Score:</span>
                    <Badge variant={getScoreColor(item.topScore)}>
                      {(item.topScore * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </Card>
            )}
          </For>
        </Show>
      </div>

      {/* Footer */}
      <div class="history-footer">
        <div class="history-stats">
          Showing {filteredHistory().length} of {props.searchHistory.length} items
        </div>
        
        <Show when={props.maxItems && props.searchHistory.length > props.maxItems}>
          <div class="history-limit">
            Limited to {props.maxItems} most recent items
          </div>
        </Show>
      </div>
    </div>
  );
};
