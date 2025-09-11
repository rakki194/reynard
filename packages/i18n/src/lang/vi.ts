/**
 * VI translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./vi/common";
import { themeTranslations } from "./vi/themes";
import { coreTranslations } from "./vi/core";
import { componentTranslations } from "./vi/components";
import { galleryTranslations } from "./vi/gallery";
import { chartTranslations } from "./vi/charts";
import { authTranslations } from "./vi/auth";
import { chatTranslations } from "./vi/chat";
import { monacoTranslations } from "./vi/monaco";

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
