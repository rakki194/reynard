/**
 * PT-BR translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./pt-BR/common";
import { themeTranslations } from "./pt-BR/themes";
import { coreTranslations } from "./pt-BR/core";
import { componentTranslations } from "./pt-BR/components";
import { galleryTranslations } from "./pt-BR/gallery";
import { chartTranslations } from "./pt-BR/charts";
import { authTranslations } from "./pt-BR/auth";
import { chatTranslations } from "./pt-BR/chat";
import { monacoTranslations } from "./pt-BR/monaco";

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
