import '../global.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import PromptsPage from './components/PromptsPage';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PromptsPage />
  </React.StrictMode>
);
