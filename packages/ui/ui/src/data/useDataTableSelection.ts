/**
 * DataTable Row Selection Composable
 * Handles row selection state and logic for the DataTable component
 */

import { createSignal, Setter } from "solid-js";

export interface DataTableSelection<T = unknown> {
  selectedRows: () => Set<number>;
  setSelectedRows: Setter<Set<number>>;
  handleRowSelect: (index: number, selected: boolean) => void;
  handleSelectAll: (selected: boolean) => void;
}

export const useDataTableSelection = <T = unknown>(
  data: T[],
  onRowSelect?: (selectedRows: T[]) => void
): DataTableSelection<T> => {
  const [selectedRows, setSelectedRows] = createSignal<Set<number>>(new Set());

  const handleRowSelect = (index: number, selected: boolean) => {
    const newSelected = new Set(selectedRows());
    if (selected) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);

    const selectedData = Array.from(newSelected).map(i => data[i]);
    onRowSelect?.(selectedData);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIndices = new Set(data.map((_, i) => i));
      setSelectedRows(allIndices);
      onRowSelect?.(data);
    } else {
      setSelectedRows(new Set<number>());
      onRowSelect?.([]);
    }
  };

  return {
    selectedRows,
    setSelectedRows,
    handleRowSelect,
    handleSelectAll,
  };
};
