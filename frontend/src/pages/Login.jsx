import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Sparkles, User, ArrowRight, Key, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [activeRole, setActiveRole] = useState('TENANT'); // 'TENANT' | 'OWNER' | 'ADMIN' | 'CUSTOM'
  const [email, setEmail] = useState('tenant1@smartrental.com');
  const [password, setPassword] = useState('Tenant@12345');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle switching preset demo roles
  const handleRoleSelect = (role) => {
    setActiveRole(role);
    setErrorMsg('');
    if (role === 'TENANT') {
      setEmail('tenant1@smartrental.com');
      setPassword('Tenant@12345');
    } else if (role === 'OWNER') {
      setEmail('owner1@smartrental.com');
      setPassword('Owner@12345');
    } else if (role === 'ADMIN') {
      setEmail('admin@smartrental.com');
      setPassword('Admin@12345');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'OWNER') navigate('/owner/dashboard');
      else navigate('/tenant/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto shadow-md">
            SR
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Sign In to Smart Rental
          </h2>
          <p className="text-xs text-gray-500">
            Choose your account role or sign in with your credentials.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
          {/* Quick Role Selector Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Select Login Role:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('TENANT')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  activeRole === 'TENANT'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className={`w-4 h-4 ${activeRole === 'TENANT' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>Tenant</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('OWNER')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  activeRole === 'OWNER'
                    ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Key className={`w-4 h-4 ${activeRole === 'OWNER' ? 'text-amber-600' : 'text-gray-500'}`} />
                <span>Owner</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                  activeRole === 'ADMIN'
                    ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className={`w-4 h-4 ${activeRole === 'ADMIN' ? 'text-purple-600' : 'text-gray-500'}`} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold border border-rose-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setActiveRole('CUSTOM');
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setActiveRole('CUSTOM');
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md transition"
            >
              {loading ? 'Signing In...' : `Sign In as ${activeRole === 'CUSTOM' ? 'User' : activeRole}`}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
