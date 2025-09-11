/**
 * TR translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./tr/common";
import { themeTranslations } from "./tr/themes";
import { coreTranslations } from "./tr/core";
import { componentTranslations } from "./tr/components";
import { galleryTranslations } from "./tr/gallery";
import { chartTranslations } from "./tr/charts";
import { authTranslations } from "./tr/auth";
import { chatTranslations } from "./tr/chat";
import { monacoTranslations } from "./tr/monaco";

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
