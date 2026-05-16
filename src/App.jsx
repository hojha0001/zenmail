import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './lib/store.js';
import { startBackgroundSync } from './agents/sync.js';
import InboxPage from './pages/InboxPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ComposModal from './components/compose/ComposeModal.jsx';

export default function App() {
  const { accounts, composeOpen } = useStore();

  useEffect(() => {
    if (accounts.length > 0) {
      startBackgroundSync();
    }
  }, [accounts.length]);

  const hasAccounts = accounts.length > 0;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={hasAccounts ? <InboxPage /> : <Navigate to="/auth" replace />}
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {composeOpen && <ComposModal />}
    </>
  );
}
