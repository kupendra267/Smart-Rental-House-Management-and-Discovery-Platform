import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Compass, Layers, Building, Sparkles, Search, Loader2, X } from 'lucide-react';

// Fix Leaflet Default Marker Icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Major City Coordinates Preset
export const CITY_COORDINATES = {
  'All': { lat: 20.5937, lng: 78.9629, zoom: 5, label: 'All India' },
  'Bangalore': { lat: 12.9716, lng: 77.5946, zoom: 12, label: 'Bangalore' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 12, label: 'Mumbai' },
  'Delhi NCR': { lat: 28.6139, lng: 77.2090, zoom: 11, label: 'Delhi NCR' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 12, label: 'Hyderabad' },
  'Pune': { lat: 18.5204, lng: 73.8567, zoom: 12, label: 'Pune' },
};

// Custom price pin icon
const createPriceIcon = (rent, bhk) => {
  const formatted = `₹${(rent / 1000).toFixed(0)}k`;
  return L.divIcon({
    className: 'custom-price-pin',
    html: `<div style="background: linear-gradient(135deg, #1d4ed8, #2563eb); color: white; padding: 4px 9px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4); border: 2px solid white; display: flex; align-items: center; gap: 3px; white-space: nowrap;">
      <span>${formatted}</span>
      <span style="opacity: 0.85; font-size: 9px; font-weight: 600;">(${bhk}B)</span>
    </div>`,
    iconSize: [52, 26],
    iconAnchor: [26, 26]
  });
};

// Custom User Location Pin
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-pin',
    html: `<div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; inset: 0; background-color: #3b82f6; opacity: 0.5; border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; inset: 3px; background-color: #2563eb; border: 3px solid white; border-radius: 9999px; box-shadow: 0 3px 6px rgba(0,0,0,0.3);"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Custom Picker Pin (For Add Property Mode)
const createPickerIcon = () => {
  return L.divIcon({
    className: 'custom-picker-pin',
    html: `<div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 7px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); border: 2px solid white; display: flex; align-items: center; justify-content: center;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });
};

// Map Controller for Smooth FlyTo animations
function MapViewController({ targetCenter, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetCenter && targetCenter[0] && targetCenter[1]) {
      map.flyTo(targetCenter, targetZoom || 13, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [targetCenter, targetZoom, map]);
  return null;
}

// Click listener for picker mode
function LocationPickerHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export default function MapComponent({
  properties = [],
  selectedCity = '',
  onCitySelect = null,
  pickerMode = false,
  pickerLocation = null,
  onLocationSelect = null,
  showCityToolbar = true,
  height = 'min-h-[450px]'
}) {
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Sync with selectedCity or pickerLocation
  useEffect(() => {
    if (pickerLocation && pickerLocation.lat && pickerLocation.lng) {
      setMapCenter([pickerLocation.lat, pickerLocation.lng]);
      setMapZoom(14);
    } else if (selectedCity && CITY_COORDINATES[selectedCity]) {
      const coord = CITY_COORDINATES[selectedCity];
      setMapCenter([coord.lat, coord.lng]);
      setMapZoom(coord.zoom);
    } else if (properties.length > 0) {
      const first = properties.find(p => p.location?.latitude && p.location?.longitude);
      if (first) {
        setMapCenter([first.location.latitude, first.location.longitude]);
        setMapZoom(12);
      }
    }
  }, [selectedCity, pickerLocation, properties]);

  // Real-time GPS Location Detection
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
        setLocating(false);

        if (onLocationSelect) {
          onLocationSelect(latitude, longitude);
        }
      },
      (error) => {
        setLocating(false);
        console.warn('Geolocation error:', error.message);
        alert('Could not access GPS. Please check browser location permissions or type your town name in the search box.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search any small town / city / landmark via OpenStreetMap Nominatim
  const handleSearchLocation = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=5&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        if (data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lon = parseFloat(first.lon);
          setMapCenter([lat, lon]);
          setMapZoom(14);
          if (onLocationSelect && pickerMode) {
            onLocationSelect(lat, lon);
          }
        }
      }
    } catch (err) {
      console.warn('Search geocode error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setMapCenter([lat, lon]);
    setMapZoom(15);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);

    if (onLocationSelect) {
      onLocationSelect(lat, lon);
    }
  };

  const validProperties = properties.filter(
    (p) => p.location && p.location.latitude && p.location.longitude
  );

  return (
    <div className={`w-full h-full ${height} rounded-3xl overflow-hidden border border-gray-200/80 shadow-md relative flex flex-col`}>
      {/* Top Floating Control Bar */}
      {showCityToolbar && (
        <div className="absolute top-3 left-3 right-3 z-[400] flex flex-col gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Live Search Any City / Small Town Box */}
            <form
              onSubmit={handleSearchLocation}
              className="relative flex-1 max-w-md pointer-events-auto shadow-lg rounded-2xl"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="🔍 Search any town, city, or village (e.g. Puttur, Tirupati, Mysore)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-2.5 bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn text-xs divide-y divide-gray-50">
                  <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase flex items-center justify-between">
                    <span>Matching Locations</span>
                    <button type="button" onClick={() => setSearchResults([])}><X className="w-3.5 h-3.5" /></button>
                  </div>
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchResult(r)}
                      className="w-full text-left px-3 py-2.5 hover:bg-blue-50 text-gray-800 font-medium flex items-center gap-2 transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{r.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* GPS My Location Button */}
            <button
              type="button"
              onClick={handleGetGPSLocation}
              disabled={locating}
              className="px-3.5 py-2.5 bg-slate-900/95 hover:bg-slate-950 backdrop-blur-md text-white rounded-2xl text-xs font-bold shadow-lg border border-slate-700 pointer-events-auto flex items-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Locating GPS...' : '📍 Use My GPS Location'}</span>
            </button>
          </div>

          {/* Preset City Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto max-w-full">
            {Object.keys(CITY_COORDINATES).map((cName) => {
              const isSelected = selectedCity === cName || (cName === 'All' && !selectedCity);
              const count = cName === 'All'
                ? validProperties.length
                : validProperties.filter(p => p.location?.city?.toLowerCase().includes(cName.toLowerCase())).length;

              return (
                <button
                  key={cName}
                  type="button"
                  onClick={() => {
                    const coord = CITY_COORDINATES[cName];
                    setMapCenter([coord.lat, coord.lng]);
                    setMapZoom(coord.zoom);
                    if (onCitySelect) onCitySelect(cName === 'All' ? '' : cName);
                  }}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-sm whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/80'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span>{cName}</span>
                  {count > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-black/10 rounded-full font-extrabold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 w-full h-full min-h-[400px] relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full min-h-[400px]"
        >
          <MapViewController targetCenter={mapCenter} targetZoom={mapZoom} />
          {pickerMode && <LocationPickerHandler onLocationSelect={onLocationSelect} />}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User GPS Location Marker */}
          {userLocation && (
            <>
              <Marker position={userLocation} icon={createUserLocationIcon()}>
                <Popup>
                  <div className="text-xs font-bold text-gray-900 p-1">
                    📍 Your Detected GPS Location
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={userLocation}
                radius={2000}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.12, weight: 1.5 }}
              />
            </>
          )}

          {/* Property Marker when Owner clicks or GPS sets location */}
          {pickerLocation && pickerLocation.lat && pickerLocation.lng && (
            <Marker position={[pickerLocation.lat, pickerLocation.lng]} icon={createPickerIcon()}>
              <Popup>
                <div className="text-xs font-bold text-gray-900 p-1">
                  📍 Pinned House Coordinates:<br />
                  <span className="font-mono text-blue-600 font-bold">{pickerLocation.lat.toFixed(5)}, {pickerLocation.lng.toFixed(5)}</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Candidate Property Markers */}
          {!pickerMode && validProperties.map((p) => {
            const img = p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80';

            return (
              <Marker
                key={p.id}
                position={[p.location.latitude, p.location.longitude]}
                icon={createPriceIcon(p.monthlyRent, p.bhk)}
              >
                <Popup className="custom-leaflet-popup" minWidth={240}>
                  <div className="w-56 overflow-hidden rounded-xl">
                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <img src={img} alt={p.title} className="w-full h-full object-cover" />
                      {p.matchPercentage && (
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Sparkles className="w-3 h-3 text-yellow-300" />
                          {p.matchPercentage}% Match
                        </div>
                      )}
                    </div>

                    <div className="font-bold text-xs text-gray-900 line-clamp-1">{p.title}</div>
                    <div className="text-blue-600 font-black text-sm mt-0.5">
                      ₹{p.monthlyRent.toLocaleString()}<span className="text-[11px] text-gray-500 font-normal"> / month</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1 pb-2 border-b border-gray-100">
                      <span>{p.bhk} BHK • {p.areaSqft} sqft</span>
                      <span className="font-medium text-gray-700">{p.location.area}, {p.location.city}</span>
                    </div>

                    <Link
                      to={`/properties/${p.id}`}
                      className="mt-2 block w-full py-1.5 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                    >
                      View House Details &rarr;
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
