import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Sparkles, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginAsAdmin, loginAsOwner, loginAsTenant } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleDemoLogin = async (loginFn, targetRoute) => {
    setLoading(true);
    try {
      await loginFn();
      navigate(targetRoute);
    } catch (err) {
      setErrorMsg('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto shadow-md">
            SR
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Sign In to Smart Rental
          </h2>
          <p className="text-xs text-gray-500">
            Access your rental properties, digital leases, and payment receipts.
          </p>
        </div>

        {/* Demo Fast Login Cards */}
        <div className="bg-gradient-to-r from-amber-50 to-blue-50 p-4 rounded-3xl border border-amber-200/60 space-y-2.5">
          <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> 1-Click Viva Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin(() => loginAsTenant(1), '/tenant/dashboard')}
              className="p-2 bg-white rounded-xl border border-blue-200 hover:border-blue-500 font-bold text-gray-800 hover:text-blue-600 shadow-sm transition text-center"
            >
              👤 Tenant
            </button>
            <button
              onClick={() => handleDemoLogin(() => loginAsOwner(1), '/owner/dashboard')}
              className="p-2 bg-white rounded-xl border border-blue-200 hover:border-blue-500 font-bold text-gray-800 hover:text-blue-600 shadow-sm transition text-center"
            >
              🔑 Owner
            </button>
            <button
              onClick={() => handleDemoLogin(loginAsAdmin, '/admin/dashboard')}
              className="p-2 bg-white rounded-xl border border-blue-200 hover:border-blue-500 font-bold text-gray-800 hover:text-blue-600 shadow-sm transition text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-5">
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              {loading ? 'Signing In...' : 'Sign In'}
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
