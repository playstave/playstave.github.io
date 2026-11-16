import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Alegreya (Juan Pablo del Peral, Huerta Tipográfica): a humanist, calligraphic family made for reading.
import '@fontsource-variable/alegreya/index.css';
import '@fontsource-variable/alegreya/wght-italic.css';
import '@fontsource/alegreya-sans/400.css';
import '@fontsource/alegreya-sans/400-italic.css';
import '@fontsource/alegreya-sans/500.css';
import '@fontsource/alegreya-sans/700.css';
import '@fontsource/alegreya-sans-sc/500.css';
import '@fontsource/alegreya-sans-sc/700.css';
import './styles/tokens.css';
import './styles/base.css';
import { App } from './App';
import { captureInstallPrompt, registerServiceWorker } from './lib/install';

// Before React renders: the browser's install prompt can fire very early.
captureInstallPrompt();
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
