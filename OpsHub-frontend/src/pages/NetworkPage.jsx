import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Check, X, Search, Hash } from 'lucide-react';
import { getMutualConnections, getPendingConnections, getAllUsers, requestConnection, acceptConnection, getPartnerRelationship, disconnectConnection } from '../services/api';
import { useToast } from '../components/Toast';
import AddressReveal from '../components/AddressReveal';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const NetworkPage = ({ user }) => {
  const [mutuals, setMutuals] = useState([]);
  const [pending, setPending] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const loadData = async () => {
    if (!user?.email) return;
    try {
      const [mRes, pRes, uRes] = await Promise.all([
        getMutualConnections(user.email).catch(() => ({ data: [] })),
        getPendingConnections(user.email).catch(() => ({ data: [] })),
        getAllUsers(user.email).catch(() => ({ data: [] }))
      ]);
      
      const mutualsData = mRes.data || [];
      const statsPromises = mutualsData.map(m => 
        getPartnerRelationship(user.email, m.email).catch(() => ({ data: { totalDeals: 0, trustScore: 0 } }))
      );
      const statsRes = await Promise.all(statsPromises);
      
      const mutualsWithStats = mutualsData.map((m, i) => ({
        ...m,
        stats: statsRes[i].data
      }));

      setMutuals(mutualsWithStats);
      setPending(pRes.data || []);
      
      const mutualEmails = mutualsData.map(m => m.email);
      const available = (uRes.data || []).filter(u => !mutualEmails.includes(u.email));
      setAllUsers(available);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRequest = async (targetEmail) => {
    try {
      await requestConnection(user.email, targetEmail);
      toast.success('Connection request sent!');
      loadData();
    } catch (e) {
      toast.error('Failed to send request');
    }
  };

  const handleAccept = async (targetEmail) => {
    try {
      await acceptConnection(targetEmail, user.email);
      toast.success('Connection accepted!');
      loadData();
    } catch (e) {
      toast.error('Failed to accept request');
    }
  };

  const handleDisconnect = async (targetEmail) => {
    if (!window.confirm("Are you sure you want to disconnect from this business? This will remove your ability to create quick Smart Contracts with them.")) return;
    try {
      await disconnectConnection(user.email, targetEmail);
      toast.success('Business disconnected.');
      loadData();
    } catch (e) {
      toast.error('Failed to disconnect business.');
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div className="flex flex-col gap-8" variants={containerVariants} initial="hidden" animate="show">
      <motion.div className="glass-panel p-6" variants={itemVariants}>
        <div className="flex items-center gap-3 mb-6">
          <Users size={20} style={{ color: 'var(--primary-light)' }} />
          <h3>Pending Requests</h3>
        </div>
        {pending.length === 0 ? (
          <p className="text-secondary text-sm">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map(req => (
              <div key={req.id} className="flex flex-row items-center justify-between" style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)'}}>
                <div>
                  <p className="font-semibold text-sm">{req.name || req.user_a}</p>
                  <p className="text-secondary text-xs">{req.user_a}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => handleAccept(req.user_a)}>
                    <Check size={14} /> Accept
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => toast.info('Rejected')}>
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div className="glass-panel p-6" variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <Users size={20} style={{ color: 'var(--accent-green)' }} />
            <h3>My Mutual Connections</h3>
          </div>
          {mutuals.length === 0 ? (
            <div className="text-center p-6 text-secondary border border-dashed border-[var(--border)] rounded-lg">
              <p className="text-sm">You have no mutual connections.</p>
              <p className="text-xs mt-1">Connect with businesses to create Smart Contracts.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {mutuals.map((m, i) => (
                <div key={m.email} className="glass-card p-4 hover:border-[var(--primary-light)] transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar-sm">
                        {m.name?.charAt(0) || m.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{m.name || m.email}</p>
                        <AddressReveal address={m.wallet_address} className="text-secondary text-xs" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${i === 0 ? 'badge-green' : 'badge-blue'}`}>
                        {m.stats?.trustScore >= 80 ? 'Elite Tier' : 'Verified'}
                      </span>
                      <button 
                        className="btn btn-ghost btn-icon-sm" 
                        onClick={() => handleDisconnect(m.email)}
                        title="Disconnect Business"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-1">
                    <div className="bg-[var(--surface)] p-2 rounded border border-[var(--border)]">
                      <p className="text-[10px] text-secondary uppercase font-bold tracking-tight">Trust Score</p>
                      <div className="flex items-center gap-2">
                         <p className="text-sm font-bold" style={{ color: m.stats?.trustScore > 70 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                           {m.stats?.trustScore}%
                         </p>
                         <div className="h-1.5 flex-1 bg-[var(--border)] rounded-full overflow-hidden">
                           <div className="h-full bg-[var(--accent-green)]" style={{ width: `${m.stats?.trustScore}%` }} />
                         </div>
                      </div>
                    </div>
                    <div className="bg-[var(--surface)] p-2 rounded border border-[var(--border)]">
                      <p className="text-[10px] text-secondary uppercase font-bold tracking-tight">Smart Contracts</p>
                      <p className="text-sm font-bold">{m.stats?.totalDeals || 0} Total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div className="glass-panel p-6" variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <UserPlus size={20} style={{ color: 'var(--primary-light)' }} />
              <h3>Discover Businesses</h3>
            </div>
          </div>
          
          <div className="input-with-icon mb-4">
            <Search size={16} className="input-icon" />
            <input 
              className="input" 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <div className="flex flex-col gap-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <p className="text-center text-sm text-secondary p-4">No other businesses found.</p>
            ) : (
              filteredUsers.map(u => {
                return (
                  <div key={u.email} className="flex flex-row items-center justify-between" style={{ padding: 'var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)'}}>
                    <div>
                      <p className="font-semibold text-sm">{u.name || u.email}</p>
                      <p className="text-secondary text-xs">{u.email}</p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleRequest(u.email)}>
                      <UserPlus size={14} /> Connect
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NetworkPage;
