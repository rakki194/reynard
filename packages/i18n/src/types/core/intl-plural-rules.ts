/**
 * IntlPluralRules class for plural rules
 */

import type { IntlConfig } from "../../intl/IntlConfig";

export class IntlPluralRules {
  constructor(private config: IntlConfig) {}

  select(value: number): Intl.LDMLPluralRule {
    const rules = new Intl.PluralRules(this.config.locale);
    return rules.select(value);
  }

  resolvedOptions(): Intl.ResolvedPluralRulesOptions {
    const rules = new Intl.PluralRules(this.config.locale);
    return rules.resolvedOptions();
  }
}
