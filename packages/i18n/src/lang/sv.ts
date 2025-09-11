/**
 * SV translations for Reynard framework
 * Modular translation system with comprehensive coverage
 */

import type { Translations } from "../types";
import { commonTranslations } from "./sv/common";
import { themeTranslations } from "./sv/themes";
import { coreTranslations } from "./sv/core";
import { componentTranslations } from "./sv/components";
import { galleryTranslations } from "./sv/gallery";
import { chartTranslations } from "./sv/charts";
import { authTranslations } from "./sv/auth";
import { chatTranslations } from "./sv/chat";
import { monacoTranslations } from "./sv/monaco";

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
