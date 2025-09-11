/**
 * HI translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./hi/common";
import { themeTranslations } from "./hi/themes";
import { coreTranslations } from "./hi/core";
import { componentTranslations } from "./hi/components";
import { galleryTranslations } from "./hi/gallery";
import { chartTranslations } from "./hi/charts";
import { authTranslations } from "./hi/auth";
import { chatTranslations } from "./hi/chat";
import { monacoTranslations } from "./hi/monaco";

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
