/**
 * FI translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./fi/common";
import { themeTranslations } from "./fi/themes";
import { coreTranslations } from "./fi/core";
import { componentTranslations } from "./fi/components";
import { galleryTranslations } from "./fi/gallery";
import { chartTranslations } from "./fi/charts";
import { authTranslations } from "./fi/auth";
import { chatTranslations } from "./fi/chat";
import { monacoTranslations } from "./fi/monaco";

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
