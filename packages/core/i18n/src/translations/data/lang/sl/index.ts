/**
 * SL translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../../../../types";
import { commonTranslations } from "./common";
import { themeTranslations } from "./themes";
import { coreTranslations } from "./core";
import { componentTranslations } from "./components";
import { galleryTranslations } from "./gallery";
import { chartTranslations } from "./charts";
import { authTranslations } from "./auth";
import { chatTranslations } from "./chat";
import { monacoTranslations } from "./monaco";

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
