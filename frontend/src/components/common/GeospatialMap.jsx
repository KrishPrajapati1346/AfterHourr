import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../context/ThemeContext';

// Fix for default Leaflet icon paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Minimalist Icons
const createCustomIcon = (isDark, type = 'default') => {
  const color = isDark ? '#e4e6ef' : '#1a1d2e'; // match --ink
  const bgColor = isDark ? '#131728' : '#ffffff'; // match --bg
  
  let svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${type === 'origin' ? color : bgColor}" stroke="${color}" stroke-width="2">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" fill="${type === 'origin' ? bgColor : color}" />
    </svg>
  `;

  if (type === 'driver') {
    svgTemplate = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="${bgColor}" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" fill="${bgColor}" />
      </svg>
    `;
  }

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: svgTemplate,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

function RecenterButton({ center, zoom }) {
  const map = useMap();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        map.flyTo(center, zoom, { duration: 1.5 });
      }}
      className="absolute bottom-6 right-6 z-[1000] bg-[var(--ink)] text-[var(--bg)] p-3 rounded-none shadow-2xl hover:bg-opacity-80 transition-all border border-[var(--border)]"
      title="Recenter Map"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </button>
  );
}

export default function GeospatialMap({ 
  center = [12.9716, 77.5946], // Default: Bangalore
  zoom = 12,
  markers = [], 
  routes = [],
  drivers = []
}) {
  const { isDark } = useTheme();
  
  // Choose CartoDB base map based on theme
  const tileUrl = isDark 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url={tileUrl}
        />
        
        <RecenterButton center={center} zoom={zoom} />
        
        {routes.map((route, idx) => (
          <Polyline 
            key={idx} 
            positions={route.coordinates} 
            color={isDark ? '#e4e6ef' : '#1a1d2e'} 
            weight={2}
            dashArray="4, 6"
            opacity={0.5}
          />
        ))}

        {markers.map((marker, idx) => (
          <Marker 
            key={idx} 
            position={marker.position} 
            icon={createCustomIcon(isDark, marker.type)}
          >
            <Popup className="minimal-popup">
              <div className="p-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">{marker.label}</p>
                <p className="text-[13px] font-semibold">{marker.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {drivers.map((driver, idx) => (
          <Marker 
            key={`driver-${idx}`} 
            position={driver.position} 
            icon={createCustomIcon(isDark, driver.type)}
          >
            <Popup className="minimal-popup">
              <div className="p-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Active Courier</p>
                <p className="text-[13px] font-semibold">{driver.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* CSS Override for Leaflet Popup to match theme */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: ${isDark ? '#131728' : '#ffffff'};
          color: ${isDark ? '#e4e6ef' : '#1a1d2e'};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.8)'};
          border-radius: 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .leaflet-popup-tip {
          background: ${isDark ? '#131728' : '#ffffff'};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.8)'};
        }
        .leaflet-container {
          background: ${isDark ? '#131728' : '#ffffff'};
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
