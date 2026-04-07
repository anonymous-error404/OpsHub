import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Receipt, ArrowUpRight, TrendingUp, ExternalLink, Activity } from 'lucide-react';
import { getPaymentHistory, getBlockchainStatus } from '../services/api';

const MOCK_STATS = [
  { icon: Receipt, label: 'Total Transactions', value: '1,284', trend: '+12.5%', positive: true },
  { icon: BarChart3, label: 'Total Volume', value: '₹45.28L', trend: '+8.2%', positive: true },
  { icon: Users, label: 'Escrow Deals', value: '42', trend: '+5.4%', positive: true },
  { icon: TrendingUp, label: 'Verify Rate', value: '99.9%', trend: '+0.1%', positive: true },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'Payment Proof Recorded', hash: '0x8a2f1c3e...f3e1', amount: '₹12,500', status: 'Verified', time: '2 min ago' },
  { id: 2, type: 'Escrow Deal Created', hash: '0x9b3a2d4f...a1b2', amount: '₹85,000', status: 'Active', time: '15 min ago' },
  { id: 3, type: 'Payment Proof Recorded', hash: '0x1c4e5f6a...d3c4', amount: '₹32,000', status: 'Verified', time: '1 hr ago' },
  { id: 4, type: 'Escrow Completed', hash: '0x2d5f6a7b...e4d5', amount: '₹1,20,000', status: 'Settled', time: '3 hrs ago' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const StatCard = ({ icon: Icon, label, value, trend, positive, index }) => (
  <motion.div className="glass-card glass-card-glow" variants={itemVariants}>
    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
      <div className="stat-icon-wrap">
        <Icon size={22} />
      </div>
      <span className={`badge ${positive ? 'badge-green' : 'badge-red'}`}>
        <ArrowUpRight size={10} />
        {trend}
      </span>
    </div>
    <p className="text-sm text-secondary font-medium" style={{ marginBottom: 'var(--space-1)' }}>{label}</p>
    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{value}</h3>
  </motion.div>
);

const statusBadge = (status) => {
  if (status === 'Verified' || status === 'Settled') return 'badge-green';
  if (status === 'Active') return 'badge-amber';
  return 'badge-blue';
};

const Dashboard = ({ user }) => {
  const [blockchainInfo, setBlockchainInfo] = useState(null);

  useEffect(() => {
    if (user?.email) {
      getBlockchainStatus(user.email)
        .then((res) => setBlockchainInfo(res.data))
        .catch(() => {});
    }
  }, [user]);

  return (
    <motion.div
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Stats Grid */}
      <div className="stat-grid">
        {MOCK_STATS.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div className="col-span-2 glass-panel p-6" variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity size={18} style={{ color: 'var(--primary-light)' }} />
              <h3>Recent Blockchain Activity</h3>
            </div>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>

          <div className="flex flex-col gap-3">
            {MOCK_ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                className="flex items-center justify-between p-4"
                style={{
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                whileHover={{ borderColor: 'rgba(255,255,255,0.15)', background: 'var(--surface-hover)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="stat-icon-wrap" style={{ width: 38, height: 38 }}>
                    <Receipt size={17} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.type}</p>
                    <p className="font-mono text-secondary" style={{ fontSize: '0.7rem' }}>Tx: {item.hash}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div style={{ textAlign: 'right' }}>
                    <p className="font-bold text-sm">{item.amount}</p>
                    <p className="text-secondary" style={{ fontSize: '0.65rem' }}>{item.time}</p>
                  </div>
                  <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Business Identity Panel */}
        <motion.div className="glass-panel p-6" variants={itemVariants}>
          <h3 style={{ marginBottom: 'var(--space-6)' }}>Business Identity</h3>

          <div className="flex flex-col gap-4">
            <div style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-glow)',
              border: '1px solid rgba(124,58,237,0.25)',
            }}>
              <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.65rem', color: 'var(--primary-light)', marginBottom: 'var(--space-1)' }}>On-Chain Name</p>
              <p className="font-bold text-lg">{user?.name || 'Your Business'}</p>
            </div>

            <div style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Wallet Address</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                  {user?.wallet_address || '—'}
                </p>
                {user?.wallet_address && (
                  <button className="btn-icon" style={{ flexShrink: 0 }}>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>

            <div style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Blockchain Status</p>
              <div className="flex items-center gap-2">
                <span className={`status-dot ${user?.blockchain_enabled ? 'status-dot-green' : 'status-dot-amber'} status-dot-pulse`} />
                <p className="text-sm font-medium">
                  {user?.blockchain_enabled ? 'Enabled & Verified' : 'Not Activated'}
                </p>
              </div>
            </div>

            {blockchainInfo?.tx && (
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}>
                <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Registration Tx</p>
                <p className="font-mono truncate" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {blockchainInfo.tx}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
