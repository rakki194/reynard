/**
 * i18n Debugging and Validation Tools
 * Enhanced developer experience with comprehensive debugging capabilities
 */

export * from "./DebugStats";
export * from "./Validation";
export * from "./DebugTranslation";

import type { I18nModule } from "../types";
import { createDebugTranslationFunction } from "./DebugTranslation";
import { createDebugStats } from "./DebugStats";
import { validateTranslations } from "./Validation";

// Create debug-enabled i18n module
export function createDebugI18nModule(
  baseModule: I18nModule,
  enableDebug: boolean = false,
): I18nModule {
  const debugT = createDebugTranslationFunction(
    baseModule.getCurrentTranslations,
    baseModule.getCurrentLocale,
    enableDebug,
  );

  return {
    ...baseModule,
    t: debugT,
    getDebugStats: createDebugStats,
    validateTranslations: (requiredKeys: string[]) =>
      validateTranslations(baseModule.getCurrentTranslations(), requiredKeys),
  };
}
