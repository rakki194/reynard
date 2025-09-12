/**
 * Intl API Integration
 * Enhanced formatting capabilities inspired by solid-i18n
 */

export * from "./IntlConfig";
export * from "./NumberFormatting";
export * from "./DateFormatting";
export * from "./RelativeFormatting";

import type { IntlConfig } from "./IntlConfig";
import { createNumberFormatter } from "./NumberFormatting";
import { createDateFormatter } from "./DateFormatting";
import { createRelativeFormatter } from "./RelativeFormatting";

// Main Intl formatter factory
export function createIntlFormatter(config: IntlConfig) {
  return {
    number: createNumberFormatter(config),
    date: createDateFormatter(config),
    relative: createRelativeFormatter(config),
  };
}
