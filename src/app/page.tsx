'use client';

import { useState, useEffect, useRef } from 'react';

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
  
  // Real-time bidirectional state
  const [responses, setResponses] = useState<string>('');
  const [displayResponses, setDisplayResponses] = useState<string>('');
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [loadingFrame, setLoadingFrame] = useState(0);
  const responseAreaRef = useRef<HTMLDivElement>(null);

  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    if (!isWaiting) return;
    const interval = setInterval(() => {
      setLoadingFrame(f => (f + 1) % frames.length);
    }, 80);
    return () => clearInterval(interval);
  }, [isWaiting]);

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

  // Polling for workspace responses
  useEffect(() => {
    if (!selectedWorkspace || selectedWorkspace === 'error') {
      setResponses('');
      return;
    }
    
    const fetchResponses = async () => {
      try {
        const res = await fetch(`/api/responses?workspaceId=${selectedWorkspace}`);
        if (res.ok) {
           const data = await res.json();
           if (data.content !== undefined) {
             setResponses((prev) => {
               if (data.content.length > prev.length) {
                 setIsWaiting(false);
               }
               return data.content;
             });

             // Filter logic for weekly memory
             const entries = data.content.split('---\n\n').filter((e: string) => e.trim());
             const now = Date.now();
             const msPerWeek = 7 * 24 * 60 * 60 * 1000;
             let olderExist = false;
             
             const visible = entries.filter((entry: string) => {
                 const match = entry.match(/## \[([^\]]+)\]/);
                 if (match) {
                     const entryTime = new Date(match[1]).getTime();
                     if (!isNaN(entryTime)) {
                         const diff = now - entryTime;
                         if (diff > (weekOffset + 1) * msPerWeek) {
                             olderExist = true;
                             return false;
                         }
                     }
                 }
                 return true;
             });

             setDisplayResponses(visible.join('\n---\n\n') + (visible.length ? '\n---\n\n' : ''));
             setHasMore(olderExist);
           }
        }
      } catch (err) {
        console.error('Error fetching responses:', err);
      }
    };

    fetchResponses(); // Initial fetch
    const interval = setInterval(fetchResponses, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [selectedWorkspace, weekOffset]);

  // Auto-scroll when responses are updated
  useEffect(() => {
    if (responseAreaRef.current) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
    }
  }, [displayResponses, isWaiting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedWorkspace) return;

    setStatus('sending');
    setIsWaiting(true);
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
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Antigravity Link
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
          >
            +
          </button>
          <button 
            onClick={fetchWorkspaces}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            {loading ? '...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Workspace Selector */}
      <section style={{ flexShrink: 0 }}>
        <select
          value={selectedWorkspace}
          onChange={(e) => setSelectedWorkspace(e.target.value)}
          disabled={isBridgeOffline}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '0.95rem',
            fontWeight: 600,
            outline: 'none',
            appearance: 'none',
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

      {/* Real-time Response Display Area */}
      <section 
        ref={responseAreaRef}
        className="glass" 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          color: 'rgba(255,255,255,0.8)',
          whiteSpace: 'pre-wrap',
          background: 'rgba(0,0,0,0.2)'
        }}
      >
        {hasMore && (
           <button 
             onClick={() => setWeekOffset(w => w + 1)}
             style={{ alignSelf: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '6px 16px', color: 'white', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' }}>
             ↑ Load Previous Week
           </button>
        )}
        {displayResponses ? displayResponses : (isBridgeOffline ? "Cannot reach agent workspace." : "No responses yet. Send a task to begin.")}
        {isWaiting && (
          <div style={{ color: '#8b5cf6', marginTop: '8px', fontWeight: 'bold' }}>
            {frames[loadingFrame]} Agent is processing your request...
          </div>
        )}
      </section>

      {/* Task Input Area */}
      <form onSubmit={handleSubmit} className="glass" style={{ flexShrink: 0, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isBridgeOffline ? "Bridge Offline" : "Task for agent..."}
          disabled={isBridgeOffline}
          style={{
            width: '100%',
            height: '60px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            resize: 'none',
            outline: 'none',
            padding: '0',
            opacity: isBridgeOffline ? 0.3 : 1
          }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>Sender</span>
            <input 
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', outline: 'none', width: '80px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'sending' || isBridgeOffline || !message.trim()}
            className="premium-gradient glow-effect"
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              opacity: (status === 'sending' || isBridgeOffline || !message.trim()) ? 0.5 : 1,
              transition: 'transform 0.2s',
              minWidth: '100px'
            }}
          >
            {status === 'sending' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Submit'}
          </button>
        </div>
      </form>

      {/* Modal for New Project */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '24px', background: '#17171a' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>New Agent Project</h2>
            <form onSubmit={handleCreateProject}>
              <input 
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project folder name..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '20px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={creating || !newProjectName.trim()} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-primary)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: creating ? 0.5 : 1 }}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
