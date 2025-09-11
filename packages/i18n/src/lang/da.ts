/**
 * DA translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./da/common";
import { themeTranslations } from "./da/themes";
import { coreTranslations } from "./da/core";
import { componentTranslations } from "./da/components";
import { galleryTranslations } from "./da/gallery";
import { chartTranslations } from "./da/charts";
import { authTranslations } from "./da/auth";
import { chatTranslations } from "./da/chat";
import { monacoTranslations } from "./da/monaco";

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
