/**
 * Search History Empty State Component
 *
 * Empty state display when no search history is found.
 */
import { Show } from "solid-js";
import { getIcon } from "../utils/searchHistoryUtils";
export const SearchHistoryEmpty = (props) => {
    return (<div class="history-empty">
      <div class="empty-icon">{getIcon("history")}</div>
      <p>No search history found</p>
      <Show when={props.hasFilters}>
        <p>Try adjusting your filters</p>
      </Show>
    </div>);
};
