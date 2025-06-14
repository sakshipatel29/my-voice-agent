'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { toast } from 'sonner';
import { FaHospital, FaCalendarAlt, FaMicrophoneAlt } from 'react-icons/fa';
import DoctorUpdate from './DoctorUpdate';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
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

  // Don't render navbar if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold text-blue-400 hover:text-blue-600 transition flex items-center gap-2">
                <FaHospital className="h-8 w-8" />
              </Link>
              <Link
                href={`/${user.userType}s/${encodeURIComponent(user.name)}`}
                className="text-sm font-small text-gray-700 hover:text-gray-900 transition border-2 border-blue-400 rounded-lg px-4 py-2 hover:border-blue-600"
              >
                Consultations
              </Link>
              {user.userType === 'doctor' && (
                <>
                  <Link
                    href="/api/auth/google-calendar"
                    className="flex text-sm font-small text-gray-700 hover:text-gray-900 transition border-2 border-green-400 rounded-lg px-4 py-2 hover:border-green-600 gap-2"
                  >
                    Connect Calendar
                    <FaCalendarAlt className="h-4 w-4"/>
                  </Link>
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="text-sm font-small text-gray-700 hover:text-gray-900 transition border-2 border-purple-400 rounded-lg px-4 py-2 hover:border-purple-600 flex items-center gap-2"
                  >
                    <FaMicrophoneAlt className="h-4 w-4" />
                    Get Daily Update
                  </button>
                </>
              )}
            </div>

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
          </div>
        </div>
      </nav>

      {/* Update Modal */}
      {showUpdateModal && user?.userType === 'doctor' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-end items-center mb-4">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <DoctorUpdate />
          </div>
        </div>
      )}
    </>
  );
}
