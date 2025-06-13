'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@/types';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/current-user')
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-400 transition">
            EchoMate
          </Link>

          <div>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">
                  Welcome, <span className="text-blue-400">{user.name}</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm font-medium text-white bg-blue-400 px-4 py-2 rounded-md hover:bg-blue-500 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
