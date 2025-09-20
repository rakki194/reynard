/**
 * Search History Header Component
 *
 * Header section with title and clear action.
 */
import { Button } from "reynard-components-core";
import { getIcon } from "../utils/searchHistoryUtils";
export const SearchHistoryHeader = props => {
    return (<div class="history-header">
      <h3>Search History</h3>
      <div class="history-actions">
        <Button variant="secondary" size="sm" onClick={props.onClearHistory} leftIcon={getIcon("delete")}>
          Clear All
        </Button>
      </div>
    </div>);
};
