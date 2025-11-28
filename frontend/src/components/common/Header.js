// frontend/src/components/common/Header.js
// Top header bar with store selector and user menu

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { getInitials } from '../../utils/helpers';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentStore, stores, switchStore } = useStore();
  const { success } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);

  const handleLogout = async () => {
    try {
      // Call logout to clear state and localStorage
      await logout();
      success('Logged out successfully');
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      // Even if logout API fails, still redirect to login
      // since we've already cleared local state
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Menu button and Store selector */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Store selector */}
          {currentStore && stores.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowStoreMenu(!showStoreMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <span className="text-sm font-medium text-gray-700">
                  {currentStore.name}
                </span>
                {stores.length > 1 && (
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Store dropdown */}
              {showStoreMenu && stores.length > 1 && (
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[45]">
                  <div className="py-1" role="menu">
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => {
                          switchStore(store.id);
                          setShowStoreMenu(false);
                        }}
                        className={`
                          block w-full text-left px-4 py-2 text-sm
                          ${store.id === currentStore.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}
                        `}
                      >
                        {store.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-medium">
              {getInitials(user?.first_name || user?.firstName, user?.last_name || user?.lastName)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">
                {user?.first_name || user?.firstName} {user?.last_name || user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[45]">
              <div className="py-1" role="menu">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showStoreMenu) && (
        <div
          className="fixed inset-0 z-[42]"
          onClick={() => {
            setShowUserMenu(false);
            setShowStoreMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
