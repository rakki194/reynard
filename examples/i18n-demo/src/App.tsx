import { Component, createSignal, createEffect } from 'solid-js';
import { useI18n, useTheme } from 'reynard-themes';
import LanguageSelector from './components/LanguageSelector';
import ThemeSelector from './components/ThemeSelector';
import TranslationDemo from './components/TranslationDemo';
import './App.css';

const App: Component = () => {
  // Use unified Reynard i18n and theme systems
  const { t, locale, isRTL } = useI18n();
  const themeContext = useTheme();
  const [currentTime, setCurrentTime] = createSignal(new Date());

  // Update time every second
  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div class="app" dir={isRTL ? 'rtl' : 'ltr'}>
      <header class="header">
        <div class="header-content">
          <h1 class="title">
            🦦 Reynard i18n Demo
          </h1>
          <p class="subtitle">
            {t('common.description')} - {t('themes.theme')}: {themeContext.theme}
          </p>
          <div class="controls">
            <LanguageSelector />
            <ThemeSelector />
          </div>
        </div>
      </header>

      <main class="main">
        <div class="demo-section">
          <h2>{t('common.about')} Reynard i18n</h2>
          <p>
            This demo showcases Reynard's comprehensive internationalization system 
            with support for 37 languages, advanced pluralization rules, and RTL support.
          </p>
        </div>

        <TranslationDemo />

        <div class="demo-section">
          <h2>Current Status</h2>
          <div class="status-grid">
            <div class="status-item">
              <strong>{t('common.language')}:</strong> {locale}
            </div>
            <div class="status-item">
              <strong>{t('themes.theme')}:</strong> {themeContext.theme}
            </div>
            <div class="status-item">
              <strong>RTL:</strong> {isRTL ? 'Yes' : 'No'}
            </div>
            <div class="status-item">
              <strong>{t('core.dateTime.now')}:</strong> {currentTime().toLocaleString()}
            </div>
          </div>
        </div>

        <div class="demo-section">
          <h2>Features</h2>
          <ul class="features-list">
            <li>✅ 37 languages with comprehensive coverage</li>
            <li>✅ Advanced pluralization rules (Arabic, Russian, Polish, etc.)</li>
            <li>✅ RTL support for Arabic and Hebrew</li>
            <li>✅ Type-safe translations with autocomplete</li>
            <li>✅ Dynamic loading for optimal performance</li>
            <li>✅ Cultural adaptations (dates, numbers, currency)</li>
            <li>✅ Package-specific translations</li>
            <li>✅ Fallback system for missing translations</li>
          </ul>
        </div>
      </main>

      <footer class="footer">
        <p>
          Built with 🦦 Reynard framework • SolidJS • Love
        </p>
      </footer>
    </div>
  );
};

export default App;
