/**
 * Data Table Component
 * Feature-rich table with sorting, filtering, pagination, and selection
 */

import {
  Component,
  JSX,
  For,
  Show,
  createSignal,
  createMemo,
  splitProps,
} from "solid-js";
import { formatNumber, pluralize } from "@reynard/core";

export interface Column<T = any> {
  /** Unique column identifier */
  id: string;
  /** Column header text */
  header: string | JSX.Element;
  /** Data accessor function or property key */
  accessor: keyof T | ((row: T) => any);
  /** Custom cell renderer */
  cell?: (value: any, row: T, index: number) => JSX.Element;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Column width */
  width?: string | number;
  /** Column alignment */
  align?: "left" | "center" | "right";
  /** Whether column can be hidden */
  hideable?: boolean;
  /** Whether column is initially visible */
  visible?: boolean;
}

export interface DataTableProps<T = any> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Whether to show select all checkbox */
  selectAll?: boolean;
  /** Current page (1-based) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Whether to show page size selector */
  showPageSizeSelector?: boolean;
  /** Available page sizes */
  pageSizes?: number[];
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom class name */
  class?: string;
  /** Row selection handler */
  onRowSelect?: (selectedRows: T[]) => void;
  /** Sort change handler */
  onSort?: (column: string, direction: "asc" | "desc" | null) => void;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
}

type SortDirection = "asc" | "desc" | null;

const defaultProps = {
  selectable: false,
  selectAll: true,
  page: 1,
  pageSize: 10,
  showPagination: true,
  showPageSizeSelector: true,
  pageSizes: [5, 10, 25, 50, 100],
  loading: false,
  emptyMessage: "No data available",
};

export const DataTable: Component<DataTableProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "data",
    "columns",
    "selectable",
    "selectAll",
    "page",
    "pageSize",
    "showPagination",
    "showPageSizeSelector",
    "pageSizes",
    "loading",
    "emptyMessage",
    "class",
    "onRowSelect",
    "onSort",
    "onPageChange",
    "onPageSizeChange",
    "onRowClick",
  ]);

  const [selectedRows, setSelectedRows] = createSignal<Set<number>>(new Set());
  const [sortColumn, setSortColumn] = createSignal<string | null>(null);
  const [sortDirection, setSortDirection] = createSignal<SortDirection>(null);
  const [visibleColumns, setVisibleColumns] = createSignal<Set<string>>(
    new Set(local.columns.filter(col => col.visible !== false).map(col => col.id))
  );

  // Get visible columns
  const displayColumns = createMemo(() =>
    local.columns.filter(col => visibleColumns().has(col.id))
  );

  // Sort data
  const sortedData = createMemo(() => {
    if (!sortColumn() || !sortDirection()) return local.data;

    const column = local.columns.find(col => col.id === sortColumn());
    if (!column) return local.data;

    return [...local.data].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (typeof column.accessor === "function") {
        aVal = column.accessor(a);
        bVal = column.accessor(b);
      } else {
        aVal = a[column.accessor];
        bVal = b[column.accessor];
      }

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection() === "asc" ? -1 : 1;
      if (bVal == null) return sortDirection() === "asc" ? 1 : -1;

      // Convert to strings for comparison if needed
      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection() === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection() === "asc" ? 1 : -1;
      return 0;
    });
  });

  // Paginate data
  const paginatedData = createMemo(() => {
    if (!local.showPagination) return sortedData();
    
    const start = (local.page - 1) * local.pageSize;
    const end = start + local.pageSize;
    return sortedData().slice(start, end);
  });

  // Calculate pagination info
  const totalPages = createMemo(() => Math.ceil(sortedData().length / local.pageSize));
  const hasNextPage = createMemo(() => local.page < totalPages());
  const hasPrevPage = createMemo(() => local.page > 1);

  const handleSort = (column: Column) => {
    if (!column.sortable) return;

    const currentDirection = sortColumn() === column.id ? sortDirection() : null;
    let newDirection: SortDirection;

    if (currentDirection === null) {
      newDirection = "asc";
    } else if (currentDirection === "asc") {
      newDirection = "desc";
    } else {
      newDirection = null;
    }

    setSortColumn(newDirection ? column.id : null);
    setSortDirection(newDirection);
    local.onSort?.(column.id, newDirection);
  };

  const handleRowSelect = (index: number, selected: boolean) => {
    const newSelected = new Set(selectedRows());
    if (selected) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);

    const selectedData = Array.from(newSelected).map(i => local.data[i]);
    local.onRowSelect?.(selectedData);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIndices = new Set(local.data.map((_, i) => i));
      setSelectedRows(allIndices);
      local.onRowSelect?.(local.data);
    } else {
      setSelectedRows(new Set<number>());
      local.onRowSelect?.([]);
    }
  };

  const getCellValue = (row: any, column: Column) => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  const getTableClasses = () => {
    const classes = ["reynard-data-table"];
    if (local.loading) classes.push("reynard-data-table--loading");
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const getSortIcon = (column: Column) => {
    if (!column.sortable) return null;
    
    const isActive = sortColumn() === column.id;
    const direction = isActive ? sortDirection() : null;

    return (
      <span class="reynard-data-table__sort-icon">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          style={{
            opacity: isActive ? 1 : 0.3,
            transform: direction === "desc" ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M6 1l4 4H8v5H4V5H2z" />
        </svg>
      </span>
    );
  };

  return (
    <div class={getTableClasses()} {...others}>
      {/* Table */}
      <div class="reynard-data-table__wrapper">
        <table class="reynard-data-table__table">
          <thead class="reynard-data-table__header">
            <tr>
              {/* Select all column */}
              <Show when={local.selectable && local.selectAll}>
                <th class="reynard-data-table__cell reynard-data-table__cell--select">
                  <input
                    type="checkbox"
                    checked={selectedRows().size === local.data.length && local.data.length > 0}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = selectedRows().size > 0 && selectedRows().size < local.data.length;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                    aria-label="Select all rows"
                  />
                </th>
              </Show>

              {/* Column headers */}
              <For each={displayColumns()}>
                {(column) => (
                  <th
                    class={`reynard-data-table__cell reynard-data-table__cell--header reynard-data-table__cell--align-${column.align || "left"}`}
                    style={{ width: typeof column.width === "number" ? `${column.width}px` : column.width }}
                    onClick={() => handleSort(column)}
                    role={column.sortable ? "button" : undefined}
                    tabindex={column.sortable ? 0 : undefined}
                    aria-sort={
                      sortColumn() === column.id
                        ? sortDirection() === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    <div class="reynard-data-table__header-content">
                      <span>{column.header}</span>
                      {getSortIcon(column)}
                    </div>
                  </th>
                )}
              </For>
            </tr>
          </thead>

          <tbody class="reynard-data-table__body">
            <Show
              when={!local.loading && paginatedData().length > 0}
              fallback={
                <tr>
                  <td
                    class="reynard-data-table__cell reynard-data-table__cell--empty"
                    colspan={displayColumns().length + (local.selectable ? 1 : 0)}
                  >
                    <Show when={local.loading} fallback={local.emptyMessage}>
                      <div class="reynard-data-table__loading">
                        <span>Loading...</span>
                      </div>
                    </Show>
                  </td>
                </tr>
              }
            >
              <For each={paginatedData()}>
                {(row, index) => (
                  <tr
                    class="reynard-data-table__row"
                    onClick={() => local.onRowClick?.(row, index())}
                    data-selected={selectedRows().has(index())}
                  >
                    {/* Select column */}
                    <Show when={local.selectable}>
                      <td class="reynard-data-table__cell reynard-data-table__cell--select">
                        <input
                          type="checkbox"
                          checked={selectedRows().has(index())}
                          onChange={(e) => handleRowSelect(index(), e.currentTarget.checked)}
                          aria-label={`Select row ${index() + 1}`}
                        />
                      </td>
                    </Show>

                    {/* Data columns */}
                    <For each={displayColumns()}>
                      {(column) => (
                        <td
                          class={`reynard-data-table__cell reynard-data-table__cell--align-${column.align || "left"}`}
                        >
                          <Show
                            when={column.cell}
                            fallback={getCellValue(row, column)}
                          >
                            {column.cell!(getCellValue(row, column), row, index())}
                          </Show>
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </Show>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Show when={local.showPagination && sortedData().length > 0}>
        <div class="reynard-data-table__pagination">
          <div class="reynard-data-table__pagination-info">
            <Show when={local.showPageSizeSelector}>
              <div class="reynard-data-table__page-size">
                <label for="page-size-select">Rows per page:</label>
                <select
                  id="page-size-select"
                  value={local.pageSize}
                  onChange={(e) => local.onPageSizeChange?.(parseInt(e.currentTarget.value))}
                >
                  <For each={local.pageSizes}>
                    {(size) => (
                      <option value={size}>{size}</option>
                    )}
                  </For>
                </select>
              </div>
            </Show>
            
            <span class="reynard-data-table__stats">
              {pluralize(sortedData().length, "row")} total
            </span>
          </div>

          <div class="reynard-data-table__pagination-controls">
            <button
              type="button"
              disabled={!hasPrevPage()}
              onClick={() => local.onPageChange?.(local.page - 1)}
              aria-label="Previous page"
            >
              Previous
            </button>
            
            <span class="reynard-data-table__page-info">
              Page {local.page} of {totalPages()}
            </span>
            
            <button
              type="button"
              disabled={!hasNextPage()}
              onClick={() => local.onPageChange?.(local.page + 1)}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};
