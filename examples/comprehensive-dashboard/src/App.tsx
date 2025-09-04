import {
  Component,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";
import { Route } from "@solidjs/router";
import {
  createThemeModule,
  createI18nModule,
  createNotificationsModule,
  I18nProvider,
  ThemeProvider,
  NotificationsProvider,
} from "@reynard/core";
import { AuthProvider } from "@reynard/auth";
import { AppLayout } from "@reynard/ui";
import { useSettings } from "@reynard/settings";

// Pages
import { Dashboard } from "./pages/Dashboard";
import { Charts } from "./pages/Charts";
import { Components } from "./pages/Components";
import { Settings } from "./pages/Settings";
import { Gallery } from "./pages/Gallery";
import { Auth } from "./pages/Auth";

// Components
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { appSettingsSchema } from "./settings/schema";

// Translation imports
import { loadTranslations } from "./utils/translations";

const App: Component = () => {
  // Initialize core modules
  const theme = createThemeModule();
  const i18n = createI18nModule();
  const notifications = createNotificationsModule();

  // Initialize settings with comprehensive schema
  const settings = useSettings({
    config: { schema: appSettingsSchema },
    autoSave: true,
  });

  // Load translations based on current locale
  const [translations] = createResource(() => i18n.locale(), loadTranslations);

  // Update translations when they load
  createEffect(() => {
    const translationData = translations();
    if (translationData) {
      i18n.setTranslations(translationData);
    }
  });

  // Apply theme from settings
  createEffect(() => {
    const themePreference = settings.getSetting("appearance.theme");
    if (themePreference && themePreference !== theme.theme()) {
      theme.setTheme(themePreference);
    }
  });

  // Apply language from settings
  createEffect(() => {
    const languagePreference = settings.getSetting("general.language");
    if (languagePreference && languagePreference !== i18n.locale()) {
      i18n.setLocale(languagePreference);
    }
  });

  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);

  return (
    <ThemeProvider value={theme}>
      <I18nProvider value={i18n}>
        <NotificationsProvider value={notifications}>
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
                  onToggleSidebar={() =>
                    setSidebarCollapsed(!sidebarCollapsed())
                  }
                  sidebarCollapsed={sidebarCollapsed()}
                />
              }
              class="dashboard-layout"
            >
              <Route path="/" component={Dashboard} />
              <Route path="/charts" component={Charts} />
              <Route path="/components" component={Components} />
              <Route path="/gallery" component={Gallery} />
              <Route path="/auth" component={Auth} />
              <Route path="/settings" component={Settings} />
            </AppLayout>
          </AuthProvider>
        </NotificationsProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

export default App;
