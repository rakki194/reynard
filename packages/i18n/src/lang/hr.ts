/**
 * HR translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./hr/common";
import { themeTranslations } from "./hr/themes";
import { coreTranslations } from "./hr/core";
import { componentTranslations } from "./hr/components";
import { galleryTranslations } from "./hr/gallery";
import { chartTranslations } from "./hr/charts";
import { authTranslations } from "./hr/auth";
import { chatTranslations } from "./hr/chat";
import { monacoTranslations } from "./hr/monaco";

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
