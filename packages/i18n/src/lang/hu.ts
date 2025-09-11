/**
 * HU translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./hu/common";
import { themeTranslations } from "./hu/themes";
import { coreTranslations } from "./hu/core";
import { componentTranslations } from "./hu/components";
import { galleryTranslations } from "./hu/gallery";
import { chartTranslations } from "./hu/charts";
import { authTranslations } from "./hu/auth";
import { chatTranslations } from "./hu/chat";
import { monacoTranslations } from "./hu/monaco";

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
