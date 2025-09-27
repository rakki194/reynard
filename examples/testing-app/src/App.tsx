/**
 * Reynard Testing Dashboard App
 * 
 * 🦦 *splashes with testing dashboard enthusiasm* Main application component
 * that provides a comprehensive view of all testing ecosystem data.
 */

import { Component } from 'solid-js';
import { ReynardProvider } from 'reynard-themes';
import { NotificationsProvider, createNotificationsModule } from 'reynard-core';
import 'reynard-themes/themes.css';
import './styles/app.css';
import Dashboard from './pages/Dashboard';

const App: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <div class="app">
          <Dashboard />
        </div>
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
