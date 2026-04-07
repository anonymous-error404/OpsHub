import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { login as loginApi } from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginApi(email, password);
      const { token, user } = res.data;
      localStorage.setItem('opshub_token', token);
      localStorage.setItem('opshub_user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Login failed. Check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />

      {/* Floating decorative orbs */}
      <motion.div
        style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          top: '10%', left: '10%', zIndex: 0,
        }}
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          bottom: '15%', right: '15%', zIndex: 0,
        }}
        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="login-logo">
          <Hexagon size={28} color="white" />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-2)' }}>Welcome to OpsHub</h1>
          <p className="text-sm text-secondary">Sign in to manage your blockchain operations</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <label className="label" htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-red-bg)',
                color: 'var(--accent-red)',
                fontSize: '0.8rem',
                fontWeight: 500,
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{ marginTop: 'var(--space-2)', fontSize: '0.95rem', position: 'relative', overflow: 'hidden' }}
          >
            {loading ? (
              <motion.span
                className="flex items-center gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Authenticating...
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight size={18} />
              </span>
            )}
          </motion.button>
        </form>

        <p className="text-secondary" style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '0.75rem' }}>
          Blockchain-backed secure authentication
        </p>
      </motion.div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
