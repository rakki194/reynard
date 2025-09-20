/**
 * DataTable Empty State Component
 * Handles empty and loading state rendering
 */

import { Component, Show } from "solid-js";

export interface DataTableEmptyStateProps {
  loading: boolean;
  emptyMessage: string;
  columnCount: number;
}

export const DataTableEmptyState: Component<DataTableEmptyStateProps> = props => {
  return (
    <tr>
      <td class="reynard-data-table__cell reynard-data-table__cell--empty" colspan={props.columnCount}>
        <Show when={props.loading} fallback={props.emptyMessage}>
          <div class="reynard-data-table__loading">
            <span>Loading...</span>
          </div>
        </Show>
      </td>
    </tr>
  );
};
