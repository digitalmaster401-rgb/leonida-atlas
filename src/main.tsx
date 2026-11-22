import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import './styles/global.css';
import { App } from './App';
import { ProgressProvider } from './hooks/progress';
import { ToastProvider } from './hooks/toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
