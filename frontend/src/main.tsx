import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

