/**
 * SL translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./sl/common";
import { themeTranslations } from "./sl/themes";
import { coreTranslations } from "./sl/core";
import { componentTranslations } from "./sl/components";
import { galleryTranslations } from "./sl/gallery";
import { chartTranslations } from "./sl/charts";
import { authTranslations } from "./sl/auth";
import { chatTranslations } from "./sl/chat";
import { monacoTranslations } from "./sl/monaco";

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
