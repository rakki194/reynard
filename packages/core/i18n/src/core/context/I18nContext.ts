/**
 * I18n Context Management
 *
 * Handles context creation and provider setup for i18n functionality.
 */

import { createContext, useContext } from "solid-js";
import type { TranslationContext } from "../../types";

// Create i18n context
const I18nContext = createContext<TranslationContext>();

export const I18nProvider = I18nContext.Provider;

// Main i18n composable
export function useI18n(): TranslationContext {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
