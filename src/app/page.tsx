'use client';

import { useState, useEffect } from 'react';

interface Workspace {
  id: string;
  name: string;
  active?: boolean;
}

export default function Home() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sender, setSender] = useState('Mobile User');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setWorkspaces(data.workspaces || []);
      if (data.workspaces?.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(data.workspaces[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH', // 프로젝트 생성용으로 PATCH 사용 (또는 별도 엔드포인트)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: newProjectName }),
      });

      if (res.ok) {
        setShowModal(false);
        setNewProjectName('');
        await fetchWorkspaces();
        alert('New project created successfully!');
      } else {
        alert('Failed to create project. Check bridge connection.');
      }
    } catch (err) {
      alert('Error creating project');
    } finally {
      setCreating(false);
    }
  };

  const isBridgeOffline = workspaces.some(w => w.id === 'error');

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Antigravity Link
          </h1>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '2px' }}>Control from anywhere</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
            title="New Project"
          >
            +
          </button>
          <button 
            onClick={fetchWorkspaces}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            {loading ? '...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Workspace Selector */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Active Agents
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => setSelectedWorkspace(ws.id)}
              disabled={ws.id === 'error'}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: selectedWorkspace === ws.id ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                backgroundColor: selectedWorkspace === ws.id ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                color: selectedWorkspace === ws.id ? 'white' : 'rgba(255,255,255,0.5)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: ws.id === 'error' ? 'default' : 'pointer',
                transition: 'all 0.2s',
                opacity: ws.id === 'error' ? 0.5 : 1
              }}
            >
              <span style={{ marginRight: '4px' }}>{ws.id === 'error' ? '🔴' : '🟢'}</span>
              {ws.name}
            </button>
          ))}
        </div>
      </section>

      {/* Task Input Area */}
      <form onSubmit={handleSubmit} className="glass" style={{ flex: 1, minHeight: '250px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isBridgeOffline ? "Bridge Offline" : "Task for agent..."}
          disabled={isBridgeOffline}
          style={{
            flex: 1,
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.1rem',
            lineHeight: '1.5',
            resize: 'none',
            outline: 'none',
            padding: '0',
            opacity: isBridgeOffline ? 0.3 : 1
          }}
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>Sender</span>
              <input 
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', outline: 'none', width: '100px' }}
              />
            </div>
            
            <button
              type="submit"
              disabled={status === 'sending' || isBridgeOffline || !message.trim()}
              className="premium-gradient glow-effect"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                opacity: (status === 'sending' || isBridgeOffline || !message.trim()) ? 0.5 : 1,
                minWidth: '120px'
              }}
            >
              {status === 'sending' ? '...' : status === 'success' ? 'Sent!' : 'Submit'}
            </button>
          </div>
        </div>
      </form>

      {/* Modal for New Project */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '32px', background: '#17171a' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '1.4rem' }}>New Agent Project</h2>
            <form onSubmit={handleCreateProject}>
              <input 
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project folder name..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '20px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={creating || !newProjectName.trim()} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--accent-primary)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: creating ? 0.5 : 1 }}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats - Compact on Mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div className="glass" style={{ padding: '12px', textAlign: 'center' }}>
              <p style={{ opacity: 0.4, fontSize: '0.6rem', textTransform: 'uppercase' }}>Sys</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: isBridgeOffline ? '#ef4444' : '#10b981' }}>{isBridgeOffline ? 'OFF' : 'ON'}</p>
          </div>
          <div className="glass" style={{ padding: '12px', textAlign: 'center' }}>
              <p style={{ opacity: 0.4, fontSize: '0.6rem', textTransform: 'uppercase' }}>Agents</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{workspaces.length}</p>
          </div>
          <div className="glass" style={{ padding: '12px', textAlign: 'center' }}>
              <p style={{ opacity: 0.4, fontSize: '0.6rem', textTransform: 'uppercase' }}>Mode</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Sync</p>
          </div>
      </div>
    </main>
  );
}
