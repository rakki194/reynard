/**
 * DE translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./de/common";
import { themeTranslations } from "./de/themes";
import { coreTranslations } from "./de/core";
import { componentTranslations } from "./de/components";
import { galleryTranslations } from "./de/gallery";
import { chartTranslations } from "./de/charts";
import { authTranslations } from "./de/auth";
import { chatTranslations } from "./de/chat";
import { monacoTranslations } from "./de/monaco";

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
