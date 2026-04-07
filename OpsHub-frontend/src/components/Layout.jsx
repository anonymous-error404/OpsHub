import React from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const pageTitles = {
  dashboard: { title: 'Dashboard', desc: 'Overview of your blockchain-backed business operations.' },
  transactions: { title: 'Transactions', desc: 'All payment proofs recorded on-chain.' },
  escrow: { title: 'Escrow Deals', desc: 'Secure escrow settlements with blockchain verification.' },
  settings: { title: 'Settings', desc: 'Manage your blockchain identity and account preferences.' },
};

const Layout = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const page = pageTitles[activeTab] || pageTitles.dashboard;

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={onLogout} />

      <div className="main-content">
        <header className="main-header">
          <div>
            <h2 style={{ marginBottom: '2px' }}>{page.title}</h2>
            <p className="text-sm text-secondary">{page.desc}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="network-pill">
              <span className="status-dot status-dot-green status-dot-pulse" />
              <span>Sepolia Testnet</span>
            </div>

            <div className="flex items-center gap-3" style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--surface)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium" style={{ maxWidth: 120 }} className="truncate text-sm font-medium">
                {user?.name || user?.email || 'User'}
              </span>
            </div>
          </div>
        </header>

        <motion.main
          className="main-body"
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
