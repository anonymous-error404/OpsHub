import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Wallet, Globe, User, Zap, CheckCircle2, Loader2, ExternalLink, Copy, Server } from 'lucide-react';
import { enableBlockchain, getBlockchainStatus } from '../services/api';
import { useToast } from '../components/Toast';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SettingsPage = ({ user, onUserUpdate }) => {
  const [bcStatus, setBcStatus] = useState(null);
  const [enabling, setEnabling] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user?.email) {
      getBlockchainStatus(user.email)
        .then((res) => setBcStatus(res.data))
        .catch(() => setBcStatus({ enabled: user?.blockchain_enabled, wallet: user?.wallet_address, tx: user?.blockchain_tx }));
    }
  }, [user]);

  const handleEnable = async () => {
    setEnabling(true);
    try {
      const res = await enableBlockchain(user.email);
      toast.success('Blockchain enabled! Wallet created on-chain.');
      setBcStatus({ enabled: true, wallet: res.data.wallet, tx: res.data.tx });
      if (onUserUpdate) {
        onUserUpdate({ ...user, blockchain_enabled: true, wallet_address: res.data.wallet, blockchain_tx: res.data.tx });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to enable blockchain.');
    } finally {
      setEnabling(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isEnabled = bcStatus?.enabled || user?.blockchain_enabled;

  return (
    <motion.div
      className="flex flex-col gap-8"
      style={{ maxWidth: 800 }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Profile Section */}
      <motion.div className="glass-panel p-6" variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <User size={20} style={{ color: 'var(--primary-light)' }} />
          <h3>Profile</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="label" style={{ marginBottom: 'var(--space-1)' }}>Name</p>
            <p className="font-semibold">{user?.name || '—'}</p>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="label" style={{ marginBottom: 'var(--space-1)' }}>Email</p>
            <p className="font-semibold">{user?.email || '—'}</p>
          </div>
        </div>
      </motion.div>

      {/* Blockchain Section */}
      <motion.div className="glass-panel p-6" variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <Shield size={20} style={{ color: 'var(--primary-light)' }} />
          <h3>Blockchain Identity</h3>
        </div>

        {!isEnabled ? (
          /* Not Enabled State */
          <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
            <motion.div
              style={{
                width: 80, height: 80, borderRadius: 'var(--radius-xl)',
                background: 'var(--primary-glow)', margin: '0 auto var(--space-6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              animate={{ boxShadow: ['0 0 20px rgba(124,58,237,0.2)', '0 0 40px rgba(124,58,237,0.4)', '0 0 20px rgba(124,58,237,0.2)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap size={36} style={{ color: 'var(--primary-light)' }} />
            </motion.div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Enable Blockchain</h3>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-6)', maxWidth: 400, margin: '0 auto var(--space-6)' }}>
              Create a custodial wallet and register your business on the blockchain. This enables on-chain transaction proofs and escrow settlements.
            </p>
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={handleEnable}
              disabled={enabling}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {enabling ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Registering on-chain...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap size={18} />
                  Enable Blockchain Now
                </span>
              )}
            </motion.button>
          </div>
        ) : (
          /* Enabled State */
          <div className="flex flex-col gap-4">
            <div style={{
              padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
              background: 'var(--accent-green-bg)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} style={{ color: 'var(--accent-green)' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--accent-green)' }}>
                  Blockchain Identity Active
                </p>
              </div>
            </div>

            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="label" style={{ marginBottom: 'var(--space-2)' }}>Wallet Address</p>
              <div className="flex items-center gap-2">
                <Wallet size={14} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                <p className="font-mono text-sm truncate" style={{ flex: 1 }}>
                  {bcStatus?.wallet || user?.wallet_address || '—'}
                </p>
                <button
                  className="btn-icon"
                  onClick={() => copyToClipboard(bcStatus?.wallet || user?.wallet_address)}
                  style={{ flexShrink: 0 }}
                >
                  <Copy size={14} />
                </button>
                <button className="btn-icon" style={{ flexShrink: 0, color: 'var(--primary-light)' }}>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            {(bcStatus?.tx || user?.blockchain_tx) && (
              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="label" style={{ marginBottom: 'var(--space-2)' }}>Registration Transaction</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm truncate" style={{ flex: 1, color: 'var(--text-secondary)' }}>
                    {bcStatus?.tx || user?.blockchain_tx}
                  </p>
                  <button
                    className="btn-icon"
                    onClick={() => copyToClipboard(bcStatus?.tx || user?.blockchain_tx)}
                    style={{ flexShrink: 0 }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Network Info */}
      <motion.div className="glass-panel p-6" variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <Globe size={20} style={{ color: 'var(--primary-light)' }} />
          <h3>Network Information</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="label" style={{ marginBottom: 'var(--space-1)' }}>Network</p>
            <div className="flex items-center gap-2">
              <span className="status-dot status-dot-green status-dot-pulse" />
              <p className="font-semibold text-sm">Sepolia Testnet</p>
            </div>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="label" style={{ marginBottom: 'var(--space-1)' }}>Chain ID</p>
            <p className="font-mono font-semibold text-sm">11155111</p>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="label" style={{ marginBottom: 'var(--space-1)' }}>Wallet Architecture</p>
            <p className="font-semibold text-sm">Custodial (Server-Managed)</p>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="label" style={{ marginBottom: 'var(--space-1)' }}>Smart Contracts</p>
            <div className="flex items-center gap-2">
              <Server size={13} style={{ color: 'var(--accent-green)' }} />
              <p className="font-semibold text-sm">3 Deployed</p>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default SettingsPage;
