import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import EscrowPage from './pages/EscrowPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { ToastProvider } from './components/Toast';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('opshub_user');
    const storedToken = localStorage.getItem('opshub_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('opshub_user');
        localStorage.removeItem('opshub_token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    localStorage.removeItem('opshub_token');
    localStorage.removeItem('opshub_user');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('opshub_user', JSON.stringify(updatedUser));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'transactions':
        return <TransactionsPage user={user} />;
      case 'escrow':
        return <EscrowPage user={user} />;
      case 'settings':
        return <SettingsPage user={user} onUserUpdate={handleUserUpdate} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Layout
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              onLogout={handleLogout}
            >
              {renderContent()}
            </Layout>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastProvider>
  );
}

export default App;
