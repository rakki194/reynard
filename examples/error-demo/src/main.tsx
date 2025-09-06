import { render } from 'solid-js/web';
import App from './App.tsx';
import './index.css';
import 'reynard-themes/reynard-themes.css';

// Ensure DOM is ready before rendering
const rootElement = document.getElementById('root');
if (rootElement) {
  render(() => <App />, rootElement);
} else {
  console.error('Root element not found');
}
