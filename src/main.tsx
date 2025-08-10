import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { store } from '@/store';
import { hydrateFromStorage } from '@/store/slices/authSlice';

// Ensure auth state is hydrated before first render
store.dispatch(hydrateFromStorage());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
