/**
 * Reynard Testing Dashboard App
 * 
 * 🦦 *splashes with testing dashboard enthusiasm* Main application component
 * that provides a comprehensive view of all testing ecosystem data with routing.
 */

import { Component } from 'solid-js';
import { Router, RouteDefinition } from '@solidjs/router';
import { ReynardProvider } from 'reynard-themes';
import { NotificationsProvider, createNotificationsModule } from 'reynard-core';
import './styles/app.css';
import Dashboard from './pages/Dashboard';
import QualityGates from './pages/QualityGates';

// Route definitions
const routes: RouteDefinition[] = [
  {
    path: "/",
    component: Dashboard,
  },
  {
    path: "/quality-gates",
    component: QualityGates,
  },
];

const App: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <Router>{routes}</Router>
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
