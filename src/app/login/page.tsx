'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || '접속 정보가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1s ease' }}>
      {/* Dynamic Background Glows */}
      <div className="login-bg-glow-1" />
      <div className="login-bg-glow-2" />

      {/* Main Container */}
      <div className="login-wrapper">
        
        {/* Logo Section */}
        <div className="login-logo-section">
          <div className="login-logo-container">
            <img 
              src="/antigravity_logo.png" 
              alt="Antigravity Logo" 
              className="login-logo-img"
            />
          </div>
          <div className="login-title-section">
            <h1 className="login-main-title">ANTIGRAVITY</h1>
            <p className="login-sub-title">Secure Link Bridge</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <form onSubmit={handleLogin} className="login-input-group">
            <div className="login-input-group">
              <div className="login-input-field">
                <input
                  type="text"
                  id="user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="login-input"
                  placeholder=" "
                  required
                />
                <label htmlFor="user" className="login-label">Identificator</label>
              </div>

              <div className="login-input-field">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder=" "
                  required
                />
                <label htmlFor="password" className="login-label">Access Key</label>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              <span>{loading ? 'Verifying...' : 'Establish Connection'}</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="login-footer">
          <div className="login-footer-divider">
            <span className="login-footer-line" />
            <span className="login-footer-text">Encrypted Node Gateway</span>
            <span className="login-footer-line" />
          </div>
          <p className="login-copyright">&copy; 2026 ANTIGRAVITY LINK PRO &bull; AUTONOMOUS AGENT INTERFACE</p>
        </div>
      </div>
    </div>
  );
}
