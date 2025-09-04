/**
 * Setting Control Component
 * Dynamic form control based on setting type
 */
import { Component } from "solid-js";
import type { SettingDefinition } from "../types";
export interface SettingControlProps {
  /** Setting definition */
  definition: SettingDefinition;
  /** Current value */
  value: any;
  /** Change handler */
  onChange: (value: any) => void;
  /** Validation error */
  error?: string;
  /** Whether control is disabled */
  disabled?: boolean;
  /** Custom class name */
  class?: string;
}
export declare const SettingControl: Component<SettingControlProps>;
