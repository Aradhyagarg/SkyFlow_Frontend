import React from 'react';
import { User, Lock, AlertTriangle, CheckCircle, LogIn, UserPlus } from 'lucide-react';

function Auth({ 
  authMode, 
  setAuthMode, 
  authEmail, 
  setAuthEmail, 
  authPassword, 
  setAuthPassword, 
  authError, 
  setAuthError, 
  authSuccess, 
  setAuthSuccess, 
  handleAuth 
}) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {authMode === 'forgot' ? 'Forgot Password' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            {authMode === 'forgot' 
              ? 'Enter your email to receive a password reset link' 
              : 'Sign in or register your account to book flights'}
          </p>
        </div>

        {/* Tab toggles (hidden in forgot mode) */}
        {authMode !== 'forgot' && (
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button 
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: authMode === 'login' ? 'var(--color-primary)' : 'transparent',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: authMode === 'register' ? 'var(--color-primary)' : 'transparent',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Register
            </button>
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="e.g. admin@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '45px' }}
                required
              />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: '45px' }}
                  required
                />
              </div>
            </div>
          )}

          {authMode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: '-10px' }}>
              <span 
                onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccess(''); }}
                style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', cursor: 'pointer', textDecoration: 'none' }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Forgot Password?
              </span>
            </div>
          )}

          {authError && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--color-accent)',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={16} />
              {authError}
            </div>
          )}

          {authSuccess && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} />
              {authSuccess}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '10px'
          }}>
            {authMode === 'login' && <LogIn size={18} />}
            {authMode === 'register' && <UserPlus size={18} />}
            {authMode === 'forgot' && <CheckCircle size={18} />}
            
            {authMode === 'login' && 'Sign In'}
            {authMode === 'register' && 'Create Account'}
            {authMode === 'forgot' && 'Send Reset Link'}
          </button>

          {authMode === 'forgot' && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span 
                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'none' }}
                onMouseOver={(e) => e.target.style.color = '#fff'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                ← Back to Login
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Auth;
