import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Receipt, ArrowUpRight, TrendingUp, ExternalLink, Activity, ArrowDownLeft, ArrowUpRight as ArrowUpRightIcon } from 'lucide-react';
import { getPaymentHistory, getBlockchainStatus, getEscrowDeals, getEscrowAnalytics } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const StatCard = ({ icon: Icon, label, value, trend, positive }) => (
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

const ActivityChart = ({ activity }) => {
  const chartRef = useRef(null);
  
  const chartData = useMemo(() => {
    const dataPoints = [...activity].reverse().slice(-10);
    
    return {
      labels: dataPoints.map((_, i) => `Event ${i + 1}`),
      datasets: [
        {
          fill: true,
          label: 'Transaction Value (₹)',
          data: dataPoints.map(item => parseFloat(String(item.amount).replace(/[₹,]/g, '')) || 0),
          borderColor: 'rgba(255, 255, 255, 0.15)',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(124, 58, 237, 0.2)');
            gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');
            return gradient;
          },
          borderWidth: 1.5,
          // Color points by direction
          pointBackgroundColor: dataPoints.map(item => 
            item.direction === 'INBOUND' ? '#4ade80' : '#a78bfa'
          ),
          pointBorderColor: '#111',
          pointBorderWidth: 1.5,
          pointHoverRadius: 7,
          pointRadius: 5,
          tension: 0.4,
        },
      ],
    };
  }, [activity]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 17, 17, 0.95)',
        titleFont: { size: 11, weight: 'bold' },
        bodyFont: { size: 13, weight: '600' },
        padding: 14,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const item = activity[activity.length - 1 - context.dataIndex];
            const direction = item?.direction === 'INBOUND' ? ' [INBOUND]' : ' [OUTBOUND]';
            return `₹${context.raw.toLocaleString()}${direction}`;
          },
          title: (context) => {
            const item = activity[activity.length - 1 - context[0].dataIndex];
            return item ? item.type : 'Event';
          }
        }
      },
    },
    scales: {
      x: { display: false },
      y: {
        display: true,
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
        ticks: {
          color: 'rgba(255, 255, 255, 0.2)',
          font: { size: 9, weight: 'bold' },
          callback: (value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`
        }
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px] pt-4">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

const Dashboard = ({ user }) => {
  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [stats, setStats] = useState([
    { icon: Receipt, label: 'Total Transactions', value: '0', trend: 'Healthy', positive: true },
    { icon: BarChart3, label: 'Total Volume', value: '₹0', trend: '+0%', positive: true },
    { icon: Users, label: 'Smart Contracts', value: '0', trend: '0 Active', positive: true },
    { icon: TrendingUp, label: 'Completion Rate', value: '100%', trend: '+0%', positive: true },
  ]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (user?.email) {
      getBlockchainStatus(user.email).then(res => setBlockchainInfo(res.data)).catch(() => { });
      getEscrowAnalytics(user.email).then(res => {
        const d = res.data;
        setStats([
          { icon: Receipt, label: 'Total Transactions', value: String(d.totalTransactions), trend: d.overdueCount > 0 ? `-${d.overdueCount} Overdue` : 'Healthy', positive: d.overdueCount === 0 },
          { icon: BarChart3, label: 'Total Volume', value: `₹${Number(d.totalVolume).toLocaleString('en-IN')}`, trend: '+0%', positive: true },
          { icon: Users, label: 'Smart Contracts', value: String(d.escrowDeals), trend: `${d.activeCount} Active`, positive: true },
          { icon: TrendingUp, label: 'Completion Rate', value: d.verifyRate, trend: '+0%', positive: true },
        ]);
      }).catch(() => { });

      Promise.all([
        getPaymentHistory(user.email).catch(() => ({ data: [] })),
        getEscrowDeals(user.email).catch(() => ({ data: [] }))
      ]).then(([paymentsRes, escrowsRes]) => {
        const p = paymentsRes.data || [];
        const e = escrowsRes.data || [];
        const addr = user.wallet_address?.toLowerCase();

        const mixed = [
          ...p.map(x => ({ 
            id: x.id || Math.random(), 
            type: 'Payment Proof Recorded', 
            amount: `₹${Number(x.amount).toLocaleString('en-IN')}`,
            status: 'Verified',
            timestamp: new Date(x.created_at).getTime(),
            direction: x.to_wallet?.toLowerCase() === addr ? 'INBOUND' : 'OUTBOUND'
          })),
          ...e.map(x => ({ 
            id: x.escrow_id || Math.random(), 
            type: x.status === 'COMPLETED' ? 'Smart Contract Settled' : 'Contract Created',
            amount: `₹${Number(x.amount).toLocaleString('en-IN')}`,
            status: x.status === 'COMPLETED' ? 'Settled' : 'Active',
            timestamp: new Date(x.created_at).getTime(),
            direction: x.seller_wallet?.toLowerCase() === addr ? 'INBOUND' : 'OUTBOUND'
          }))
        ].sort((a, b) => b.timestamp - a.timestamp);
        setActivity(mixed);
      });
    }
  }, [user]);

  return (
    <motion.div className="flex flex-col gap-8" variants={containerVariants} initial="hidden" animate="show">
      <div className="stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <motion.div className="col-span-2 glass-panel p-6 flex flex-col" variants={itemVariants} style={{ minHeight: 420 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Activity size={18} style={{ color: 'var(--primary-light)' }} />
              <h3 className="text-lg font-bold">Recent Blockchain Activity</h3>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5 backdrop-blur-md bg-white/[0.03] px-2 py-1 rounded-md border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                  <span className="text-[9px] font-black uppercase text-secondary">In</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] ml-1" />
                  <span className="text-[9px] font-black uppercase text-secondary">Out</span>
               </div>
               <div className="flex items-center gap-1">
                 <span className="status-dot status-dot-green status-dot-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">Verified Ledger</span>
               </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            {activity.length > 0 ? (
               <ActivityChart activity={activity} />
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                <p className="text-sm opacity-50 italic">Syncing with decentralized ledger...</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-5 border-t border-white/[0.03] flex justify-between items-center">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Audit-Smart Contract History</span>
             </div>
             <div className="text-[10px] font-black uppercase tracking-widest text-white opacity-100 bg-white/5 px-4 py-2 rounded-lg border border-white/10 pointer-events-none shadow-glow">
                Contract Lifecycle Status
             </div>
          </div>
        </motion.div>

        <motion.div className="glass-panel p-6" variants={itemVariants}>
          <h3 className="text-lg font-bold" style={{ marginBottom: 'var(--space-6)' }}>Business Identity</h3>
          <div className="flex flex-col gap-4">
            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--primary-glow)', border: '1px solid rgba(124,58,237,0.25)' }}>
              <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.65rem', color: 'var(--primary-light)', marginBottom: 'var(--space-1)' }}>On-Chain Name</p>
              <p className="font-bold text-lg">{user?.name || 'Your Business'}</p>
            </div>
            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Wallet Address</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-[10px] break-all" style={{ color: 'var(--text-secondary)' }}>{user?.wallet_address || '—'}</p>
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="uppercase tracking-wider font-bold" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>Blockchain Status</p>
              <div className="flex items-center gap-2">
                <span className={`status-dot ${user?.blockchain_enabled ? 'status-dot-green' : 'status-dot-amber'} status-dot-pulse`} />
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">{user?.blockchain_enabled ? 'SECURE_ACTIVE' : 'NOT_SYNCED'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
