/**
 * DataTable Pagination Controls Component
 * Handles previous/next navigation and page display
 */

import { Component } from "solid-js";

export interface DataTablePaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export const DataTablePaginationControls: Component<DataTablePaginationControlsProps> = (props) => {
  const hasNextPage = () => props.page < props.totalPages;
  const hasPrevPage = () => props.page > 1;

  return (
    <div class="reynard-data-table__pagination-controls">
      <button
        type="button"
        disabled={!hasPrevPage()}
        onClick={() => props.onPageChange?.(props.page - 1)}
        aria-label="Previous page"
      >
        Previous
      </button>

      <span class="reynard-data-table__page-info">
        Page {props.page} of {props.totalPages}
      </span>

      <button
        type="button"
        disabled={!hasNextPage()}
        onClick={() => props.onPageChange?.(props.page + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};
