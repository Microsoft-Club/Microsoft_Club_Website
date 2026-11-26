import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './styles/theme.css';
import './index.css';
import './styles/phone.css';
import './assets/icons/simple-line-icons.css';

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

let spaRedirect: string | null = null;
try {
  spaRedirect = sessionStorage.getItem('mcg-spa-redirect');
  if (spaRedirect) {
    sessionStorage.removeItem('mcg-spa-redirect');
  }
} catch {
  // Continue normally when browser storage is unavailable.
}

if (spaRedirect) {
  window.history.replaceState(null, '', spaRedirect);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

