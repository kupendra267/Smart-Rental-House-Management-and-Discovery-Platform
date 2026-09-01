import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Scale, Check, X, ArrowRight, Building, MapPin, IndianRupee, Sparkles, Trash2, PlusCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function PropertyCompare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showError, showSuccess } = useToast();

  const [properties, setProperties] = useState([]);
  const [allAvailable, setAllAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Load properties based on query params (e.g. ?ids=id1,id2,id3)
  useEffect(() => {
    fetchCompareData();
  }, [searchParams]);

  const fetchCompareData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all candidate properties for the picker dropdown
      const resAll = await api.get('/properties?limit=50');
      if (resAll.data.success) {
        setAllAvailable(resAll.data.data.properties);
      }

      // 2. Fetch specific properties to compare
      const idsParam = searchParams.get('ids');
      let idList = idsParam ? idsParam.split(',').filter(Boolean) : [];

      // If no IDs provided, default to first 3 properties
      if (idList.length === 0 && resAll.data.data.properties.length > 0) {
        idList = resAll.data.data.properties.slice(0, 3).map(p => p.id);
        setSearchParams({ ids: idList.join(',') });
      }

      if (idList.length > 0) {
        const details = await Promise.all(
          idList.map(id => api.get(`/properties/${id}`).catch(() => null))
        );
        const valid = details.filter(r => r && r.data?.success).map(r => r.data.data);
        setProperties(valid);
      }
    } catch (err) {
      console.error('Failed to load comparison data:', err);
      showError('Failed to load property comparison data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id) => {
    const updated = properties.filter(p => p.id !== id);
    setProperties(updated);
    setSearchParams({ ids: updated.map(p => p.id).join(',') });
    showSuccess('Property removed from comparison');
  };

  const handleAdd = (id) => {
    if (properties.some(p => p.id === id)) {
      showError('Property is already in comparison');
      return;
    }
    if (properties.length >= 3) {
      showError('You can compare a maximum of 3 properties at once');
      return;
    }
    const propToAdd = allAvailable.find(p => p.id === id);
    if (propToAdd) {
      const updated = [...properties, propToAdd];
      setProperties(updated);
      setSearchParams({ ids: updated.map(p => p.id).join(',') });
      setSelectorOpen(false);
      showSuccess('Property added to comparison');
    }
  };

  const allAmenities = [
    'Wi-Fi / High-Speed Internet',
    'Covered Car Parking',
    '24/7 Power Backup',
    'Elevator / Lift',
    'Gated Security & CCTV',
    'Air Conditioner (AC)',
    'Swimming Pool',
    'Fitness Gym',
    'Modular Kitchen & Piped Gas',
    'Spacious Balcony',
    'Water Purifier (RO)'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4" /> Side-by-Side Evaluation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
            Property Comparison Tool
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Compare rent, security deposit, BHK layout, amenities, and tenant policies across up to 3 shortlisted homes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {properties.length < 3 && (
            <button
              onClick={() => setSelectorOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-sm transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Property ({properties.length}/3)
            </button>
          )}
          <Link
            to="/properties"
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 transition"
          >
            Explore More
          </Link>
        </div>
      </div>

      {/* Property Selector Modal */}
      {selectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Select Property to Compare</h3>
              <button onClick={() => setSelectorOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {allAvailable
                .filter(p => !properties.some(selected => selected.id === p.id))
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleAdd(p.id)}
                    className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-2xl cursor-pointer transition flex items-center gap-3"
                  >
                    <img
                      src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80'}
                      alt={p.title}
                      className="w-14 h-14 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{p.title}</h4>
                      <p className="text-[11px] text-gray-500">{p.location?.area}, {p.location?.city}</p>
                      <p className="text-xs font-black text-blue-600 mt-0.5">₹{p.monthlyRent?.toLocaleString()}/mo • {p.bhk} BHK</p>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[11px] font-bold shrink-0">
                      Select
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Comparison Matrix */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-500 animate-pulse border border-gray-200">
          Loading comparison specifications...
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-gray-200">
          <Scale className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No properties selected for comparison</h3>
          <p className="text-xs text-gray-500">Pick up to 3 verified homes to view an instant side-by-side feature breakdown.</p>
          <button
            onClick={() => setSelectorOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="p-5 font-black text-gray-400 uppercase text-[10px] tracking-wider w-1/4">
                  Feature / Metric
                </th>
                {properties.map((p) => (
                  <th key={p.id} className="p-5 font-bold text-gray-900 w-1/4 align-top">
                    <div className="space-y-2">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-sm bg-gray-100">
                        <img
                          src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80'}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemove(p.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-xl backdrop-blur-sm transition"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{p.title}</h3>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{p.location?.area}, {p.location?.city}</span>
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* Rent */}
              <tr className="hover:bg-blue-50/40 transition">
                <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Monthly Rent</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-black text-sm text-blue-600">
                    ₹{p.monthlyRent?.toLocaleString()}
                    <span className="text-[10px] text-gray-400 font-normal"> / mo</span>
                  </td>
                ))}
              </tr>

              {/* Deposit */}
              <tr className="hover:bg-blue-50/40 transition">
                <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Security Deposit</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-gray-900">
                    ₹{p.securityDeposit?.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Maintenance */}
              <tr className="hover:bg-blue-50/40 transition">
                <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Maintenance Charge</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 text-gray-700">
                    {p.maintenanceCharge > 0 ? `₹${p.maintenanceCharge.toLocaleString()} / mo` : 'Included in Rent'}
                  </td>
                ))}
              </tr>

              {/* Layout & Area */}
              <tr className="hover:bg-blue-50/40 transition">
                <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Layout & Size</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-gray-900">
                    {p.bhk} BHK • {p.areaSqft} sq.ft ({p.bathrooms || 1} Bath)
                  </td>
                ))}
              </tr>

              {/* Property Type */}
              <tr className="hover:bg-blue-50/40 transition">
                <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Property Type</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 text-gray-800 capitalize">
                    {p.propertyType?.replace('_', ' ').toLowerCase()}
                  </td>
                ))}
              </tr>

              {/* Furnishing */}
              <tr className="hover:bg-blue-50/40 transition">
                <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Furnishing</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-medium text-gray-800">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-[11px] font-bold">
                      {p.furnishingStatus?.replace('_', ' ')}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Tenant Preference */}
              <tr className="hover:bg-blue-50/40 transition">
                <td className="p-4 font-bold text-gray-700 bg-gray-50/40">Tenant Preference</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-emerald-700">
                    {p.tenantPreference === 'ANY'
                      ? '✓ All Welcome'
                      : p.tenantPreference === 'BACHELOR_ONLY'
                      ? '✓ Bachelor Allowed'
                      : '✓ Family Only'}
                  </td>
                ))}
              </tr>

              {/* Amenities Grid */}
              {allAmenities.map((amenity) => (
                <tr key={amenity} className="hover:bg-blue-50/40 transition">
                  <td className="p-3.5 font-medium text-gray-600 bg-gray-50/40 text-[11px]">
                    {amenity}
                  </td>
                  {properties.map((p) => {
                    const has =
                      p.amenities?.some(a => (typeof a === 'string' ? a : a.amenity?.name || a.name) === amenity) ||
                      p.amenities?.includes(amenity);

                    return (
                      <td key={p.id} className="p-3.5">
                        {has ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                            <span>Included</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-300 text-[11px]">
                            <X className="w-3.5 h-3.5" />
                            <span>—</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Action Buttons */}
              <tr>
                <td className="p-5 font-bold text-gray-700 bg-gray-50/70">Action</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-5">
                    <Link
                      to={`/properties/${p.id}`}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold text-center block shadow-sm transition"
                    >
                      View & Apply &rarr;
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
