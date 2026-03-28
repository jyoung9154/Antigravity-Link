'use client';

import { useState, useEffect } from 'react';

interface Workspace {
  id: string;
  name: string;
}

export default function Home() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sender, setSender] = useState('Mobile User');

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setWorkspaces(data.workspaces);
        if (data.workspaces.length > 0) {
          setSelectedWorkspace(data.workspaces[0].id);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedWorkspace) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: selectedWorkspace, message, sender }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Antigravity Link
          </h1>
          <p style={{ opacity: 0.5, marginTop: '4px' }}>Control your workspace from anywhere</p>
        </div>
      </header>

      {/* Workspace Selector (Round Pill Buttons) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Workspace
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => setSelectedWorkspace(ws.id)}
              style={{
                padding: '10px 24px',
                borderRadius: '30px',
                border: selectedWorkspace === ws.id ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                backgroundColor: selectedWorkspace === ws.id ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                color: selectedWorkspace === ws.id ? 'white' : 'rgba(255,255,255,0.5)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: selectedWorkspace === ws.id ? '0 0 15px rgba(139, 92, 246, 0.2)' : 'none'
              }}
            >
              {ws.name}
            </button>
          ))}
        </div>
      </section>

      {/* Task Input Area */}
      <form onSubmit={handleSubmit} className="glass" style={{ flex: 1, minHeight: '300px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the task for the agent..."
          style={{
            flex: 1,
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.25rem',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            padding: '0'
          }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>Sender Identity</span>
            <input 
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'sending'}
            className="premium-gradient glow-effect"
            style={{
              padding: '12px 32px',
              borderRadius: '12px',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              opacity: status === 'sending' ? 0.7 : 1,
              transition: 'transform 0.2s',
              minWidth: '140px'
            }}
          >
            {status === 'sending' ? 'Sending...' : status === 'success' ? 'Sent! ✅' : 'Submit Task'}
          </button>
        </div>
      </form>

      {/* Status Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ opacity: 0.4, fontSize: '0.7rem', textTransform: 'uppercase' }}>System</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px', color: '#10b981' }}>Cloud-Link</p>
          </div>
          <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ opacity: 0.4, fontSize: '0.7rem', textTransform: 'uppercase' }}>Target</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>{workspaces.find(w => w.id === selectedWorkspace)?.name || 'None'}</p>
          </div>
          <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ opacity: 0.4, fontSize: '0.7rem', textTransform: 'uppercase' }}>Status</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>Healthy</p>
          </div>
      </div>
    </main>
  );
}
