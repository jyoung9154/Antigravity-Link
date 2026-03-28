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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: newProjectName }),
      });

      if (res.ok) {
        setShowModal(false);
        setNewProjectName('');
        await fetchWorkspaces();
        alert('New project created!');
      } else {
        alert('Failed to create project');
      }
    } catch (err) {
      alert('Error creating project');
    } finally {
      setCreating(false);
    }
  };

  const isBridgeOffline = workspaces.some(w => w.id === 'error');

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Antigravity Link
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
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

      {/* Workspace Selector - Now as a Dropdown */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Selected Agent
        </h3>
        <select
          value={selectedWorkspace}
          onChange={(e) => setSelectedWorkspace(e.target.value)}
          disabled={isBridgeOffline}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            outline: 'none',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1.2rem top 50%',
            backgroundSize: '0.65rem auto',
            cursor: 'pointer'
          }}
        >
          {isBridgeOffline && <option value="error">🔴 Bridge Offline - Check Tunnel</option>}
          {workspaces.map(ws => (
            <option key={ws.id} value={ws.id} style={{ background: '#17171a', color: 'white' }}>
              {ws.id === 'error' ? '🔴' : '🟢'} {ws.name}
            </option>
          ))}
          {!loading && workspaces.length === 0 && <option value="">No Active Agents Found</option>}
        </select>
      </section>

      {/* Task Input Area */}
      <form onSubmit={handleSubmit} className="glass" style={{ flex: 1, minHeight: '300px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            fontSize: '1.2rem',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            padding: '0',
            opacity: isBridgeOffline ? 0.3 : 1
          }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.4 }}>Sender</span>
            <input 
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', outline: 'none', width: '120px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'sending' || isBridgeOffline || !message.trim()}
            className="premium-gradient glow-effect"
            style={{
              padding: '12px 32px',
              borderRadius: '12px',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              opacity: (status === 'sending' || isBridgeOffline || !message.trim()) ? 0.5 : 1,
              transition: 'transform 0.2s',
              minWidth: '140px'
            }}
          >
            {status === 'sending' ? 'Sending...' : status === 'success' ? 'Sent! ✅' : 'Submit Task'}
          </button>
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

      {/* Status Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ opacity: 0.4, fontSize: '0.7rem', textTransform: 'uppercase' }}>System</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px', color: isBridgeOffline ? '#ef4444' : '#10b981' }}>
                {isBridgeOffline ? 'Offline' : 'Online'}
              </p>
          </div>
          <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ opacity: 0.4, fontSize: '0.7rem', textTransform: 'uppercase' }}>Agents</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>{workspaces.length}</p>
          </div>
          <div className="glass" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ opacity: 0.4, fontSize: '0.7rem', textTransform: 'uppercase' }}>Discovery</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>Dynamic</p>
          </div>
      </div>
    </main>
  );
}
