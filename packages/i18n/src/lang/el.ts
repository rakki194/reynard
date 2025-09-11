/**
 * EL translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./el/common";
import { themeTranslations } from "./el/themes";
import { coreTranslations } from "./el/core";
import { componentTranslations } from "./el/components";
import { galleryTranslations } from "./el/gallery";
import { chartTranslations } from "./el/charts";
import { authTranslations } from "./el/auth";
import { chatTranslations } from "./el/chat";
import { monacoTranslations } from "./el/monaco";

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
