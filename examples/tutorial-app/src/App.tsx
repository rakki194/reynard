import { Component } from "solid-js";
import { ReynardProvider } from "reynard-themes";
import { NotificationsProvider, createNotificationsModule } from "reynard-core";
import { Button, Card } from "reynard-components";
import "reynard-themes/reynard-themes.css";
import "reynard-components/styles";
import "./styles.css";

const AppContent: Component = () => {
  return (
    <div class="app">
      <header class="app-header">
        <h1>🦊 Welcome to Reynard</h1>
        <p>Your first Reynard application with theming and notifications!</p>
      </header>

      <main class="app-main">
        <Card padding="lg">
          <h2>Theme Demo</h2>
          <p>This is a simple version to test the basic setup.</p>

          <div class="theme-controls">
            <Button>Test Button</Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

const App: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <AppContent />
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
