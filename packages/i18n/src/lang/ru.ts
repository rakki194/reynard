/**
 * RU translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./ru/common";
import { themeTranslations } from "./ru/themes";
import { coreTranslations } from "./ru/core";
import { componentTranslations } from "./ru/components";
import { galleryTranslations } from "./ru/gallery";
import { chartTranslations } from "./ru/charts";
import { authTranslations } from "./ru/auth";
import { chatTranslations } from "./ru/chat";
import { monacoTranslations } from "./ru/monaco";

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
