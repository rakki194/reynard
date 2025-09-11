/**
 * JA translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./ja/common";
import { themeTranslations } from "./ja/themes";
import { coreTranslations } from "./ja/core";
import { componentTranslations } from "./ja/components";
import { galleryTranslations } from "./ja/gallery";
import { chartTranslations } from "./ja/charts";
import { authTranslations } from "./ja/auth";
import { chatTranslations } from "./ja/chat";
import { monacoTranslations } from "./ja/monaco";

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
