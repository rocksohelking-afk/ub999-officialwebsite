import React from 'react';
import ReactDOM from 'react-dom/client';
import { SignalApp } from './components/SignalApp';
import './index.css'; // Assuming this imports tailwind

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SignalApp />
  </React.StrictMode>
);
