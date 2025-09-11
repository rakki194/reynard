/**
 * TH translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./th/common";
import { themeTranslations } from "./th/themes";
import { coreTranslations } from "./th/core";
import { componentTranslations } from "./th/components";
import { galleryTranslations } from "./th/gallery";
import { chartTranslations } from "./th/charts";
import { authTranslations } from "./th/auth";
import { chatTranslations } from "./th/chat";
import { monacoTranslations } from "./th/monaco";

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
