import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Building,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  CheckSquare,
  Compass,
  Sparkles,
  Navigation,
  CheckCircle2,
  Upload,
  Camera,
  Check
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import MapComponent from '../components/MapComponent';

const AMENITY_LIST = [
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

const PRESET_SAMPLE_PHOTOS = [
  {
    name: 'Modern Apartment',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'
  },
  {
    name: 'Luxury Villa',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
  },
  {
    name: 'Cozy Independent House',
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80'
  },
  {
    name: 'Spacious Living Hall',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'
  },
  {
    name: 'Contemporary Bedroom',
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80'
  },
  {
    name: 'Modular Kitchen Flat',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80'
  }
];

const SUGGESTED_CITIES = [
  'Bangalore',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Coimbatore',
  'Kochi',
  'Mysore',
  'Tirupati',
  'Visakhapatnam',
  'Vijayawada',
  'Mangalore',
  'Surat',
  'Vadodara',
  'Nagpur',
  'Bhopal',
  'Patna',
  'Bhubaneswar',
  'Guwahati',
  'Dehradun'
];

export default function OwnerAddProperty() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [bhk, setBhk] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [floorNumber, setFloorNumber] = useState(2);
  const [totalFloors, setTotalFloors] = useState(5);
  const [areaSqft, setAreaSqft] = useState(1100);
  const [furnishingStatus, setFurnishingStatus] = useState('FURNISHED');
  const [monthlyRent, setMonthlyRent] = useState(20000);
  const [securityDeposit, setSecurityDeposit] = useState(50000);
  const [maintenanceCharge, setMaintenanceCharge] = useState(2000);
  const [tenantPreference, setTenantPreference] = useState('ANY');

  // Location fields
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Koramangala');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560034');
  const [latitude, setLatitude] = useState(12.9352);
  const [longitude, setLongitude] = useState(77.6245);
  const [gpsDetectedName, setGpsDetectedName] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  // Amenities & Images
  const [selectedAmenities, setSelectedAmenities] = useState([
    'Wi-Fi / High-Speed Internet',
    'Covered Car Parking',
    '24/7 Power Backup'
  ]);
  const [imageUrl, setImageUrl] = useState(PRESET_SAMPLE_PHOTOS[0].url);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'preset' | 'url'
  const [uploadFileName, setUploadFileName] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const toggleAmenity = (name) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  // Handle local image file upload from device
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file (.jpg, .png, .webp)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('Image size should be less than 10MB');
      return;
    }

    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
      showSuccess(`Photo "${file.name}" uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  // Reverse geocodes ANY small town, village, or coordinates
  const handleMapLocationSelect = async (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setGeocoding(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.address) {
          const addr = data.address;
          const detectedCity =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.county ||
            addr.state_district ||
            'Custom City';

          const detectedArea =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            addr.road ||
            addr.village ||
            detectedCity;

          const detectedState = addr.state || '';
          const detectedPincode = addr.postcode || '';

          setCity(detectedCity);
          setArea(detectedArea);
          if (detectedState) setState(detectedState);
          if (detectedPincode) setPincode(detectedPincode);
          if (data.display_name) setAddress(data.display_name);

          const badgeName = `${detectedArea}, ${detectedCity} (${detectedState})`;
          setGpsDetectedName(badgeName);
          showSuccess(`📍 GPS Pinned: ${badgeName}`);
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        propertyType,
        bhk: parseInt(bhk, 10),
        bathrooms: parseInt(bathrooms, 10),
        floorNumber: parseInt(floorNumber, 10),
        totalFloors: parseInt(totalFloors, 10),
        areaSqft: parseFloat(areaSqft),
        furnishingStatus,
        monthlyRent: parseFloat(monthlyRent),
        securityDeposit: parseFloat(securityDeposit),
        maintenanceCharge: parseFloat(maintenanceCharge || 0),
        tenantPreference,
        address: address || `${area}, ${city}`,
        area,
        city,
        state,
        pincode,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        amenities: selectedAmenities,
        images: [{ url: imageUrl, imageType: 'LIVING_ROOM', displayOrder: 0 }]
      };

      const res = await api.post('/properties', payload);
      if (res.data.success) {
        showSuccess('Property listed successfully! Submitted for administrator verification.');
        navigate('/owner/dashboard');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to list property');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Owner Portal</span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          List a New Rental Property
        </h1>
        <p className="text-xs text-gray-500">Pick exact map location in any city or town to auto-fill property details.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6 text-xs">
        {/* Basic Info */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" /> Basic Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Listing Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Spacious 2 BHK Flat with Balcony near Railway Station"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Description</label>
              <textarea
                rows="3"
                required
                placeholder="Detailed description of layout, fixtures, ventilation, water supply, and nearby landmarks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              >
                <option value="APARTMENT">Apartment / Flat</option>
                <option value="VILLA">Villa</option>
                <option value="INDEPENDENT_HOUSE">Independent House</option>
                <option value="PG">PG / Co-living</option>
                <option value="ROOM">Single Room</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Bedrooms (BHK)</label>
              <select
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              >
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Bathrooms</label>
              <input
                type="number"
                min="1"
                max="10"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Area (sqft)</label>
              <input
                type="number"
                min="100"
                required
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Preferences */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-blue-600" /> Pricing & Preferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Monthly Rent (₹)</label>
              <input
                type="number"
                min="1000"
                required
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Maintenance Charge (₹)</label>
              <input
                type="number"
                min="0"
                value={maintenanceCharge}
                onChange={(e) => setMaintenanceCharge(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Furnishing</label>
              <select
                value={furnishingStatus}
                onChange={(e) => setFurnishingStatus(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              >
                <option value="FURNISHED">Furnished</option>
                <option value="SEMI_FURNISHED">Semi-Furnished</option>
                <option value="UNFURNISHED">Unfurnished</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tenant Preference</label>
              <select
                value={tenantPreference}
                onChange={(e) => setTenantPreference(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              >
                <option value="ANY">All Welcome</option>
                <option value="BACHELOR_ONLY">Bachelor Only</option>
                <option value="FAMILY_ONLY">Family Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Map & GPS Location Picker */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" /> Interactive Location & GPS Auto-Fill
              </h3>
              <p className="text-gray-500 text-[11px]">
                Click anywhere on map, use the Search bar for any small city/town, or tap "Use My GPS Location".
              </p>
            </div>
            {gpsDetectedName && (
              <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Detected: {gpsDetectedName}</span>
              </div>
            )}
          </div>

          {/* Map Picker Component */}
          <div className="h-80 w-full rounded-3xl overflow-hidden shadow-md border border-gray-200 relative">
            <MapComponent
              pickerMode={true}
              pickerLocation={{ lat: latitude, lng: longitude }}
              onLocationSelect={handleMapLocationSelect}
              showCityToolbar={true}
              height="h-80"
            />
          </div>

          {geocoding && (
            <div className="text-xs text-blue-600 font-bold animate-pulse flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Detecting location details via OpenStreetMap Nominatim...
            </div>
          )}

          {/* Form Fields: Supports Any Small City / Town */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block font-bold text-gray-700 mb-1">City / Town / District</label>
              <input
                type="text"
                list="city-suggestions"
                required
                placeholder="e.g. Puttur, Tirupati, Mysore..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold text-gray-900"
              />
              <datalist id="city-suggestions">
                {SUGGESTED_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Area / Locality</label>
              <input
                type="text"
                required
                placeholder="e.g. Puttur Urban, Gandhi Nagar..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                required
                placeholder="e.g. 517583"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Full Street Address (Auto-filled by GPS)</label>
              <input
                type="text"
                placeholder="Door No, Street Name, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">State</label>
              <input
                type="text"
                placeholder="e.g. Andhra Pradesh, Karnataka..."
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1 text-[11px]">Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full bg-gray-100 border rounded-xl p-2 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1 text-[11px]">Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full bg-gray-100 border rounded-xl p-2 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Photo Upload & Amenities Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-600" /> House Photo & Visuals
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold">Upload device photo or pick a sample</span>
          </div>

          {/* Photo Source Selector Tabs */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setImageTab('upload')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                imageTab === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload from Computer / Mobile
            </button>
            <button
              type="button"
              onClick={() => setImageTab('preset')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                imageTab === 'preset' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Pick from Sample Gallery
            </button>
            <button
              type="button"
              onClick={() => setImageTab('url')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                imageTab === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌐 Paste Web URL
            </button>
          </div>

          {/* Tab 1: Upload from Device */}
          {imageTab === 'upload' && (
            <div className="space-y-2">
              <label
                htmlFor="photo-file-upload"
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80 rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-xs text-blue-900">Click to upload photo from your device</span>
                  <p className="text-[11px] text-gray-500 mt-0.5">Supports PNG, JPG, JPEG, WEBP (Max 10MB)</p>
                </div>
                {uploadFileName && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5" /> Selected: {uploadFileName}
                  </span>
                )}
                <input
                  id="photo-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Tab 2: Pick from Sample Gallery Presets */}
          {imageTab === 'preset' && (
            <div className="space-y-2">
              <span className="text-[11px] text-gray-500 font-medium">Click any sample to use as your listing photo:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_SAMPLE_PHOTOS.map((preset, idx) => {
                  const isSelected = imageUrl === preset.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setImageUrl(preset.url);
                        setUploadFileName('');
                        showSuccess(`Selected: ${preset.name}`);
                      }}
                      className={`relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-2 transition group ${
                        isSelected ? 'border-blue-600 ring-2 ring-blue-500/40' : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white text-[10px] font-bold flex items-center justify-between">
                        <span className="truncate">{preset.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Paste Direct URL */}
          {imageTab === 'url' && (
            <div className="space-y-1">
              <label className="block font-bold text-gray-700">Direct Image URL (e.g. Unsplash or direct .jpg link)</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-2.5 font-medium"
              />
            </div>
          )}

          {/* Live Photo Preview Card */}
          {imageUrl && (
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-3">
              <img
                src={imageUrl}
                alt="Listing Preview"
                className="w-20 h-16 object-cover rounded-xl shadow-sm border border-gray-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Photo Loaded & Ready
                </span>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">This image will be displayed on the property search card and details page.</p>
              </div>
            </div>
          )}

          {/* Amenities Selector */}
          <div className="pt-2">
            <label className="block font-bold text-gray-700 mb-2">Select Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_LIST.map((amen) => {
                const isSelected = selectedAmenities.includes(amen);
                return (
                  <button
                    type="button"
                    key={amen}
                    onClick={() => toggleAmenity(amen)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition flex items-center gap-2 ${
                      isSelected ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <CheckSquare className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>{amen}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md transition"
        >
          {submitting ? 'Submitting Property...' : 'Submit Listing for Verification'}
        </button>
      </form>
    </div>
  );
}
