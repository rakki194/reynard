/**
 * Combined Intl Formatter
 * Combines number, date, and relative time formatters
 */

import type { IntlConfig } from "./IntlConfig";
import { createNumberFormatter } from "./NumberFormatting";
import { createDateFormatter } from "./DateFormatting";
import { createRelativeFormatter } from "./RelativeFormatting";
import type { IntlFormatter } from "../types";

export function createIntlFormatter(config: IntlConfig): IntlFormatter {
  const relativeFormatter = createRelativeFormatter(config);

  return {
    number: createNumberFormatter(config),
    date: createDateFormatter(config),
    relative: relativeFormatter,
    relativeTime: {
      formatSmart: relativeFormatter.formatFromNow,
    },
    pluralRules: {
      select: (count: number) => {
        const formatter = new Intl.PluralRules(config.locale);
        return formatter.select(count);
      },
    },
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
