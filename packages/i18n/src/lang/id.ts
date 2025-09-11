/**
 * ID translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./id/common";
import { themeTranslations } from "./id/themes";
import { coreTranslations } from "./id/core";
import { componentTranslations } from "./id/components";
import { galleryTranslations } from "./id/gallery";
import { chartTranslations } from "./id/charts";
import { authTranslations } from "./id/auth";
import { chatTranslations } from "./id/chat";
import { monacoTranslations } from "./id/monaco";

export default {
  common: commonTranslations,
  themes: themeTranslations,
  core: coreTranslations,
  components: componentTranslations,
  gallery: galleryTranslations,
  charts: chartTranslations,
  auth: authTranslations,
  chat: chatTranslations,
  monaco: monacoTranslations,
} as const satisfies Translations;
