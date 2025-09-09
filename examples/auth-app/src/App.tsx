/**
 * Reynard Auth App - Main Application Component
 * A comprehensive authentication demo with PostgreSQL backend
 */

import { Component } from "solid-js";
import { NotificationsProvider, createNotifications } from "reynard-core";
import { AuthProvider } from "reynard-auth";
import { ReynardProvider } from "reynard-themes";
import { AuthContent } from "./components/AuthContent";

const App: Component = () => {
  const notificationsModule = createNotifications();

  return (
    <ReynardProvider>
      <NotificationsProvider value={notificationsModule}>
        <AuthProvider
          config={{
            apiBaseUrl: "/api",
            autoRefresh: true,
            loginRedirectPath: "/dashboard",
          }}
          callbacks={{
            onLoginSuccess: (user: any) =>
              console.log("Welcome:", user.username),
            onLogout: () => console.log("Goodbye!"),
            onSessionExpired: () => console.log("Session expired"),
          }}
        >
          <AuthContent />
        </AuthProvider>
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
