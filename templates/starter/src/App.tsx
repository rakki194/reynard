/**
 * Reynard Starter Template
 * Simple showcase of Reynard's core features
 */

import { Component, createSignal, For } from "solid-js";
import "./styles/app.css";

// Simple demo components for each feature
const NotificationsDemo: Component = () => {
  const [notifications, setNotifications] = createSignal<Array<{ id: number; message: string; type: string }>>([]);

  const showNotification = (type: "success" | "error" | "info" | "warning") => {
    const messages = {
      success: "Operation completed successfully!",
      error: "Something went wrong. Please try again.",
      info: "Here's some useful information for you.",
      warning: "Please be careful with this action.",
    };
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message: messages[type], type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  return (
    <div class="demo-section">
      <h2>🔔 Notifications Demo</h2>
      <p>Test notification system with different types:</p>
      <div class="button-group">
        <button onClick={() => showNotification("success")} class="btn btn-success">
          Success Notification
        </button>
        <button onClick={() => showNotification("error")} class="btn btn-error">
          Error Notification
        </button>
        <button onClick={() => showNotification("info")} class="btn btn-info">
          Info Notification
        </button>
        <button onClick={() => showNotification("warning")} class="btn btn-warning">
          Warning Notification
        </button>
      </div>

      <div class="notifications-container">
        <For each={notifications()}>
          {notification => <div class={`notification notification-${notification.type}`}>{notification.message}</div>}
        </For>
      </div>
    </div>
  );
};

const ThemesDemo: Component = () => {
  const [theme, setTheme] = createSignal("light");
  const availableThemes = ["light", "dark", "blue", "green", "purple"];

  return (
    <div class="demo-section">
      <h2>🎨 Themes Demo</h2>
      <p>Switch between different themes:</p>
      <div class="theme-selector">
        <For each={availableThemes}>
          {themeName => (
            <button onClick={() => setTheme(themeName)} class={`theme-btn ${theme() === themeName ? "active" : ""}`}>
              {themeName}
            </button>
          )}
        </For>
      </div>
      <div class="current-theme">
        <strong>Current theme:</strong> {theme()}
      </div>
    </div>
  );
};

const ColorsDemo: Component = () => {
  const [palette, setPalette] = createSignal<string[]>([]);
  const [gradient, setGradient] = createSignal<string>("");

  const createNewPalette = () => {
    const colors = [];
    for (let i = 0; i < 8; i++) {
      const hue = (i * 45) % 360;
      const saturation = 70 + Math.random() * 30;
      const lightness = 50 + Math.random() * 30;
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    setPalette(colors);
  };

  const createGradient = () => {
    const color1 = `hsl(${Math.random() * 360}, 70%, 50%)`;
    const color2 = `hsl(${Math.random() * 360}, 70%, 50%)`;
    const color3 = `hsl(${Math.random() * 360}, 70%, 50%)`;
    setGradient(`linear-gradient(135deg, ${color1}, ${color2}, ${color3})`);
  };

  return (
    <div class="demo-section">
      <h2>🌈 OKLCH Colors Demo</h2>
      <p>Generate beautiful color palettes and gradients:</p>

      <div class="color-controls">
        <button onClick={createNewPalette} class="btn btn-primary">
          Generate Palette
        </button>
        <button onClick={createGradient} class="btn btn-secondary">
          Generate Gradient
        </button>
      </div>

      {palette().length > 0 && (
        <div class="color-section">
          <h3>Color Palette</h3>
          <div class="color-palette">
            <For each={palette()}>
              {color => <div class="color-swatch" style={{ "background-color": color }} title={color} />}
            </For>
          </div>
        </div>
      )}

      {gradient() && (
        <div class="color-section">
          <h3>Gradient Preview</h3>
          <div class="gradient-preview" style={{ background: gradient() }} />
          <p class="gradient-code">{gradient()}</p>
        </div>
      )}
    </div>
  );
};

const ChartsDemo: Component = () => {
  const [chartType, setChartType] = createSignal("bar");
  const chartTypes = ["bar", "line", "pie", "doughnut"];

  return (
    <div class="demo-section">
      <h2>📊 Charts Demo</h2>
      <p>Interactive data visualization showcase:</p>

      <div class="chart-controls">
        <For each={chartTypes}>
          {type => (
            <button onClick={() => setChartType(type)} class={`chart-type-btn ${chartType() === type ? "active" : ""}`}>
              {type}
            </button>
          )}
        </For>
      </div>

      <div class="chart-container">
        <div class="chart-placeholder">
          <h3>{chartType().toUpperCase()} Chart</h3>
          <p>Sample data visualization</p>
          <div class="chart-bars">
            <For each={[12, 19, 3, 5, 2, 3]}>
              {value => <div class="chart-bar" style={{ height: `${value * 10}px` }} />}
            </For>
          </div>
        </div>
      </div>

      <div class="chart-info">
        <p>
          <strong>Chart Type:</strong> {chartType()} Chart
        </p>
        <p>
          <strong>Data Points:</strong> 6 months of sample data
        </p>
        <p>
          <strong>Features:</strong> Responsive, interactive, themed
        </p>
      </div>
    </div>
  );
};

const I18nDemo: Component = () => {
  const [locale, setLocale] = createSignal("en");
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "ja", name: "日本語" },
    { code: "zh", name: "中文" },
  ];

  const translations = {
    en: { welcome: "Welcome, {name}!", features: "4 features available" },
    es: { welcome: "¡Bienvenido, {name}!", features: "4 características disponibles" },
    fr: { welcome: "Bienvenue, {name}!", features: "4 fonctionnalités disponibles" },
    de: { welcome: "Willkommen, {name}!", features: "4 Funktionen verfügbar" },
    ja: { welcome: "ようこそ、{name}さん！", features: "4つの機能が利用可能" },
    zh: { welcome: "欢迎，{name}！", features: "4个功能可用" },
  };

  const t = (key: string, params: any = {}) => {
    const translation =
      translations[locale() as keyof typeof translations]?.[key as keyof (typeof translations)[typeof locale]];
    return translation?.replace("{name}", params.name || "User") || key;
  };

  return (
    <div class="demo-section">
      <h2>🌍 Internationalization Demo</h2>
      <p>Test internationalization system:</p>
      <div class="language-selector">
        <For each={languages}>
          {lang => (
            <button onClick={() => setLocale(lang.code)} class={`lang-btn ${locale() === lang.code ? "active" : ""}`}>
              {lang.name}
            </button>
          )}
        </For>
      </div>
      <div class="translation-demo">
        <p>
          <strong>Current locale:</strong> {locale()}
        </p>
        <p>
          <strong>Welcome message:</strong> {t("welcome", { name: "Reynard User" })}
        </p>
        <p>
          <strong>Feature count:</strong> {t("features")}
        </p>
      </div>
    </div>
  );
};

const AppContent: Component = () => {
  const [activeTab, setActiveTab] = createSignal("notifications");

  const tabs = [
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "themes", label: "Themes", icon: "🎨" },
    { id: "colors", label: "OKLCH Colors", icon: "🌈" },
    { id: "charts", label: "Charts", icon: "📊" },
    { id: "i18n", label: "Internationalization", icon: "🌍" },
  ];

  return (
    <div class="app">
      <header class="app-header">
        <h1>🦊 Reynard Starter Template</h1>
        <p>Simple showcase of Reynard's core features</p>
      </header>

      <main class="app-main">
        <div class="tabs-container">
          <div class="tabs-header">
            <For each={tabs}>
              {tab => (
                <button
                  onClick={() => setActiveTab(tab.id)}
                  class={`tab-btn ${activeTab() === tab.id ? "active" : ""}`}
                >
                  <span class="tab-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              )}
            </For>
          </div>

          <div class="tab-content">
            {activeTab() === "notifications" && <NotificationsDemo />}
            {activeTab() === "themes" && <ThemesDemo />}
            {activeTab() === "colors" && <ColorsDemo />}
            {activeTab() === "charts" && <ChartsDemo />}
            {activeTab() === "i18n" && <I18nDemo />}
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <p>Built with 🦊 Reynard Framework</p>
      </footer>
    </div>
  );
};

const App: Component = () => {
  return <AppContent />;
};

export default App;
