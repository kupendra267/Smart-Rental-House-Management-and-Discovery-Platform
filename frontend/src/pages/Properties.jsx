import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Map, LayoutGrid, SlidersHorizontal, ArrowUpDown, X, AlertCircle, MapPin } from 'lucide-react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import FilterPanel from '../components/FilterPanel';
import MapComponent, { CITY_COORDINATES } from '../components/MapComponent';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read current query filters
  const page = parseInt(searchParams.get('page') || '1', 10);
  const city = searchParams.get('city') || '';
  const area = searchParams.get('area') || '';
  const bhk = searchParams.get('bhk') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const maxRent = searchParams.get('maxRent') || '';
  const tenantPreference = searchParams.get('tenantPreference') || '';
  const furnishingStatus = searchParams.get('furnishingStatus') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  const filters = {
    city,
    area,
    bhk,
    propertyType,
    maxRent,
    tenantPreference,
    furnishingStatus,
    sortBy
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/properties?${searchParams.toString()}`);
      if (res.data.success) {
        setProperties(res.data.data.properties);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', newPage.toString());
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Search Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-gray-200/80 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by area, landmark or keyword (e.g. Koramangala, Powai)..."
            value={area}
            onChange={(e) => handleFilterChange('area', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* View Toggle & Sorting */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest Listed</option>
              <option value="price_low_to_high">Price: Low to High</option>
              <option value="price_high_to_low">Price: High to Low</option>
              <option value="views">Most Popular</option>
            </select>
          </div>

          {/* List / Map Switcher */}
          <div className="bg-gray-100 p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Map className="w-3.5 h-3.5" /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Quick City Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px] shrink-0">Popular Metros:</span>
        {['All Cities', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'].map((cityName) => {
          const isSelected = (!city && cityName === 'All Cities') || city === cityName;
          return (
            <button
              key={cityName}
              onClick={() => handleFilterChange('city', cityName === 'All Cities' ? '' : cityName)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap flex items-center gap-1 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200/80 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
              <span>{cityName}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Layout: Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Results Grid / Map Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
            <span>
              Showing <strong className="text-gray-900">{properties.length}</strong> of{' '}
              <strong className="text-gray-900">{total}</strong> verified homes
              {city && ` in ${city}`}
            </span>
          </div>

          {/* View Mode: Map */}
          {viewMode === 'map' ? (
            <div className="h-[650px] w-full rounded-3xl overflow-hidden shadow-sm">
              <MapComponent
                properties={properties}
                selectedCity={city}
                onCitySelect={(c) => handleFilterChange('city', c)}
                showCityToolbar={true}
                height="h-[650px]"
              />
            </div>
          ) : (
            /* View Mode: List Grid */
            <>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100" />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-4 max-w-lg mx-auto">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No properties found</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Try adjusting your filters, increasing your budget ceiling, or selecting another nearby metro area.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePageChange(num)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                        page === num
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="font-bold text-gray-900 text-sm">Filters</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs"
            >
              View {total} Properties
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
