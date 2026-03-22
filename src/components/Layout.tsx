import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, ShieldCheck, LogOut, Menu, X, LogIn, Building2 } from 'lucide-react';
import { auth, signOut } from '../firebase';
import { UserProfile } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface LayoutProps {
  children: React.ReactNode;
  userProfile: UserProfile | null;
}

export default function Layout({ children, userProfile }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard, roles: ['admin', 'agent', 'public'] },
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin', 'agent'] },
    { name: 'Hospitals', path: '/hospitals', icon: Building2, roles: ['admin', 'agent', 'public'] },
    { name: 'Manage Hospitals', path: '/admin/hospitals', icon: ShieldCheck, roles: ['admin'] },
    { name: 'Register Member', path: '/register', icon: UserPlus, roles: ['admin', 'agent'] },
    { name: 'Members List', path: '/members', icon: Users, roles: ['admin', 'agent'] },
    { name: 'Verification', path: '/verify', icon: ShieldCheck, roles: ['admin', 'agent', 'public'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    (item.roles.includes('public') && !userProfile) || (userProfile && item.roles.includes(userProfile.role))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#004A99] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-teal-400" />
              <span className="text-xl font-bold tracking-tight">Care Consultancy</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white/10 text-white'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </div>
                </Link>
              ))}
              {userProfile ? (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-red-500/20 text-red-100 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="ml-4 px-4 py-2 rounded-xl text-sm font-bold bg-teal-500 text-white hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20"
                >
                  Agent Login
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#003d7a] border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'bg-white/10 text-white'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                </Link>
              ))}
              {userProfile ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-200 hover:bg-red-500/20"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    Logout
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-teal-300 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <LogIn className="w-5 h-5" />
                    Agent Login
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Care Consultancy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
