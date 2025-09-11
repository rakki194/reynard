/**
 * MT translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./mt/common";
import { themeTranslations } from "./mt/themes";
import { coreTranslations } from "./mt/core";
import { componentTranslations } from "./mt/components";
import { galleryTranslations } from "./mt/gallery";
import { chartTranslations } from "./mt/charts";
import { authTranslations } from "./mt/auth";
import { chatTranslations } from "./mt/chat";
import { monacoTranslations } from "./mt/monaco";

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
