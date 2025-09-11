/**
 * AR translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./ar/common";
import { themeTranslations } from "./ar/themes";
import { coreTranslations } from "./ar/core";
import { componentTranslations } from "./ar/components";
import { galleryTranslations } from "./ar/gallery";
import { chartTranslations } from "./ar/charts";
import { authTranslations } from "./ar/auth";
import { chatTranslations } from "./ar/chat";
import { monacoTranslations } from "./ar/monaco";

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
