import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Building, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('TENANT'); // 'TENANT' | 'OWNER'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Tenant specifics
  const [city, setCity] = useState('Bangalore');
  const [area, setArea] = useState('Koramangala');
  const [budgetMin, setBudgetMin] = useState(10000);
  const [budgetMax, setBudgetMax] = useState(25000);
  const [preferredBhk, setPreferredBhk] = useState(2);
  const [tenantType, setTenantType] = useState('BACHELOR');
  const [occupation, setOccupation] = useState('Software Professional');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        fullName,
        email,
        phone,
        password,
        role,
        ...(role === 'TENANT' && {
          city,
          area,
          budgetMin: parseFloat(budgetMin),
          budgetMax: parseFloat(budgetMax),
          preferredBhk: parseInt(preferredBhk, 10),
          tenantType,
          occupation
        })
      };

      const user = await register(payload);
      if (user.role === 'OWNER') navigate('/owner/dashboard');
      else navigate('/tenant/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-gray-500">
            Join thousands of tenants and property owners on Smart Rental.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setRole('TENANT')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'TENANT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👤 I am a Tenant
          </button>
          <button
            type="button"
            onClick={() => setRole('OWNER')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === 'OWNER' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔑 I am an Owner
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold border border-rose-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Tenant AI Preference Setup */}
            {role === 'TENANT' && (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> AI Preference Profile (Used for smart ranking)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Preferred City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-medium"
                    >
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Preferred Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Koramangala"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Max Budget (₹/Month)</label>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tenant Profile</label>
                    <select
                      value={tenantType}
                      onChange={(e) => setTenantType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-medium"
                    >
                      <option value="BACHELOR">Bachelor</option>
                      <option value="WORKING_PROFESSIONAL">Working Professional</option>
                      <option value="FAMILY">Family</option>
                      <option value="STUDENT">Student</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition mt-4"
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'TENANT' ? 'Tenant' : 'Property Owner'}`}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
