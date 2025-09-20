/**
 * DataTable Row Component
 * Handles individual row rendering and selection
 */

import { Component, For, Show } from "solid-js";
import { Column } from "./DataTable.types";
import { getCellValue } from "./DataTable.utils";

export interface DataTableRowProps<T = unknown> {
  row: T;
  index: number;
  columns: Column<T>[];
  selectable: boolean;
  selected: boolean;
  onRowSelect: (index: number, selected: boolean) => void;
  onRowClick?: (row: T, index: number) => void;
}

export const DataTableRow: Component<DataTableRowProps> = props => {
  const visibleColumns = () => props.columns.filter(col => col.visible !== false);

  return (
    <tr
      class="reynard-data-table__row"
      onClick={() => props.onRowClick?.(props.row, props.index)}
      data-selected={props.selected}
    >
      {/* Select column */}
      <Show when={props.selectable}>
        <td class="reynard-data-table__cell reynard-data-table__cell--select">
          <input
            type="checkbox"
            checked={props.selected}
            onChange={e => props.onRowSelect(props.index, e.currentTarget.checked)}
            aria-label={`Select row ${props.index + 1}`}
          />
        </td>
      </Show>

      {/* Data columns */}
      <For each={visibleColumns()}>
        {column => (
          <td class={`reynard-data-table__cell reynard-data-table__cell--align-${column.align || "left"}`}>
            <Show when={column.cell} fallback={<span>{String(getCellValue(props.row, column) ?? "")}</span>}>
              {column.cell!(getCellValue(props.row, column), props.row, props.index)}
            </Show>
          </td>
        )}
      </For>
    </tr>
  );
};
