'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, ChevronDown, UserCircle, Package, Heart, Gift, Bell, LogOut } from 'lucide-react';

export default function HeaderLoginDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Change based on auth state
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Login Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <User className="h-5 w-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-800">
          {isLoggedIn ? 'My Account' : 'Login'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
          {!isLoggedIn ? (
            <>
              {/* Not Logged In */}
              <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600">
                <h3 className="text-white font-bold text-lg mb-2">Welcome</h3>
                <p className="text-blue-100 text-sm">To access account and manage orders</p>
              </div>

              <div className="p-4">
                <Link href="/login">
                  <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md">
                    LOGIN / SIGNUP
                  </button>
                </Link>
              </div>

              <div className="border-t border-gray-200">
                <Link href="/orders">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors">
                    <Package className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Orders</span>
                  </div>
                </Link>
                <Link href="/wishlist">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors">
                    <Heart className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Wishlist</span>
                  </div>
                </Link>
                <Link href="/rewards">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors">
                    <Gift className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Rewards</span>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Logged In */}
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <UserCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">John Doe</h3>
                    <p className="text-blue-100 text-xs">john@example.com</p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <Link href="/account">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors">
                    <UserCircle className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">My Profile</span>
                  </div>
                </Link>
                <Link href="/orders">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors">
                    <Package className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Orders</span>
                  </div>
                </Link>
                <Link href="/wishlist">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors">
                    <Heart className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Wishlist</span>
                  </div>
                </Link>
                <Link href="/rewards">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors">
                    <Gift className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Rewards</span>
                  </div>
                </Link>
                <Link href="/notifications">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Notifications</span>
                  </div>
                </Link>

                <div className="border-t border-gray-200 mt-2">
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 hover:bg-red-50 cursor-pointer flex items-center gap-3 transition-colors text-left"
                  >
                    <LogOut className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
