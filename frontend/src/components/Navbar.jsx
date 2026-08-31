import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Heart,
  Key,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  PlusCircle,
  FileText,
  CreditCard,
  Wrench,
  BarChart3,
  CheckSquare,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated, role, logout, loginAsAdmin, loginAsOwner, loginAsTenant } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [demoDropdown, setDemoDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then((res) => {
          if (res.data.success) {
            setUnreadCount(res.data.data.unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-xl flex items-center justify-center text-white font-black shadow-md tracking-tight">
            SR
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-gray-900 tracking-tight leading-none">
              Smart<span className="text-blue-600">Rental</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">
              Verified Properties & Payments
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold text-gray-600">
          <Link
            to="/properties"
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              isActive('/properties') ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <Search className="w-4 h-4" /> Explore Properties
          </Link>

          {/* Role specific links */}
          {isAuthenticated && role === 'TENANT' && (
            <>
              <Link
                to="/tenant/dashboard"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/tenant/dashboard') ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600" /> AI Recommendations
              </Link>
              <Link
                to="/tenant/rental"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/tenant/rental') ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Key className="w-4 h-4" /> Active Lease & Rent
              </Link>
              <Link
                to="/favorites"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/favorites') ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Heart className="w-4 h-4" /> Saved
              </Link>
            </>
          )}

          {isAuthenticated && role === 'OWNER' && (
            <>
              <Link
                to="/owner/dashboard"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/owner/dashboard') ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Owner Dashboard
              </Link>
              <Link
                to="/owner/properties"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/owner/properties') ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Home className="w-4 h-4" /> My Properties
              </Link>
              <Link
                to="/owner/add-property"
                className="px-3 py-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> List New Home
              </Link>
            </>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <>
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/admin/dashboard') ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Analytics
              </Link>
              <Link
                to="/admin/approvals"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/admin/approvals') ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <CheckSquare className="w-4 h-4" /> Verify Listings
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / User Profile / Demo Helpers */}
        <div className="flex items-center space-x-3">
          {/* Quick Demo Switcher (Student Viva Helper) */}
          <div className="relative">
            <button
              onClick={() => setDemoDropdown(!demoDropdown)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-1"
            >
              ⚡ Quick Demo Login
            </button>
            {demoDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn text-xs">
                <div className="px-3 py-1 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  Switch Role
                </div>
                <button
                  onClick={() => {
                    loginAsTenant(1);
                    setDemoDropdown(false);
                    navigate('/tenant/dashboard');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 font-semibold flex items-center justify-between"
                >
                  <span>👤 Tenant (Aarav)</span>
                </button>
                <button
                  onClick={() => {
                    loginAsOwner(1);
                    setDemoDropdown(false);
                    navigate('/owner/dashboard');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 font-semibold flex items-center justify-between"
                >
                  <span>🔑 Owner (Rajesh)</span>
                </button>
                <button
                  onClick={() => {
                    loginAsAdmin();
                    setDemoDropdown(false);
                    navigate('/admin/dashboard');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700 font-semibold flex items-center justify-between"
                >
                  <span>👑 System Admin</span>
                </button>
              </div>
            )}
          </div>

          {/* Authenticated State */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/notifications"
                aria-label="View notifications"
                className="relative p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                  {user?.fullName ? user.fullName[0] : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-gray-900 line-clamp-1">{user?.fullName}</div>
                  <div className="text-[10px] text-gray-500 font-medium">{role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-gray-50 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-white border-b border-gray-200 space-y-2 animate-fadeIn text-sm">
          <Link
            to="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-medium text-gray-700 hover:text-blue-600"
          >
            Explore Properties
          </Link>
          {isAuthenticated && role === 'TENANT' && (
            <>
              <Link to="/tenant/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-gray-700">
                Tenant Dashboard
              </Link>
              <Link to="/tenant/rental" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-gray-700">
                Active Lease & Invoices
              </Link>
              <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-gray-700">
                Saved Properties
              </Link>
            </>
          )}
          {isAuthenticated && role === 'OWNER' && (
            <>
              <Link to="/owner/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-gray-700">
                Owner Dashboard
              </Link>
              <Link to="/owner/properties" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-gray-700">
                My Properties
              </Link>
              <Link to="/owner/add-property" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-blue-600 font-bold">
                + List New Home
              </Link>
            </>
          )}
          {isAuthenticated && role === 'ADMIN' && (
            <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 font-medium text-gray-700">
              Admin Analytics & Approvals
            </Link>
          )}
          {!isAuthenticated && (
            <div className="pt-3 border-t border-gray-100 flex gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-xs font-bold border rounded-xl">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-xs font-bold bg-blue-600 text-white rounded-xl">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
