/**
 * CS translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./cs/common";
import { themeTranslations } from "./cs/themes";
import { coreTranslations } from "./cs/core";
import { componentTranslations } from "./cs/components";
import { galleryTranslations } from "./cs/gallery";
import { chartTranslations } from "./cs/charts";
import { authTranslations } from "./cs/auth";
import { chatTranslations } from "./cs/chat";
import { monacoTranslations } from "./cs/monaco";

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
