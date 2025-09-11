/**
 * ET translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./et/common";
import { themeTranslations } from "./et/themes";
import { coreTranslations } from "./et/core";
import { componentTranslations } from "./et/components";
import { galleryTranslations } from "./et/gallery";
import { chartTranslations } from "./et/charts";
import { authTranslations } from "./et/auth";
import { chatTranslations } from "./et/chat";
import { monacoTranslations } from "./et/monaco";

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
