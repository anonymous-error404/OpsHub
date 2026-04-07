import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, AlertCircle, CheckCircle2, Clock, ArrowRight, Loader2, Zap } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { createEscrow, completeEscrow } from '../services/api';

const MOCK_DEALS = [
  { id: 1, title: 'Inventory Batch Q4', partner: 'Superior Fabrics Ltd', amount: 250000, status: 'Active', onChainId: 'ESC-BP-992-X', dealId: 1 },
  { id: 2, title: 'Web App Phase 2', partner: 'Creative Labs', amount: 85000, status: 'Active', onChainId: 'ESC-BP-993-Y', dealId: 2 },
  { id: 3, title: 'Office Furniture', partner: 'IKEA Business', amount: 120000, status: 'Completed', onChainId: 'ESC-BP-881-Z', dealId: 3 },
  { id: 4, title: 'Cloud Infrastructure', partner: 'AWS India', amount: 45000, status: 'Completed', onChainId: 'ESC-BP-880-W', dealId: 4 },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const EscrowDealCard = ({ deal, onRelease }) => {
  const isActive = deal.status === 'Active';
  const [releasing, setReleasing] = useState(false);

  const handleRelease = async () => {
    setReleasing(true);
    await onRelease(deal.dealId);
    setReleasing(false);
  };

  return (
    <motion.div className="glass-card glass-card-glow flex flex-col gap-4" variants={cardVariants}>
      <div className="flex items-center justify-between">
        <div style={{
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-sm)',
          background: isActive ? 'var(--accent-amber-bg)' : 'var(--accent-green-bg)',
          color: isActive ? 'var(--accent-amber)' : 'var(--accent-green)',
        }}>
          {isActive ? <Clock size={22} /> : <ShieldCheck size={22} />}
        </div>
        <span className={`badge ${isActive ? 'badge-amber' : 'badge-green'}`}>
          {deal.status}
        </span>
      </div>

      <div>
        <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-1)' }}>{deal.title}</h4>
        <p className="text-sm text-secondary">
          Counterparty: <span style={{ color: 'var(--text-primary)' }}>{deal.partner}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}>
          <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>
            Locked Amount
          </p>
          <p className="font-bold text-sm">₹{deal.amount.toLocaleString('en-IN')}</p>
        </div>
        <div style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}>
          <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>
            Deal ID
          </p>
          <p className="font-mono truncate" style={{ fontSize: '0.7rem' }}>{deal.onChainId}</p>
        </div>
      </div>

      <div className="flex gap-2" style={{ marginTop: 'auto' }}>
        {isActive ? (
          <>
            <motion.button
              className="btn btn-primary btn-sm flex-1"
              onClick={handleRelease}
              disabled={releasing}
              whileTap={{ scale: 0.97 }}
            >
              {releasing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
              {releasing ? 'Releasing...' : 'Release Funds'}
            </motion.button>
            <button className="btn btn-danger btn-sm">
              Dispute
            </button>
          </>
        ) : (
          <div className="btn btn-ghost btn-sm w-full" style={{ cursor: 'default', justifyContent: 'center' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
            Transaction Settled
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EscrowPage = ({ user }) => {
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ buyerEmail: '', sellerEmail: '', amount: '' });
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.buyerEmail || !form.sellerEmail || !form.amount) {
      toast.error('Please fill in all fields.');
      return;
    }
    setCreating(true);
    try {
      const res = await createEscrow(form.buyerEmail, form.sellerEmail, Number(form.amount));
      toast.success(`Escrow created! Deal ID: ${res.data.dealId}`);
      setShowCreate(false);
      setForm({ buyerEmail: '', sellerEmail: '', amount: '' });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create escrow.');
    } finally {
      setCreating(false);
    }
  };

  const handleRelease = async (dealId) => {
    try {
      await completeEscrow(dealId);
      setDeals((prev) =>
        prev.map((d) => (d.dealId === dealId ? { ...d, status: 'Completed' } : d))
      );
      toast.success('Escrow funds released and settled on-chain!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to release escrow.');
    }
  };

  return (
    <motion.div className="flex flex-col gap-8" variants={containerVariants} initial="hidden" animate="show">
      {/* Info Banner */}
      <motion.div className="info-banner" variants={cardVariants}>
        <div className="flex items-center gap-4">
          <div className="stat-icon-wrap" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 style={{ marginBottom: 2 }}>Secure Settlement Layer</h3>
            <p className="text-sm text-secondary">
              Funds are locked on-chain and released only upon mutual verification.
            </p>
          </div>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} /> New Escrow Deal
        </motion.button>
      </motion.div>

      {/* Deal Cards */}
      <div className="grid grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {deals.map((deal) => (
          <EscrowDealCard key={deal.id} deal={deal} onRelease={handleRelease} />
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Escrow Deal">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <label className="label" htmlFor="escrow-buyer">Buyer Email</label>
            <input
              id="escrow-buyer"
              className="input"
              placeholder="buyer@company.com"
              value={form.buyerEmail}
              onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
              disabled={creating}
            />
          </div>
          <div>
            <label className="label" htmlFor="escrow-seller">Seller Email</label>
            <input
              id="escrow-seller"
              className="input"
              placeholder="seller@vendor.com"
              value={form.sellerEmail}
              onChange={(e) => setForm({ ...form, sellerEmail: e.target.value })}
              disabled={creating}
            />
          </div>
          <div>
            <label className="label" htmlFor="escrow-amount">Amount (₹)</label>
            <input
              id="escrow-amount"
              className="input"
              type="number"
              placeholder="50000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              disabled={creating}
            />
          </div>
          <motion.button
            type="submit"
            className="btn btn-primary w-full"
            disabled={creating}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: 'var(--space-2)' }}
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Escrow <ArrowRight size={16} />
              </span>
            )}
          </motion.button>
        </form>
      </Modal>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default EscrowPage;
