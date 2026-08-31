import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Maximize, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function PropertyCard({ property, isFavoriteInitial = false, onFavoriteToggle = null }) {
  const { isAuthenticated, role } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [loadingFav, setLoadingFav] = useState(false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || role !== 'TENANT') {
      showError('Please sign in as a Tenant to save favorite properties.');
      return;
    }

    setLoadingFav(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${property.id}`);
        setIsFavorite(false);
        showSuccess('Removed from saved properties');
      } else {
        await api.post(`/favorites/${property.id}`);
        setIsFavorite(true);
        showSuccess('Saved to your favorites ❤️');
      }
      if (onFavoriteToggle) onFavoriteToggle(property.id, !isFavorite);
    } catch (err) {
      showError('Could not update favorite status');
    } finally {
      setLoadingFav(false);
    }
  };

  const primaryImage =
    property.images && property.images.length > 0
      ? property.images[0].url
      : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Card Image & Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={primaryImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* AI Match Score Badge */}
          {property.matchPercentage !== undefined && property.matchPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-emerald-600/95 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{property.matchPercentage}% Match</span>
            </div>
          )}

          {/* Verified Property Badge */}
          {property.verificationStatus === 'APPROVED' && (
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-blue-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Verified
            </div>
          )}

          {/* Favorite Heart Button */}
          <button
            onClick={toggleFavorite}
            disabled={loadingFav}
            aria-label="Save property"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center text-gray-600 hover:text-rose-600 shadow-md transition-transform active:scale-90"
          >
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {formatCurrency(property.monthlyRent)}
              </span>
              <span className="text-xs font-medium text-gray-500"> / month</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Deposit: {formatCurrency(property.securityDeposit)}
            </span>
          </div>

          {/* Title */}
          <Link to={`/properties/${property.id}`}>
            <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition text-base">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center text-gray-500 text-xs mt-1.5 gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span className="truncate">
              {property.location?.area}, {property.location?.city}
            </span>
            {property.distanceKm && (
              <span className="text-blue-600 font-medium ml-auto">({property.distanceKm} km away)</span>
            )}
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-gray-100 text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-blue-600" />
              <span>{property.bhk} BHK</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-blue-600" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-blue-600" />
              <span>{property.areaSqft} sqft</span>
            </div>
          </div>

          {/* Key Reasons / Tags */}
          {property.reasons && property.reasons.length > 0 ? (
            <div className="space-y-1 mb-2 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/60">
              {property.reasons.slice(0, 2).map((r, i) => (
                <div key={i} className="text-[11px] text-blue-900 font-medium flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="truncate">{r}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700">
                {property.furnishingStatus?.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700">
                {property.tenantPreference === 'ANY' ? 'All Tenants Welcome' : property.tenantPreference?.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-5 pt-0">
        <Link
          to={`/properties/${property.id}`}
          className="w-full py-2.5 px-4 bg-gray-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl text-center block transition-colors duration-200 shadow-sm"
        >
          View Property Details
        </Link>
      </div>
    </div>
  );
}
