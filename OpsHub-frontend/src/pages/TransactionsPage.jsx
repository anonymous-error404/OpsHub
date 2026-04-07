import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Search, Filter, ExternalLink, Plus, Hash, ArrowUpRight, Calendar } from 'lucide-react';
import { getPaymentHistory } from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const MOCK_TRANSACTIONS = [
  { id: 'TX-9021', date: 'Apr 06, 2026', counterparty: 'Global Logistics Pvt', vendorId: 'V-102', amount: 45000, status: 'On-Chain Verified', hash: '0x8f3a3e9b1c7d6e5a4b2c1d0e9f8a7b6c5d4e3f2a' },
  { id: 'TX-9022', date: 'Apr 05, 2026', counterparty: 'Raw Material Co.', vendorId: 'V-045', amount: 125000, status: 'On-Chain Verified', hash: '0x123a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a' },
  { id: 'TX-9023', date: 'Apr 04, 2026', counterparty: 'Digital Ads Inc.', vendorId: 'V-201', amount: 12000, status: 'On-Chain Verified', hash: '0x9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' },
  { id: 'TX-9024', date: 'Apr 03, 2026', counterparty: 'CloudServe Hosting', vendorId: 'V-088', amount: 8500, status: 'On-Chain Verified', hash: '0xab1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c' },
  { id: 'TX-9025', date: 'Apr 02, 2026', counterparty: 'FinTech Solutions', vendorId: 'V-310', amount: 250000, status: 'On-Chain Verified', hash: '0xcd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const TransactionRow = ({ tx, index }) => (
  <motion.tr variants={rowVariants} style={{ cursor: 'pointer' }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    <td className="flex items-center gap-3" style={{ padding: 'var(--space-4)' }}>
      <div className="stat-icon-wrap" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)' }}>
        <Receipt size={16} />
      </div>
      <div>
        <p className="font-semibold text-sm">{tx.id}</p>
        <p className="text-secondary flex items-center gap-1" style={{ fontSize: '0.7rem' }}>
          <Calendar size={10} /> {tx.date}
        </p>
      </div>
    </td>
    <td style={{ padding: 'var(--space-4)' }}>
      <p className="font-medium text-sm">{tx.counterparty}</p>
      <p className="text-secondary" style={{ fontSize: '0.7rem' }}>ID: {tx.vendorId}</p>
    </td>
    <td style={{ padding: 'var(--space-4)' }}>
      <p className="font-bold text-sm">₹{tx.amount.toLocaleString('en-IN')}</p>
    </td>
    <td style={{ padding: 'var(--space-4)' }}>
      <span className="badge badge-green">
        <ArrowUpRight size={9} />
        {tx.status}
      </span>
    </td>
    <td style={{ padding: 'var(--space-4)' }}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-secondary" style={{ fontSize: '0.7rem' }}>
          {tx.hash.substring(0, 10)}...{tx.hash.slice(-4)}
        </span>
        <button className="btn-icon" style={{ color: 'var(--primary-light)' }}>
          <ExternalLink size={13} />
        </button>
      </div>
    </td>
  </motion.tr>
);

const TransactionsPage = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user?.email) {
      getPaymentHistory(user.email)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const mapped = res.data.map((p, i) => ({
              id: `TX-${String(9000 + i).padStart(4, '0')}`,
              date: new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }),
              counterparty: p.to_wallet?.substring(0, 10) + '...',
              vendorId: p.to_wallet?.substring(0, 6),
              amount: Number(p.amount) || 0,
              status: 'On-Chain Verified',
              hash: p.blockchain_tx || '—',
            }));
            setTransactions(mapped);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const filtered = transactions.filter((tx) =>
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.counterparty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div className="flex flex-col gap-6" variants={containerVariants} initial="hidden" animate="show">
      {/* Toolbar */}
      <motion.div className="flex items-center justify-between gap-4" variants={rowVariants}>
        <div className="input-with-icon" style={{ maxWidth: 400, flex: 1 }}>
          <Search size={18} className="input-icon" />
          <input
            type="text"
            className="input"
            placeholder="Search by ID or counterparty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Filter size={16} /> Filter
          </button>
          <button className="btn btn-primary" onClick={() => toast.info('Payment proof recording coming soon')}>
            <Plus size={16} /> New Proof
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div className="glass-panel overflow-hidden" variants={rowVariants}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Counterparty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Blockchain Proof</th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants} initial="hidden" animate="show">
              {filtered.length > 0 ? (
                filtered.map((tx, i) => (
                  <TransactionRow key={tx.id} tx={tx} index={i} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
                    <Hash size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }} />
                    <p className="font-medium">No transactions found</p>
                    <p className="text-sm" style={{ marginTop: 'var(--space-1)' }}>Try adjusting your search filters</p>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TransactionsPage;
