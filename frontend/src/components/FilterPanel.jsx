import React from 'react';
import { Filter, RotateCcw, Building, Home, MapPin, IndianRupee } from 'lucide-react';

const POPULAR_CITIES = ['All Cities', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Tirupati', 'Mysore', 'Coimbatore', 'Kochi', 'Visakhapatnam', 'Vijayawada'];

const BHK_OPTIONS = [
  { label: 'Any BHK', value: '' },
  { label: '1 BHK', value: '1' },
  { label: '2 BHK', value: '2' },
  { label: '3 BHK', value: '3' },
  { label: '4+ BHK', value: '4' }
];

const PROPERTY_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Apartment', value: 'APARTMENT' },
  { label: 'Villa', value: 'VILLA' },
  { label: 'Independent House', value: 'INDEPENDENT_HOUSE' },
  { label: 'PG / Co-Living', value: 'PG' },
  { label: 'Single Room', value: 'ROOM' }
];

const FURNISHING_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Furnished', value: 'FURNISHED' },
  { label: 'Semi-Furnished', value: 'SEMI_FURNISHED' },
  { label: 'Unfurnished', value: 'UNFURNISHED' }
];

const TENANT_PREFS = [
  { label: 'All Welcome', value: 'ANY' },
  { label: 'Bachelors Allowed', value: 'BACHELOR_ONLY' },
  { label: 'Families Only', value: 'FAMILY_ONLY' }
];

export default function FilterPanel({ filters, onFilterChange, onReset }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
          <Filter className="w-4 h-4 text-blue-600" />
          Filter Properties
        </div>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* City (Supports any small city or metro) */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          City / Town
        </label>
        <div className="relative">
          <input
            type="text"
            list="popular-city-list"
            placeholder="Type any city (e.g. Tirupati, Puttur)..."
            value={filters.city || ''}
            onChange={(e) => onFilterChange('city', e.target.value === 'All Cities' ? '' : e.target.value)}
            className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <datalist id="popular-city-list">
            {POPULAR_CITIES.map((c) => (
              <option key={c} value={c === 'All Cities' ? '' : c}>
                {c}
              </option>
            ))}
          </datalist>
        </div>
      </div>

      {/* BHK Selection */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Bedrooms (BHK)
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {BHK_OPTIONS.map((opt) => {
            const isSelected = (filters.bhk || '') === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onFilterChange('bhk', opt.value)}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Rent Range */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Max Rent (₹/Month)
        </label>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>₹5k</span>
          <span className="font-bold text-blue-600 text-sm">
            {filters.maxRent ? `Up to ₹${parseInt(filters.maxRent, 10).toLocaleString()}` : 'Any Budget'}
          </span>
          <span>₹70k+</span>
        </div>
        <input
          type="range"
          min="5000"
          max="70000"
          step="2500"
          value={filters.maxRent || '70000'}
          onChange={(e) => onFilterChange('maxRent', e.target.value === '70000' ? '' : e.target.value)}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Property Type
        </label>
        <select
          value={filters.propertyType || ''}
          onChange={(e) => onFilterChange('propertyType', e.target.value)}
          className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        >
          {PROPERTY_TYPES.map((pt) => (
            <option key={pt.label} value={pt.value}>
              {pt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tenant Preference */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Tenant Preference
        </label>
        <div className="space-y-1.5">
          {TENANT_PREFS.map((pref) => {
            const isChecked = (filters.tenantPreference || 'ANY') === pref.value;
            return (
              <label key={pref.value} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="tenantPreference"
                  checked={isChecked}
                  onChange={() => onFilterChange('tenantPreference', pref.value)}
                  className="accent-blue-600"
                />
                <span>{pref.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Furnishing */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Furnishing
        </label>
        <select
          value={filters.furnishingStatus || ''}
          onChange={(e) => onFilterChange('furnishingStatus', e.target.value)}
          className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        >
          {FURNISHING_OPTIONS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
