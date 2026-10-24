import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminPanel } from './components/AdminPanel';
import './index.css';

const rootElement = document.getElementById('admin-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AdminPanel />
    </React.StrictMode>
  );
}

