/**
 * SK translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./sk/common";
import { themeTranslations } from "./sk/themes";
import { coreTranslations } from "./sk/core";
import { componentTranslations } from "./sk/components";
import { galleryTranslations } from "./sk/gallery";
import { chartTranslations } from "./sk/charts";
import { authTranslations } from "./sk/auth";
import { chatTranslations } from "./sk/chat";
import { monacoTranslations } from "./sk/monaco";

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
