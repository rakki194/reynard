import { Component, createEffect, createResource, createSignal } from 'solid-js';
import { Routes, Route } from '@solidjs/router';
import { createThemeModule, createNotificationsModule, createI18nModule } from '@reynard/core';
import { AuthProvider } from '@reynard/auth';
import { AppLayout } from '@reynard/ui';
import { useSettings } from '@reynard/settings';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Charts } from './pages/Charts';
import { Components } from './pages/Components';
import { Settings } from './pages/Settings';
import { Gallery } from './pages/Gallery';
import { Auth } from './pages/Auth';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { appSettingsSchema } from './settings/schema';

// Translation imports
import { loadTranslations } from './utils/translations';

const App: Component = () => {
  // Initialize core modules
  const theme = createThemeModule();
  const notifications = createNotificationsModule();
  const i18n = createI18nModule();
  
  // Initialize settings with comprehensive schema
  const settings = useSettings({
    config: { schema: appSettingsSchema },
    autoSave: true,
  });

  // Load translations based on current locale
  const [translations] = createResource(
    () => i18n.locale(),
    loadTranslations
  );

  // Update translations when they load
  createEffect(() => {
    const translationData = translations();
    if (translationData) {
      i18n.setTranslations(translationData);
    }
  });

  // Apply theme from settings
  createEffect(() => {
    const themePreference = settings.getSetting('appearance.theme');
    if (themePreference && themePreference !== theme.theme()) {
      theme.setTheme(themePreference);
    }
  });

  // Apply language from settings
  createEffect(() => {
    const languagePreference = settings.getSetting('general.language');
    if (languagePreference && languagePreference !== i18n.locale()) {
      i18n.setLocale(languagePreference);
    }
  });

  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);

  // Create notifications wrapper for components expecting addNotification
  const notificationsWithCompatLayer = {
    ...notifications,
    addNotification: ({ type, message }: { type: string; message: string }) => 
      notifications.notify(message, type as any)
  };

  return (
    <AuthProvider>
      <AppLayout
        sidebar={
          <Sidebar 
            collapsed={sidebarCollapsed()} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed())}
          />
        }
        header={
          <Header 
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed())}
            sidebarCollapsed={sidebarCollapsed()}
          />
        }
        class="dashboard-layout"
      >
        <Routes>
          <Route path="/" component={Dashboard} />
          <Route path="/charts" component={Charts} />
          <Route path="/components" component={Components} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/auth" component={Auth} />
          <Route path="/settings" component={Settings} />
        </Routes>
      </AppLayout>
    </AuthProvider>
  );
};

export default App;


