/**
 * ThemeToggle Component
 * Simple theme switching for the basic app
 */

import { Component } from 'solid-js';
import { useTheme } from '@reynard/core';

export const ThemeToggle: Component = () => {
  const { theme, nextTheme } = useTheme();

  const getThemeEmoji = () => {
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'banana': return '🍌';
      case 'strawberry': return '🍓';
      case 'peanut': return '🥜';
      default: return '🎨';
    }
  };

  return (
    <button class="theme-toggle" onClick={nextTheme} title={`Current: ${theme}`}>
      {getThemeEmoji()} {theme}
    </button>
  );
};
