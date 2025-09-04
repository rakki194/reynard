/**
 * ThemeToggle Component
 * Simple theme switching for the basic app
 */

import { Component } from 'solid-js';
import { useTheme, useI18n } from '@reynard/core';

export const ThemeToggle: Component = () => {
  const { theme, nextTheme } = useTheme();
  const { t } = useI18n();

  const getThemeEmoji = () => {
    switch (theme()) {
      case 'light': return '☀️';
      case 'gray': return '☁️';
      case 'dark': return '🌙';
      case 'banana': return '🍌';
      case 'strawberry': return '🍓';
      case 'peanut': return '🥜';
      case 'high-contrast-black': return '⚫';
      case 'high-contrast-inverse': return '⚪';
      default: return '🎨';
    }
  };

  return (
    <button class="theme-toggle" onClick={nextTheme} title={t('theme.switchTo', { theme: t(`theme.${theme()}`) })}>
      {getThemeEmoji()} {t(`theme.${theme()}`)}
    </button>
  );
};
