/**
 * IT translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./it/common";
import { themeTranslations } from "./it/themes";
import { coreTranslations } from "./it/core";
import { componentTranslations } from "./it/components";
import { galleryTranslations } from "./it/gallery";
import { chartTranslations } from "./it/charts";
import { authTranslations } from "./it/auth";
import { chatTranslations } from "./it/chat";
import { monacoTranslations } from "./it/monaco";

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
