'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  
  // Console.log the username if user is logged in
  useEffect(() => {
    if (user) {
      console.log('Logged in user email:', user.email);
    }
  }, [user]);
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login';
    
  };
  
  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link href="/buyers" className="btn btn-ghost text-xl">
          🏠 Lead Manager
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/buyers">List</Link>
          </li>
          <li>
            <Link href="/buyers/new">Add Lead</Link>
          </li>
          <li>
            {user ? (
              // User is logged in - show email dropdown with logout
              <details>
                <summary>{user.email}</summary>
                <ul className="bg-base-100 rounded-t-none p-2">
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </details>
            ) : (
              // No user logged in - show login button
              <Link href="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}