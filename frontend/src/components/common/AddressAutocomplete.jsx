import React, { useState, useEffect, useRef } from 'react';

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  onLocationSelect, 
  placeholder = "Start typing your address...",
  className = ""
}) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchAddress = async () => {
      if (!query || query.length < 3 || !showDropdown) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Using OpenStreetMap's free Nominatim API for geocoding
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchAddress, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [query, showDropdown]);

  const handleSelect = (item) => {
    const address = item.display_name;
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    
    // Attempt to extract city from display_name
    const parts = address.split(',').map(p => p.trim());
    let city = parts.length > 2 ? parts[parts.length - 3] : parts[0];

    setQuery(address);
    setShowDropdown(false);
    
    if (onChange) {
      onChange({ target: { name: 'address', value: address } });
    }
    
    if (onLocationSelect) {
      onLocationSelect({
        address,
        city,
        coordinates: [lon, lat] // MongoDB uses [longitude, latitude]
      });
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
          if (onChange) {
            onChange({ target: { name: 'address', value: e.target.value } });
          }
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {showDropdown && (query.length >= 3) && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--surface)] border border-[var(--ink)] shadow-2xl max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="p-3 text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">
              Scanning Geospatial Data...
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((item, idx) => (
                <li 
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="p-3 border-b border-[var(--border)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors last:border-b-0"
                >
                  <p className="text-[13px] text-[var(--ink)] truncate">{item.display_name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
