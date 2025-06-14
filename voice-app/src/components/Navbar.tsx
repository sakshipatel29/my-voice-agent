'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { toast } from 'sonner';
import { FaHospital } from 'react-icons/fa';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/current-user')
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        setUser(null);
        toast.success('Logged out successfully');
        router.push('/sign-in');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-blue-400 hover:text-blue-600 transition flex items-center gap-2">
              <FaHospital className="h-8 w-8" />
            </Link>
            {user && (
              <Link
                href={`/${user.userType}s/${encodeURIComponent(user.name)}`}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition border-2 border-blue-400 rounded-lg px-4 py-2 hover:border-blue-600"
              >
                Consultations
              </Link>
            )}
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">
                  Welcome to the Hospital's Portal, <span className="text-blue-400">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition"
                >
                  Logout
                </button>
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
