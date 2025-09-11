/**
 * NL translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./nl/common";
import { themeTranslations } from "./nl/themes";
import { coreTranslations } from "./nl/core";
import { componentTranslations } from "./nl/components";
import { galleryTranslations } from "./nl/gallery";
import { chartTranslations } from "./nl/charts";
import { authTranslations } from "./nl/auth";
import { chatTranslations } from "./nl/chat";
import { monacoTranslations } from "./nl/monaco";

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
