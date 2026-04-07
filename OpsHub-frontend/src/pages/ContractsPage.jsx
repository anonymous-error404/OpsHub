import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, AlertCircle, CheckCircle2, Clock, ArrowRight, Loader2, Zap, CreditCard } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { requestEscrow, payEscrow, completeEscrow, getEscrowDeals, getMutualConnections, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import AddressReveal from '../components/AddressReveal';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const ContractCard = ({ deal, user, onPay, onRelease }) => {
  const isPending = deal.status === 'PENDING_PAYMENT';
  const isLocked = deal.status === 'LOCKED_ON_CHAIN';
  const isCompleted = deal.status === 'COMPLETED';
  
  const isBuyer = user?.wallet_address === deal.buyer_wallet || user?.email === deal.buyer_wallet;
  const isOverdue = !isCompleted && deal.deadline && new Date(deal.deadline) < new Date();
  
  const [loadingAction, setLoadingAction] = useState(false);

  const handleAction = async (action) => {
    setLoadingAction(true);
    if (action === 'PAY') await onPay(deal.id);
    if (action === 'RELEASE') await onRelease(deal.dealId || deal.id);
    setLoadingAction(false);
  };

  const getStatusColor = () => {
    if (isPending) return { bg: 'var(--surface)', color: 'var(--text-tertiary)', class: 'badge-blue' };
    if (isLocked) return { bg: 'var(--accent-amber-bg)', color: 'var(--accent-amber)', class: 'badge-amber' };
    return { bg: 'var(--accent-green-bg)', color: 'var(--accent-green)', class: 'badge-green' };
  };

  const colors = getStatusColor();

  return (
    <motion.div className="glass-card glass-card-glow flex flex-col gap-4" variants={cardVariants}>
      <div className="flex items-center justify-between">
        <div style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', background: colors.bg, color: colors.color }}>
          {isCompleted ? <ShieldCheck size={22} /> : <Clock size={22} />}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`badge ${colors.class}`}>
            {isPending ? 'Pending Payment' : isLocked ? 'Locked (Active)' : 'Settled'}
          </span>
          {isOverdue && <span className="badge badge-red text-xs">Overdue</span>}
          {!isOverdue && !isCompleted && isLocked && <span className="badge badge-green text-xs">On Track</span>}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-1)' }}>{deal.title}</h4>
        <div className="text-sm text-secondary">
          Counterparty: <AddressReveal address={deal.fullPartner} />
        </div>
        <p className="text-xs text-secondary mt-1">
          Role: <span className="font-semibold">{deal.isBuyer ? "Buyer" : "Seller"}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>Amount</p>
          <p className="font-bold text-sm">₹{deal.amount.toLocaleString('en-IN')}</p>
        </div>
        <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>Deadline</p>
          <p className={`font-bold text-sm ${isOverdue ? 'text-red-500' : ''}`}>
            {deal.deadline ? new Date(deal.deadline).toLocaleDateString() : 'No deadline'}
          </p>
        </div>
      </div>

      <div className="flex gap-2" style={{ marginTop: 'auto' }}>
        {isPending && deal.isBuyer && (
          <motion.button className="btn btn-primary btn-sm flex-1" onClick={() => handleAction('PAY')} disabled={loadingAction} whileTap={{ scale: 0.97 }}>
            {loadingAction ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
            {loadingAction ? 'Processing...' : 'Pay via Razorpay'}
          </motion.button>
        )}
        {isPending && !deal.isBuyer && (
          <div className="btn btn-ghost btn-sm w-full" style={{ cursor: 'default', justifyContent: 'center' }}>
            <Clock size={14} /> Waiting for Buyer...
          </div>
        )}
        {isLocked && deal.isBuyer && (
          <motion.button className="btn btn-primary btn-sm flex-1" onClick={() => handleAction('RELEASE')} disabled={loadingAction} whileTap={{ scale: 0.97 }}>
            {loadingAction ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {loadingAction ? 'Releasing...' : 'Release Funds to Seller'}
          </motion.button>
        )}
        {isLocked && !deal.isBuyer && (
          <div className="btn btn-ghost btn-sm w-full" style={{ cursor: 'default', justifyContent: 'center' }}>
            <Clock size={14} style={{ color: 'var(--accent-amber)' }} /> Waiting for Buyer Release
          </div>
        )}
        {isCompleted && (
          <div className="btn btn-ghost btn-sm w-full" style={{ cursor: 'default', justifyContent: 'center' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} /> Transaction Settled Successfully
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ContractsPage = ({ user }) => {
  const [deals, setDeals] = useState([]);
  const [mutuals, setMutuals] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ partnerEmail: '', amount: '', deadlineDays: '7' });
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    if (!user?.email) return;
    try {
      const [dealsRes, mutualsRes] = await Promise.all([
        getEscrowDeals(user.email).catch(() => ({ data: [] })),
        getMutualConnections(user.email).catch(() => ({ data: [] }))
      ]);
      
      const mappedDeals = (dealsRes.data || []).map((d) => {
        const isBuyer = user.wallet_address === d.buyer_wallet || user.email === d.buyer_wallet;
        return {
          id: d.escrow_id,
          title: 'Smart Contract Agreement',
          isBuyer: isBuyer,
          partner: isBuyer ? d.seller_wallet?.substring(0,10)+'...' : d.buyer_wallet?.substring(0,10)+'...',
          fullPartner: isBuyer ? d.seller_wallet : d.buyer_wallet,
          amount: Number(d.amount) || 0,
          status: d.status,
          onChainId: d.blockchain_deal_id,
          deadline: d.deadline,
          dealId: d.escrow_id // Using escrow_id for transactions since backend completeEscrow now takes escrowId
        };
      });
      setDeals(mappedDeals);
      setMutuals(mutualsRes.data || []);
      
      if (mutualsRes.data && mutualsRes.data.length > 0) {
        setForm(f => ({ ...f, partnerEmail: mutualsRes.data[0].email }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.partnerEmail || !form.amount) {
      toast.error('Please fill in all fields.');
      return;
    }
    setCreating(true);
    try {
      // Seller creates the request. partner is buyer.
      await requestEscrow(form.partnerEmail, user.email, Number(form.amount), Number(form.deadlineDays));
      toast.success('Smart Contract request sent!');
      setShowCreate(false);
      setForm({ ...form, amount: '' });
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to request smart contract.');
    } finally {
      setCreating(false);
    }
  };

  const handlePay = async (escrowId) => {
    try {
      const deal = deals.find(d => d.dealId === escrowId || d.id === escrowId);
      if (!deal) return toast.error("Could not find deal.");

      toast.info('Initializing Razorpay Checkout...');
      const orderRes = await createRazorpayOrder(deal.amount);
      const { order_id, amount, key_id } = orderRes.data;

      const options = {
          key: key_id,
          amount: amount,
          currency: "INR",
          name: "OpsHub Smart Contracts",
          description: "Secure Smart Contract Payment Lock",
          order_id: order_id,
          handler: async function (response) {
              try {
                  toast.info('Verifying payload signature...');
                  const verifyRes = await verifyRazorpayPayment({
                      order_id: response.razorpay_order_id,
                      payment_id: response.razorpay_payment_id,
                      signature: response.razorpay_signature
                  });

                  if (verifyRes.data.status === "success") {
                      toast.info('Payload validated! Locking on Blockchain...');
                      await payEscrow(escrowId, response.razorpay_payment_id);
                      toast.success('Smart Contract Lock Complete! Transaction sealed.');
                      loadData();
                  } else {
                      toast.error("Payment validation restricted.");
                  }
              } catch (err) {
                  toast.error('Smart Contract initialization failed: ' + (err?.response?.data?.error || err.message));
              }
          },
          prefill: {
              name: user?.name,
              email: user?.email,
          },
          theme: { color: "#111111" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
          toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      toast.error(err?.response?.data?.error || 'Payment gateway initialization failed.');
    }
  };

  const handleRelease = async (escrowId) => {
    try {
      await completeEscrow(escrowId);
      toast.success('Smart Contract funds released and settled on-chain!');
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to release funds.');
    }
  };

  return (
    <motion.div className="flex flex-col gap-8" variants={containerVariants} initial="hidden" animate="show">
      <motion.div className="info-banner" variants={cardVariants}>
        <div className="flex items-center gap-4">
          <div className="stat-icon-wrap" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 style={{ marginBottom: 2 }}>Seller-Initiated Flow Activated</h3>
            <p className="text-sm text-secondary">
              Only businesses within your Mutual Network can be sent payment requests.
            </p>
          </div>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={18} /> Request Smart Contract
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {deals.map((deal) => (
          <ContractCard 
            key={deal.id} 
            deal={deal} 
            user={user}
            onPay={handlePay} 
            onRelease={handleRelease} 
          />
        ))}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Request Smart Contract">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <label className="label" htmlFor="contract-partner">Select Mutual Partner (Buyer)</label>
            {mutuals.length === 0 ? (
              <p className="text-sm text-secondary">You have no mutual connections. Add some first!</p>
            ) : (
              <select 
                id="contract-partner" 
                className="input" 
                value={form.partnerEmail}
                onChange={(e) => setForm({ ...form, partnerEmail: e.target.value })}
                disabled={creating}
                style={{ width: '100%', cursor: 'pointer' }}
              >
                {mutuals.map(m => (
                  <option key={m.email} value={m.email}>{m.name || m.email}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="label" htmlFor="contract-amount">Amount representing service value (₹)</label>
            <input
              id="contract-amount"
              className="input"
              type="number"
              placeholder="50000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              disabled={creating || mutuals.length === 0}
            />
          </div>
          <div>
            <label className="label" htmlFor="contract-deadline">Expected Delivery Deadline</label>
            <select 
              id="contract-deadline" 
              className="input w-full" 
              value={form.deadlineDays}
              onChange={(e) => setForm({ ...form, deadlineDays: e.target.value })}
              disabled={creating}
            >
              <option value="1">1 Day (Express)</option>
              <option value="3">3 Days (Standard)</option>
              <option value="7">7 Days (Default)</option>
              <option value="14">14 Days (Extended)</option>
              <option value="30">30 Days (Long-term)</option>
            </select>
          </div>
          <motion.button
            type="submit"
            className="btn btn-primary w-full"
            disabled={creating || mutuals.length === 0}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: 'var(--space-2)' }}
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Requesting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send Request <ArrowRight size={16} />
              </span>
            )}
          </motion.button>
        </form>
      </Modal>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default ContractsPage;
