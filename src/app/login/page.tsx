'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    <div className={`min-h-screen bg-[#050505] flex items-center justify-center p-6 selection:bg-cyan-500/30 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] left-[40%] w-[20%] h-[20%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[420px] relative z-10 transition-all duration-700 transform translate-y-0 translate-x-0">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 space-y-4 animate-float">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            <Image 
              src="/antigravity_logo.png" 
              alt="Antigravity Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              ANTIGRAVITY
            </h1>
            <p className="text-[10px] tracking-[0.4em] uppercase text-cyan-400 font-bold opacity-80">
              Secure Link Bridge
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.08] rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          
          {/* Decorative Border Glow */}
          <div className="absolute -inset-px bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <form onSubmit={handleLogin} className="relative z-10 space-y-8">
            <div className="space-y-6">
              {/* Username Input */}
              <div className="relative group/input">
                <input
                  type="text"
                  id="user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="peer w-full bg-white/[0.03] border-b-2 border-white/10 px-4 py-4 text-white outline-none focus:border-cyan-500 transition-all duration-300 placeholder-transparent hover:bg-white/[0.05]"
                  placeholder="Username"
                  required
                />
                <label 
                  htmlFor="user"
                  className="absolute left-4 -top-3 text-[10px] font-bold uppercase tracking-widest text-cyan-500 transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-cyan-500 pointer-events-none"
                >
                  Identificator
                </label>
              </div>

              {/* Password Input */}
              <div className="relative group/input">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full bg-white/[0.03] border-b-2 border-white/10 px-4 py-4 text-white outline-none focus:border-cyan-500 transition-all duration-300 placeholder-transparent hover:bg-white/[0.05]"
                  placeholder="Password"
                  required
                />
                <label 
                  htmlFor="password"
                  className="absolute left-4 -top-3 text-[10px] font-bold uppercase tracking-widest text-cyan-500 transition-all duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-cyan-500 pointer-events-none"
                >
                  Access Key
                </label>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl transition-all duration-500 overflow-hidden hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 group-hover/btn:text-white transition-colors">
                {loading ? 'Verifying...' : 'Establish Connection'}
              </span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
            <span className="w-8 h-[1px] bg-gray-800" />
            <span>Encrypted Node Gateway</span>
            <span className="w-8 h-[1px] bg-gray-800" />
          </div>
          <p className="text-[9px] text-gray-700 font-medium">
            &copy; 2026 ANTIGRAVITY LINK PRO &bull; AUTONOMOUS AGENT INTERFACE
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px #1a1a1a inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
