import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1054023337489-0rtqi5eobcb6finub5e4nh4cfbjofm8r.apps.googleusercontent.com';

// ── TanStack Query Client ─────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// ── App Bootstrap ─────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
