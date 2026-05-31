import { useState, useRef, useEffect } from 'react';
import { Save, Search, MapPin } from 'lucide-react';
import type { Profile } from '../lib/db';

interface BirthFormProps {
  onSubmit: (profile: Profile, saveProfile: boolean) => void;
  initialProfile?: Profile | null;
}

export const BirthForm: React.FC<BirthFormProps> = ({ onSubmit, initialProfile }) => {
  const [name, setName] = useState(initialProfile?.name || '');
  
  // Date Fields
  const [dd, setDd] = useState(initialProfile ? initialProfile.birth_date.split('-')[2] : '');
  const [mm, setMm] = useState(initialProfile ? initialProfile.birth_date.split('-')[1] : '');
  const [yyyy, setYyyy] = useState(initialProfile ? initialProfile.birth_date.split('-')[0] : '');
  const ddRef = useRef<HTMLInputElement>(null);
  const mmRef = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);

  const [time, setTime] = useState(initialProfile?.birth_time || '');
  
  // Location Fields
  const [locMode, setLocMode] = useState<'search' | 'manual'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lat, setLat] = useState(initialProfile ? String(initialProfile.latitude) : '6.9271');
  const [lng, setLng] = useState(initialProfile ? String(initialProfile.longitude) : '79.8612');
  const [selectedCityName, setSelectedCityName] = useState(initialProfile?.name ? 'Saved Location' : 'Colombo');

  const [shouldSave, setShouldSave] = useState(false);

  // Debounced Search for Nominatim
  useEffect(() => {
    if (locMode !== 'search' || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Geocoding fetch failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, locMode]);

  const handleSelectLocation = (place: any) => {
    setLat(parseFloat(place.lat).toFixed(4));
    setLng(parseFloat(place.lon).toFixed(4));
    setSelectedCityName(place.display_name.split(',')[0]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'dd'|'mm'|'yyyy') => {
    const val = e.target.value.replace(/\D/g, ''); // Numbers only
    if (field === 'dd') {
      if (val.length <= 2) setDd(val);
      if (val.length === 2 && parseInt(val) > 0 && parseInt(val) <= 31) mmRef.current?.focus();
    } else if (field === 'mm') {
      if (val.length <= 2) setMm(val);
      if (val.length === 2 && parseInt(val) > 0 && parseInt(val) <= 12) yyyyRef.current?.focus();
    } else if (field === 'yyyy') {
      if (val.length <= 4) setYyyy(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date
    const d = parseInt(dd);
    const m = parseInt(mm);
    const y = parseInt(yyyy);
    
    if (!name || !d || !m || !y || !time || !lat || !lng) return;
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1000) {
      alert("Please enter a valid date.");
      return;
    }

    // Format YYYY-MM-DD
    const formattedDate = `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;

    const profile: Profile = {
      id: crypto.randomUUID(),
      name,
      birth_date: formattedDate,
      birth_time: time,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    };

    onSubmit(profile, shouldSave);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-sm border border-slate-300 dark:border-slate-700 p-4">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Birth Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-none focus:ring-1 focus:ring-slate-500 dark:bg-slate-800 dark:text-white outline-none"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Date of Birth</label>
            <div className="flex items-center gap-1 w-full">
              <input
                ref={ddRef}
                type="text"
                placeholder="DD"
                required
                className="w-full min-w-[3rem] px-2 py-1.5 text-sm text-center border border-slate-300 dark:border-slate-700 rounded-none focus:ring-1 focus:ring-slate-500 dark:bg-slate-800 dark:text-white outline-none"
                value={dd}
                onChange={(e) => handleDateChange(e, 'dd')}
              />
              <span className="text-slate-400">/</span>
              <input
                ref={mmRef}
                type="text"
                placeholder="MM"
                required
                className="w-full min-w-[3rem] px-2 py-1.5 text-sm text-center border border-slate-300 dark:border-slate-700 rounded-none focus:ring-1 focus:ring-slate-500 dark:bg-slate-800 dark:text-white outline-none"
                value={mm}
                onChange={(e) => handleDateChange(e, 'mm')}
              />
              <span className="text-slate-400">/</span>
              <input
                ref={yyyyRef}
                type="text"
                placeholder="YYYY"
                required
                className="w-full min-w-[4rem] px-2 py-1.5 text-sm text-center border border-slate-300 dark:border-slate-700 rounded-none focus:ring-1 focus:ring-slate-500 dark:bg-slate-800 dark:text-white outline-none"
                value={yyyy}
                onChange={(e) => handleDateChange(e, 'yyyy')}
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Time of Birth</label>
            <input
              type="time"
              required
              className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-none focus:ring-1 focus:ring-slate-500 dark:bg-slate-800 dark:text-white outline-none"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-none">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Birth Location</label>
            <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5">
              <button 
                type="button"
                onClick={() => setLocMode('search')}
                className={`px-2 py-0.5 text-xs font-medium transition-colors ${locMode === 'search' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-500' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Search
              </button>
              <button 
                type="button"
                onClick={() => setLocMode('manual')}
                className={`px-2 py-0.5 text-xs font-medium transition-colors ${locMode === 'manual' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-500' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Manual
              </button>
            </div>
          </div>

          {locMode === 'search' ? (
            <div className="relative">
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedCityName}</span>
                <span className="text-[10px] text-slate-500">({lat}, {lng})</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-none focus:ring-1 focus:ring-slate-500 dark:bg-slate-800 dark:text-white outline-none"
                  placeholder="City query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Autocomplete Dropdown */}
              {(searchResults.length > 0 || isSearching) && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-md max-h-48 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-2 text-xs text-slate-500 text-center">Searching...</div>
                  ) : (
                    searchResults.map((place, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectLocation(place)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm border-b last:border-0 border-slate-200 dark:border-slate-700"
                      >
                        <div className="font-medium text-slate-800 dark:text-slate-200">{place.display_name.split(',')[0]}</div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">{place.display_name}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-none focus:ring-1 focus:ring-slate-500 dark:bg-slate-800 dark:text-white outline-none"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-none focus:ring-1 focus:ring-slate-500 dark:bg-slate-800 dark:text-white outline-none"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
          <label className="flex items-center space-x-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={shouldSave}
                onChange={(e) => setShouldSave(e.target.checked)}
              />
              <div className="w-4 h-4 border border-slate-400 rounded-none peer-checked:bg-slate-800 peer-checked:border-slate-800 dark:peer-checked:bg-slate-200 dark:peer-checked:border-slate-200 transition-colors"></div>
              <Save className="absolute w-2.5 h-2.5 text-white dark:text-slate-900 opacity-0 peer-checked:opacity-100 pointer-events-none" />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Save Offline
            </span>
          </label>

          <button
            type="submit"
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-none active:scale-95 transition-transform"
          >
            Calculate
          </button>
        </div>
      </form>
    </div>
  );
};
