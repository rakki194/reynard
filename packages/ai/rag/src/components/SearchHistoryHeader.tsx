/**
 * Search History Header Component
 *
 * Header section with title and clear action.
 */
import { Button, Icon } from "reynard-primitives";
export const SearchHistoryHeader = (props: any) => {
  return (
    <div class="history-header">
      <h3>Search History</h3>
      <div class="history-actions">
        <Button variant="secondary" size="sm" onClick={props.onClearHistory} leftIcon={<Icon name="delete" />}>
          Clear All
        </Button>
      </div>
    </div>
  );
};
