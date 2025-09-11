/**
 * LV translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./lv/common";
import { themeTranslations } from "./lv/themes";
import { coreTranslations } from "./lv/core";
import { componentTranslations } from "./lv/components";
import { galleryTranslations } from "./lv/gallery";
import { chartTranslations } from "./lv/charts";
import { authTranslations } from "./lv/auth";
import { chatTranslations } from "./lv/chat";
import { monacoTranslations } from "./lv/monaco";

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
