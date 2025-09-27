/**
 * Reynard Testing Dashboard Entry Point
 * 
 * 🦊 *whiskers twitch with app initialization cunning* Main entry point
 * for the Reynard Testing Dashboard application.
 */

import { render } from 'solid-js/web';
import App from './App';

// Render the app
render(() => <App />, document.getElementById('root') as HTMLElement);
