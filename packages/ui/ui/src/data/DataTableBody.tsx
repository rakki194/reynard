/**
 * DataTable Body Component
 * Handles table body rendering, row selection, and data display
 */

import { Component, For, Show } from "solid-js";
import { Column } from "./DataTable.types";
import { DataTableRow } from "./DataTableRow";
import { DataTableEmptyState } from "./DataTableEmptyState";

export interface DataTableBodyProps<T = unknown> {
  data: T[];
  columns: Column<T>[];
  selectable: boolean;
  loading: boolean;
  emptyMessage: string;
  selectedRows: Set<number>;
  onRowSelect: (index: number, selected: boolean) => void;
  onRowClick?: (row: T, index: number) => void;
}

export const DataTableBody: Component<DataTableBodyProps> = props => {
  const visibleColumns = () => props.columns.filter(col => col.visible !== false);

  const columnCount = () => visibleColumns().length + (props.selectable ? 1 : 0);

  return (
    <tbody class="reynard-data-table__body">
      <Show
        when={!props.loading && props.data.length > 0}
        fallback={
          <DataTableEmptyState loading={props.loading} emptyMessage={props.emptyMessage} columnCount={columnCount()} />
        }
      >
        <For each={props.data}>
          {(row, index) => (
            <DataTableRow
              row={row}
              index={index()}
              columns={props.columns}
              selectable={props.selectable}
              selected={props.selectedRows.has(index())}
              onRowSelect={props.onRowSelect}
              onRowClick={props.onRowClick}
            />
          )}
        </For>
      </Show>
    </tbody>
  );
};
