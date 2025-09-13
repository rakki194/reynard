/**
 * DataTable Pagination Component
 * Handles pagination controls and page size selection
 */

import { Component, Show } from "solid-js";
import { pluralize } from "reynard-core";
import { DataTablePageSizeSelector } from "./DataTablePageSizeSelector";
import { DataTablePaginationControls } from "./DataTablePaginationControls";

export interface DataTablePaginationProps {
  showPagination: boolean;
  showPageSizeSelector: boolean;
  page: number;
  pageSize: number;
  pageSizes: number[];
  totalItems: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const DataTablePagination: Component<DataTablePaginationProps> = (
  props,
) => {
  const totalPages = () => Math.ceil(props.totalItems / props.pageSize);

  return (
    <Show when={props.showPagination && props.totalItems > 0}>
      <div class="reynard-data-table__pagination">
        <div class="reynard-data-table__pagination-info">
          <Show when={props.showPageSizeSelector}>
            <DataTablePageSizeSelector
              pageSize={props.pageSize}
              pageSizes={props.pageSizes}
              onPageSizeChange={props.onPageSizeChange}
            />
          </Show>

          <span class="reynard-data-table__stats">
            {pluralize(props.totalItems, "row")} total
          </span>
        </div>

        <DataTablePaginationControls
          page={props.page}
          totalPages={totalPages()}
          onPageChange={props.onPageChange}
        />
      </div>
    </Show>
  );
};
