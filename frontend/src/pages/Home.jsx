import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShieldCheck,
  CreditCard,
  MapPin,
  Key,
  Home as HomeIcon,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Building2
} from 'lucide-react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [bhk, setBhk] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [tenantType, setTenantType] = useState('ANY');
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/properties?limit=6&sortBy=views')
      .then((res) => {
        if (res.data.success) {
          setFeaturedProperties(res.data.data.properties);
        }
      })
      .catch((err) => console.error('Failed to load featured properties:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (bhk) params.append('bhk', bhk);
    if (maxRent) params.append('maxRent', maxRent);
    if (tenantType && tenantType !== 'ANY') params.append('tenantPreference', tenantType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-white to-transparent pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-900 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI-Powered Property Matching & Verified Leases
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.15]">
            Find a Place You Can <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Call Home
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Search verified rental houses based on your exact budget, preferred metro area, and lifestyle preferences. Experience automated monthly rent payments and instant digital receipts.
          </p>

          {/* Quick Search Bar Widget */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-4 rounded-3xl shadow-xl border border-gray-200/80 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-left mt-8"
          >
            {/* City */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                City / Location
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            {/* BHK */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Bedrooms
              </label>
              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any BHK</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>

            {/* Max Budget */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Max Budget
              </label>
              <select
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Budget</option>
                <option value="15000">Up to ₹15,000</option>
                <option value="25000">Up to ₹25,000</option>
                <option value="40000">Up to ₹40,000</option>
                <option value="60000">Up to ₹60,000</option>
              </select>
            </div>

            {/* Tenant Type */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Tenant Type
              </label>
              <select
                value={tenantType}
                onChange={(e) => setTenantType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ANY">All Allowed</option>
                <option value="BACHELOR_ONLY">Bachelor / Techie</option>
                <option value="FAMILY_ONLY">Family Only</option>
              </select>
            </div>

            {/* Submit CTA */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" /> Search Homes
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Top Verified Listings</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              Featured Rental Homes
            </h2>
          </div>
          <Link
            to="/properties"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            Explore All Properties <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">End-to-End Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            How Smart Rental Works
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Seamless digital lifecycle connecting tenants, property owners, and automated payment gateways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Tenant Workflow */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Users className="w-5 h-5" /> For Tenants
            </div>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span>Discover verified homes with AI match score & OpenStreetMap coordinates</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span>Submit 1-click rental application with desired move-in date</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span>Pay monthly rent online via Razorpay and download official PDF receipts</span>
              </div>
            </div>
          </div>

          {/* Owner Workflow */}
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Building2 className="w-5 h-5" /> For Property Owners
            </div>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span>List rental houses with photos, amenities, and tenant preferences</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span>Receive admin verification badge and review tenant applications</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span>Track expected monthly rent, receive payment alerts & manage repair tickets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Metro Cities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Top Indian Metros</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Explore Houses by City
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'Bangalore', count: '12+ Houses', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80' },
            { name: 'Mumbai', count: '8+ Houses', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80' },
            { name: 'Delhi NCR', count: '7+ Houses', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80' },
            { name: 'Hyderabad', count: '5+ Houses', img: 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?w=400&q=80' },
            { name: 'Pune', count: '6+ Houses', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80' },
          ].map((metro) => (
            <Link
              key={metro.name}
              to={`/properties?city=${metro.name}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-lg transition-all"
            >
              <img src={metro.img} alt={metro.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <div className="font-extrabold text-sm sm:text-base">{metro.name}</div>
                <div className="text-[11px] text-gray-300 font-medium">{metro.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
