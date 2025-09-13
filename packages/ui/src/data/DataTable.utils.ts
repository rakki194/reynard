/**
 * DataTable Utility Functions
 * Helper functions for prop handling and data processing
 */

import { splitProps } from "solid-js";
import { DataTableProps } from "./DataTable.types";
import { getDataTableDefaults, DATA_TABLE_PROP_KEYS } from "./DataTable.defaults";

/**
 * Merges default props with provided props
 */
export const mergeDataTableProps = <T = unknown>(
  props: DataTableProps<T>
): DataTableProps<T> => {
  const defaults = getDataTableDefaults<T>();
  return { ...defaults, ...props };
};

/**
 * Splits props into local and others based on DataTable prop keys
 */
export const splitDataTableProps = <T = unknown>(
  props: DataTableProps<T>
): [DataTableProps<T>, Record<string, unknown>] => {
  return splitProps(props, DATA_TABLE_PROP_KEYS);
};
