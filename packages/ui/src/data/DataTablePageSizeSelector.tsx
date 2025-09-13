/**
 * DataTable Page Size Selector Component
 * Handles page size selection dropdown
 */

import { Component, For } from "solid-js";

export interface DataTablePageSizeSelectorProps {
  pageSize: number;
  pageSizes: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

export const DataTablePageSizeSelector: Component<
  DataTablePageSizeSelectorProps
> = (props) => {
  return (
    <div class="reynard-data-table__page-size">
      <label for="page-size-select">Rows per page:</label>
      <select
        id="page-size-select"
        value={props.pageSize}
        onChange={(e) =>
          props.onPageSizeChange?.(parseInt(e.currentTarget.value))
        }
      >
        <For each={props.pageSizes}>
          {(size) => <option value={size}>{size}</option>}
        </For>
      </select>
    </div>
  );
};
