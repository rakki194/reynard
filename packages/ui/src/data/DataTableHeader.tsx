/**
 * DataTable Header Component
 * Handles column headers, sorting, and select all functionality
 */

import { Component, For, Show } from "solid-js";
import { Column, SortDirection } from "./DataTable.types";
import { getSortIcon } from "./DataTable.utils";

// Select All Checkbox Component
interface SelectAllCheckboxProps {
  selectedRows: Set<number>;
  dataLength: number;
  onSelectAll: (selected: boolean) => void;
}

const SelectAllCheckbox: Component<SelectAllCheckboxProps> = (props) => (
  <th class="reynard-data-table__cell reynard-data-table__cell--select">
    <input
      type="checkbox"
      checked={
        props.selectedRows.size === props.dataLength && props.dataLength > 0
      }
      ref={(el) => {
        if (el) {
          el.indeterminate =
            props.selectedRows.size > 0 &&
            props.selectedRows.size < props.dataLength;
        }
      }}
      onChange={(e) => props.onSelectAll(e.currentTarget.checked)}
      aria-label="Select all rows"
    />
  </th>
);

// Column Header Component
interface ColumnHeaderProps<T = unknown> {
  column: Column<T>;
  sortColumn: string | null;
  sortDirection: SortDirection;
  onSort: (column: Column<T>) => void;
}

const ColumnHeader: Component<ColumnHeaderProps> = (props) => (
  <Show
    when={props.column.sortable}
    fallback={
      <th
        class={`reynard-data-table__cell reynard-data-table__cell--header reynard-data-table__cell--align-${props.column.align || "left"}`}
        data-width={props.column.width}
      >
        <div class="reynard-data-table__header-content">
          <span>{props.column.header}</span>
          {getSortIcon(props.column, props.sortColumn, props.sortDirection)}
        </div>
      </th>
    }
  >
    <th
      class={`reynard-data-table__cell reynard-data-table__cell--header reynard-data-table__cell--align-${props.column.align || "left"}`}
      data-width={props.column.width}
      onClick={() => props.onSort(props.column)}
      role="button"
      tabindex="0"
    >
      <div class="reynard-data-table__header-content">
        <span>{props.column.header}</span>
        {getSortIcon(props.column, props.sortColumn, props.sortDirection)}
      </div>
    </th>
  </Show>
);

export interface DataTableHeaderProps<T = unknown> {
  columns: Column<T>[];
  selectable: boolean;
  selectAll: boolean;
  selectedRows: Set<number>;
  dataLength: number;
  sortColumn: string | null;
  sortDirection: SortDirection;
  onSort: (column: Column<T>) => void;
  onSelectAll: (selected: boolean) => void;
}

export const DataTableHeader: Component<DataTableHeaderProps> = (props) => {
  const visibleColumns = () =>
    props.columns.filter((col) => col.visible !== false);

  return (
    <thead class="reynard-data-table__header">
      <tr>
        {/* Select all column */}
        <Show when={props.selectable && props.selectAll}>
          <SelectAllCheckbox
            selectedRows={props.selectedRows}
            dataLength={props.dataLength}
            onSelectAll={props.onSelectAll}
          />
        </Show>

        {/* Column headers */}
        <For each={visibleColumns()}>
          {(column) => (
            <ColumnHeader
              column={column}
              sortColumn={props.sortColumn}
              sortDirection={props.sortDirection}
              onSort={props.onSort}
            />
          )}
        </For>
      </tr>
    </thead>
  );
};
