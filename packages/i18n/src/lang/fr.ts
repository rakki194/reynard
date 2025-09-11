/**
 * FR translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./fr/common";
import { themeTranslations } from "./fr/themes";
import { coreTranslations } from "./fr/core";
import { componentTranslations } from "./fr/components";
import { galleryTranslations } from "./fr/gallery";
import { chartTranslations } from "./fr/charts";
import { authTranslations } from "./fr/auth";
import { chatTranslations } from "./fr/chat";
import { monacoTranslations } from "./fr/monaco";

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
