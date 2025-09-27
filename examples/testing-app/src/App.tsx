/**
 * Reynard Testing Dashboard App
 * 
 * 🦦 *splashes with testing dashboard enthusiasm* Main application component
 * that provides a comprehensive view of all testing ecosystem data with routing.
 */

import { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import { ReynardProvider } from 'reynard-themes';
import { NotificationsProvider, createNotificationsModule } from 'reynard-core';
import './styles/app.css';
import Dashboard from './pages/Dashboard';
import QualityGates from './pages/QualityGates';

const App: Component = () => {
  const notificationsModule = createNotificationsModule();

  return (
    <ReynardProvider defaultTheme="light" defaultLocale="en">
      <NotificationsProvider value={notificationsModule}>
        <Router>
          <div class="app">
            <Route path="/" component={Dashboard} />
            <Route path="/quality-gates" component={QualityGates} />
          </div>
        </Router>
      </NotificationsProvider>
    </ReynardProvider>
  );
};

export default App;
