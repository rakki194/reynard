/**
 * Search History Item Component
 *
 * Individual search history item display component.
 */
import { Button, Card, Badge, Icon } from "reynard-components-core";
import {
  formatTimestamp,
  getModalityIcon,
  getModalityColor,
  getScoreColor,
} from "../utils/searchHistoryUtils";
export const SearchHistoryItem = (props: any) => {
  return (
    <Card class="history-item">
      <div class="item-header">
        <div class="item-query">
          <span class="query-text">{props.item.query}</span>
          <Badge variant="secondary">
            {getModalityIcon(props.item.modality)}
            {props.item.modality}
          </Badge>
        </div>

        <div class="item-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.onSearchAgain(props.item.query, props.item.modality)}
            leftIcon={<Icon name="search" />}
          >
            Search Again
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => props.onRemoveItem(props.item.id)}
            leftIcon={<Icon name="delete" />}
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
          <Badge variant="secondary">{(props.item.topScore * 100).toFixed(1)}%</Badge>
        </div>
      </div>
    </Card>
  );
};
