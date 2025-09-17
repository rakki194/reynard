/**
 * Search History Item Component
 *
 * Individual search history item display component.
 */

import { Component } from "solid-js";
import { Button, Card, Badge } from "reynard-components";
import type { SearchHistoryItem, RAGModality } from "../types";
import {
  getIcon,
  formatTimestamp,
  getModalityIcon,
  getModalityColor,
  getScoreColor,
} from "../utils/searchHistoryUtils";

export interface SearchHistoryItemProps {
  item: SearchHistoryItem;
  onSearchAgain: (query: string, modality: RAGModality) => void;
  onRemoveItem: (id: string) => void;
}

export const SearchHistoryItem: Component<SearchHistoryItemProps> = props => {
  return (
    <Card className="history-item">
      <div class="item-header">
        <div class="item-query">
          <span class="query-text">{props.item.query}</span>
          <Badge variant={getModalityColor(props.item.modality)}>
            {getModalityIcon(props.item.modality)}
            {props.item.modality}
          </Badge>
        </div>

        <div class="item-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.onSearchAgain(props.item.query, props.item.modality)}
            leftIcon={getIcon("search")}
          >
            Search Again
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.onRemoveItem(props.item.id)}
            leftIcon={getIcon("delete")}
          >
            Remove
          </Button>
        </div>
      </div>

      <div class="item-meta">
        <div class="meta-item">
          <span class="meta-label">Time:</span>
          <span class="meta-value">{formatTimestamp(props.item.timestamp)}</span>
        </div>

        <div class="meta-item">
          <span class="meta-label">Results:</span>
          <span class="meta-value">{props.item.resultCount}</span>
        </div>

        <div class="meta-item">
          <span class="meta-label">Top Score:</span>
          <Badge variant={getScoreColor(props.item.topScore)}>{(props.item.topScore * 100).toFixed(1)}%</Badge>
        </div>
      </div>
    </Card>
  );
};
