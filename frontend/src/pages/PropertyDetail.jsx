import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Layers,
  ShieldCheck,
  Heart,
  Share2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Star,
  MessageSquare,
  ArrowLeft,
  Scale,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MapComponent from '../components/MapComponent';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0]);
  const [occupants, setOccupants] = useState(1);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState('LISTING_DISCREPANCY');
  const [reportDesc, setReportDesc] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/properties/${id}`);
      if (res.data.success) {
        setProperty(res.data.data.property);
        setIsFavorite(res.data.data.property.isFavorite || false);
      }
    } catch (err) {
      showError('Property not found');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      showError('Please sign in to save properties');
      return;
    }
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${property.id}`);
        setIsFavorite(false);
        showSuccess('Removed from saved properties');
      } else {
        await api.post('/favorites', { propertyId: property.id });
        setIsFavorite(true);
        showSuccess('Saved to your favorites');
      }
    } catch (e) {
      showError('Failed to update favorites');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || role !== 'TENANT') {
      showError('Please sign in as a Tenant to submit a rental application.');
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      const res = await api.post('/applications', {
        propertyId: property.id,
        moveInDate: new Date(moveInDate),
        occupants: parseInt(occupants, 10),
        message
      });

      if (res.data.success) {
        showSuccess('Rental application submitted successfully! The owner has been notified.');
        setApplyModalOpen(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not submit application.';
      showError(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showError('Please sign in to submit a complaint.');
      return;
    }

    setReporting(true);
    try {
      await api.post('/complaints', {
        propertyId: property.id,
        category: reportCategory,
        description: reportDesc,
        priority: 'MEDIUM'
      });
      showSuccess('Report submitted to administrator for investigation.');
      setReportModalOpen(false);
      setReportDesc('');
    } catch (err) {
      showError('Failed to submit complaint');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl h-96 animate-pulse border border-gray-100" />
      </div>
    );
  }

  if (!property) return null;

  const images = property.images && property.images.length > 0 ? property.images : [
    { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=80', imageType: 'LIVING_ROOM' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <Link to="/properties" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to={`/compare?ids=${property.id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl transition"
          >
            <Scale className="w-3.5 h-3.5" /> Compare this House
          </Link>
          <button
            onClick={() => setReportModalOpen(true)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1.5 rounded-xl transition hover:bg-rose-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Report Listing
          </button>
        </div>
      </div>

      {/* Property Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {property.propertyType?.replace('_', ' ')}
            </span>
            {property.verificationStatus === 'APPROVED' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Listing
              </span>
            )}
            {property.tenantPreference && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                {property.tenantPreference === 'ANY'
                  ? '✓ All Welcome'
                  : property.tenantPreference === 'BACHELOR_ONLY'
                  ? '✓ Bachelor Allowed'
                  : '✓ Family Only'}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {property.title}
          </h1>
          <div className="flex items-center text-gray-500 text-xs mt-1 gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{property.location?.address || `${property.location?.area}, ${property.location?.city}`}</span>
          </div>
        </div>

        {/* Price Box */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm text-right shrink-0">
          <div className="text-2xl font-black text-blue-600">
            ₹{property.monthlyRent?.toLocaleString()}<span className="text-xs font-normal text-gray-500"> / month</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Deposit: ₹{property.securityDeposit?.toLocaleString()} • Maintenance: ₹{property.maintenanceCharge || 0}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Large Photo */}
        <div className="lg:col-span-3 aspect-[16/9] rounded-3xl overflow-hidden bg-gray-100 shadow-sm relative">
          <img
            src={images[activeImageIdx]?.url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
            {images[activeImageIdx]?.imageType?.replace('_', ' ') || 'Gallery'}
          </div>
        </div>

        {/* Thumbnail Selector */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-[400px]">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`relative rounded-2xl overflow-hidden aspect-[4/3] w-24 lg:w-full shrink-0 border-2 transition ${
                activeImageIdx === idx ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Details & Application Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Specs, Amenities, Map, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Key Specs Bar */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Bed className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <span className="text-xs text-gray-500">Bedrooms</span>
              <div className="font-bold text-gray-900 text-sm">{property.bhk} BHK</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Bath className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <span className="text-xs text-gray-500">Bathrooms</span>
              <div className="font-bold text-gray-900 text-sm">{property.bathrooms} Baths</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Maximize className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <span className="text-xs text-gray-500">Built-up Area</span>
              <div className="font-bold text-gray-900 text-sm">{property.areaSqft} sqft</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <Layers className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <span className="text-xs text-gray-500">Floor Level</span>
              <div className="font-bold text-gray-900 text-sm">{property.floorNumber} / {property.totalFloors}</div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-3">
            <h3 className="font-extrabold text-base text-gray-900">About this Property</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900">Included Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(property.amenities || []).map((item, idx) => {
                const name = item.amenity?.name || item.name || (typeof item === 'string' ? item : 'Amenity');
                return (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-semibold text-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Map Location */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" /> Geographic Location
            </h3>
            <div className="h-72 w-full rounded-2xl overflow-hidden">
              <MapComponent properties={[property]} zoom={14} />
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Reviews ({property.reviews?.length || 0})
              </h3>
            </div>

            <div className="space-y-3">
              {(property.reviews || []).map((rev, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-gray-900">{rev.reviewer?.fullName || 'Verified Tenant'}</div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {rev.rating} / 5
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Owner Card, Favorite & Apply Box */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Owner Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Property Listed By</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 font-black text-base flex items-center justify-center">
                {property.owner?.user?.fullName ? property.owner.user.fullName[0] : 'O'}
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">{property.owner?.user?.fullName || 'Verified Owner'}</div>
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Identity Verified Owner
                </div>
              </div>
            </div>

            {/* Favorite & Compare Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={toggleFavorite}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>

              <Link
                to={`/compare?ids=${property.id}`}
                className="py-2.5 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition flex items-center justify-center gap-1.5"
              >
                <Scale className="w-4 h-4 text-blue-600" />
                <span>Compare</span>
              </Link>
            </div>

            {/* Apply Button */}
            {property.status === 'AVAILABLE' ? (
              <button
                onClick={() => setApplyModalOpen(true)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md transition transform active:scale-95"
              >
                Apply for this House
              </button>
            ) : (
              <div className="w-full py-3 bg-gray-100 text-gray-500 text-center rounded-2xl font-bold text-xs">
                Property Currently Rented
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-gray-900 text-sm">Submit Rental Application</h3>
              <button onClick={() => setApplyModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Move-in Date</label>
                <input
                  type="date"
                  required
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Number of Occupants</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={occupants}
                  onChange={(e) => setOccupants(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Message to Owner (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Introduce yourself, your profession, and questions for the owner..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-gray-900 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {applying ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-gray-900 text-sm">Report Suspicious Property</h3>
              <button onClick={() => setReportModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Reason for Complaint</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-gray-900 font-medium"
                >
                  <option value="LISTING_DISCREPANCY">Discrepancy in Rent / Photos</option>
                  <option value="FAKE_PROPERTY">Fake / Duplicate Property</option>
                  <option value="SUSPICIOUS_OWNER">Suspicious Owner Behavior</option>
                  <option value="OTHER">Other Violation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the issue in detail for admin investigation..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-gray-900 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {reporting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
