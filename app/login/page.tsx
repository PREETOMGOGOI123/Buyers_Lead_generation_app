'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('')
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSession, setHasSession] = useState<boolean | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);
  
    useEffect(() => {
        checkSession
    }, [])

    const checkSession = async () => {
        try {
            const res = await fetch('/api/auth/check-session')
            const data = await res.json();
            setHasSession(data.hasSession)

            if (data.hasSession) {
                router.push('/buyers')
            }
        }catch(err) {
            console.error('Error checking session:', err);
            setHasSession(false);
        }finally {
                setCheckingSession(false)
            }

    }   
    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      
      const data = await res.json()  
      if (!res.ok) {
        throw new Error('Login failed');
      }
      
      router.push('/buyers');
      router.refresh();
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold">Quick Login</h2>
          <p className="text-sm opacity-70">Enter your email to continue</p>
          
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="form-control">
              <input
                type="email"
                placeholder="email@example.com"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
                      </div>
                      {!hasSession && (
                          
                          <div className="form-control">
              <input
                type="text"
                placeholder="Full Name"
                className="input input-bordered"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                />
            </div>
            )}
            
            {error && (
              <div className="alert alert-error mt-2">
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <button
              type="submit"
              className={`btn btn-primary w-full mt-4 ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login / Register'}
            </button>
          </form>
          
          <p className="text-xs text-center mt-4 opacity-60">
            * Auto-creates account if new email
          </p>
        </div>
      </div>
    </div>
  );
}