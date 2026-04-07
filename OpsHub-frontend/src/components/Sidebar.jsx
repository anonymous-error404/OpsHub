import React from 'react';
import { LayoutDashboard, Receipt, ShieldCheck, Settings, LogOut, Wallet, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'escrow', label: 'Escrow Deals', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SidebarItem = ({ icon: Icon, label, active, onClick, index }) => (
  <motion.div
    className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
    onClick={onClick}
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    whileHover={{ x: 2 }}
    whileTap={{ scale: 0.98 }}
  >
    <Icon size={19} />
    <span>{label}</span>
  </motion.div>
);

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const walletAddress = user?.wallet_address;
  const blockchainEnabled = user?.blockchain_enabled;

  const truncateAddress = (addr) => {
    if (!addr) return '—';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Hexagon size={22} />
        </div>
        <span className="sidebar-brand-text">OpsHub</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, i) => (
          <SidebarItem
            key={item.id}
            {...item}
            index={i}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-wallet-card">
          <div className="flex items-center gap-2 mb-2" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            <Wallet size={12} />
            <span>Wallet Status</span>
          </div>
          {blockchainEnabled ? (
            <>
              <p className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--primary-light)', marginBottom: 'var(--space-2)' }}>
                {truncateAddress(walletAddress)}
              </p>
              <div className="flex items-center gap-2" style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>
                <span className="status-dot status-dot-green status-dot-pulse" />
                <span>On-Chain Enabled</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              <span className="status-dot status-dot-amber" />
              <span>Not Activated</span>
            </div>
          )}
        </div>

        <button
          className="sidebar-item"
          onClick={onLogout}
          style={{ width: '100%', color: 'var(--text-secondary)', border: 'none', background: 'none' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <LogOut size={19} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
