/**
 * Combined Intl Formatter
 * Combines number, date, and relative time formatters
 */

import type { IntlConfig } from "./IntlConfig";
import { IntlNumberFormatter } from "../types/core/intl-number-formatter";
import { IntlDateFormatter } from "../types/core/intl-date-formatter";
import { IntlRelativeTimeFormatter } from "../types/core/intl-relative-time-formatter";
import { IntlPluralRules } from "../types/core/intl-plural-rules";
import type { IntlFormatter } from "../types";

export function createIntlFormatter(config: IntlConfig): IntlFormatter {
  return {
    number: new IntlNumberFormatter(config),
    date: new IntlDateFormatter(config),
    relative: new IntlRelativeTimeFormatter(config),
    relativeTime: new IntlRelativeTimeFormatter(config),
    pluralRules: new IntlPluralRules(config),
    updateConfig: (newConfig: Partial<IntlConfig>) => {
      // Update the formatter with new config
      const updatedConfig = { ...config, ...newConfig };
      return createIntlFormatter(updatedConfig);
    },
    formatTranslation: (translation: string, params?: any) => {
      if (!params) return translation;
      let result = translation;
      Object.entries(params).forEach(([key, val]) => {
        result = result.replace(`{${key}}`, val?.toString() || "");
      });
      return result;
    },
  };
}
