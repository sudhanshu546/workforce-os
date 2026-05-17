import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ToastProvider } from './components/ToastProvider';
import { registerServiceWorker } from './services/notifications';
import App from './App';
import './index.css';

// Fix for SockJS/Stomp global variable
(window as any).global = window;

// Register Service Worker for PWA Push Notifications
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Provider>
  </React.StrictMode>
);
