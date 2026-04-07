import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Search, Filter, ExternalLink, Plus, Hash, ArrowUpRight, Calendar, Loader2 } from 'lucide-react';
import { getPaymentHistory, getEscrowDeals } from '../services/api';
import { useToast } from '../components/Toast';
import AddressReveal from '../components/AddressReveal';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const TransactionRow = ({ tx }) => (
  <motion.tr variants={rowVariants} style={{ cursor: 'pointer' }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
  >
    <td className="flex items-center gap-3" style={{ padding: 'var(--space-4)' }}>
      <div className="stat-icon-wrap" style={{ 
        width: 36, 
        height: 36, 
        borderRadius: 'var(--radius-sm)',
        background: tx.direction === 'IN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: tx.direction === 'IN' ? 'var(--accent-green)' : 'rgb(239, 68, 68)'
      }}>
        {tx.direction === 'IN' ? <ArrowUpRight size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ArrowUpRight size={16} />}
      </div>
      <div>
        <p className="font-semibold text-sm">{tx.id}</p>
        <p className="text-secondary flex items-center gap-1" style={{ fontSize: '0.7rem' }}>
          <Calendar size={10} /> {tx.date}
        </p>
      </div>
    </td>
    <td style={{ padding: 'var(--space-4)' }}>
      <div className="flex flex-wrap items-center gap-2">
        <AddressReveal address={tx.fullCounterparty} className="font-medium text-sm text-primary-color" />
        <span className={`badge ${tx.direction === 'IN' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
          {tx.direction === 'IN' ? 'INBOUND' : 'OUTBOUND'}
        </span>
      </div>
      <p className="text-secondary" style={{ fontSize: '0.7rem' }}>{tx.type}</p>
    </td>
    <td style={{ padding: 'var(--space-4)' }}>
      <p className="font-bold text-sm" style={{ color: tx.direction === 'IN' ? 'var(--accent-green)' : 'inherit' }}>
        {tx.direction === 'IN' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
      </p>
    </td>
    <td style={{ padding: 'var(--space-4)' }}>
      <span className="badge badge-blue">
        On-Chain Verified
      </span>
    </td>
    <td style={{ padding: 'var(--space-4)' }}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-secondary" style={{ fontSize: '0.7rem' }}>
          {tx.hash && tx.hash !== '—' ? `${tx.hash.substring(0, 10)}...${tx.hash.slice(-4)}` : 'Pending'}
        </span>
        {tx.hash && tx.hash !== '—' && (
          <a 
            href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-icon" 
            style={{ color: 'var(--primary-light)', display: 'flex', alignItems: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </td>
  </motion.tr>
);

const TransactionsPage = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      Promise.all([
        getPaymentHistory(user.email).catch(() => ({ data: [] })),
        getEscrowDeals(user.email).catch(() => ({ data: [] }))
      ]).then(([paymentsRes, escrowsRes]) => {
        const payments = (paymentsRes.data || []).map((p, i) => {
          const isOut = p.from_wallet === user.wallet_address;
          return {
            id: `TX-PAY-${p.id || i}`,
            date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }) : '—',
            counterparty: (isOut ? p.to_wallet : p.from_wallet)?.substring(0, 10) + '...',
            fullCounterparty: isOut ? p.to_wallet : p.from_wallet,
            type: 'Direct Proof',
            amount: Number(p.amount) || 0,
            direction: isOut ? 'OUT' : 'IN',
            status: 'On-Chain Verified',
            hash: p.blockchain_tx || '—',
            timestamp: p.created_at ? new Date(p.created_at).getTime() : 0
          };
        });

        const escrows = (escrowsRes.data || []).filter(e => e.status === 'COMPLETED').map((e, i) => {
          const isOut = e.buyer_wallet === user.wallet_address;
          return {
            id: `TX-CNT-${e.escrow_id.substring(0, 4)}`,
            date: e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }) : '—',
            counterparty: (isOut ? e.seller_wallet : e.buyer_wallet)?.substring(0, 10) + '...',
            fullCounterparty: isOut ? e.seller_wallet : e.buyer_wallet,
            type: 'Smart Contract Settlement',
            amount: Number(e.amount) || 0,
            direction: isOut ? 'OUT' : 'IN',
            status: 'On-Chain Verified',
            hash: e.blockchain_tx || '—',
            timestamp: e.created_at ? new Date(e.created_at).getTime() : 0
          };
        });

        const all = [...payments, ...escrows].sort((a, b) => b.timestamp - a.timestamp);
        setTransactions(all);
        setLoading(false);
      }).catch(err => {
        console.error("Trans fetch failure", err);
        setLoading(false);
      });
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
          <button className="btn btn-primary" onClick={() => toast.info('Manual proof recording coming soon')}>
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
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', opacity: 0.5 }} />
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
                    <Hash size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.4 }} />
                    <p className="font-medium">No transactions found</p>
                    <p className="text-sm" style={{ marginTop: 'var(--space-1)' }}>Records will appear once you complete organization operations.</p>
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
