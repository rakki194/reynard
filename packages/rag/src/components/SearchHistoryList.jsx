/**
 * Search History List Component
 *
 * List section with items and empty state.
 */
import { For, Show } from "solid-js";
import { SearchHistoryItem as HistoryItem } from "./SearchHistoryItem";
import { SearchHistoryEmpty } from "./SearchHistoryEmpty";
export const SearchHistoryList = props => {
    return (<div class="history-list">
      <Show when={props.filteredHistory.length > 0} fallback={<SearchHistoryEmpty hasFilters={props.searchQuery !== "" || props.selectedModality !== "all"}/>}>
        <For each={props.filteredHistory}>
          {item => <HistoryItem item={item} onSearchAgain={props.onSearchAgain} onRemoveItem={props.onRemoveItem}/>}
        </For>
      </Show>
    </div>);
};
