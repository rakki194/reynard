/**
 * useI18n composable - provides access to internationalization functionality
 */

import { createContext, useContext } from 'solid-js';
import type { I18nModule } from '../modules/i18n';

const I18nContext = createContext<I18nModule>();

export const I18nProvider = I18nContext.Provider;

export const useI18n = (): I18nModule => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
