// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCircle, LogOut, Settings } from "lucide-react";
import { User } from "@/types";


export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/current-user")
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Voice Agent
          </Link>

          <div className="flex items-center">
            {user ? (
              <div className="relative group">
                <button className="btn text-sm">Welcome, {user.name}</button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
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
