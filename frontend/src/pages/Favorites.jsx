import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/favorites');
      if (res.data.success) {
        setFavorites(res.data.data.favorites || []);
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (propId, isFav) => {
    if (!isFav) {
      setFavorites(favorites.filter(p => p.id !== propId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Saved Homes</span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> My Favorite Properties
          </h1>
        </div>
        <Link to="/properties" className="text-xs font-semibold text-blue-600 hover:underline">
          Explore More Houses &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-3 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-900 text-base">No saved properties</h3>
          <p className="text-xs text-gray-500">
            Bookmark houses that match your taste while exploring to review them later.
          </p>
          <Link
            to="/properties"
            className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition"
          >
            Explore Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isFavoriteInitial={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
