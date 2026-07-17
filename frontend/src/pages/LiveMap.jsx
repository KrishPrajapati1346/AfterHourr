import { useState, useEffect } from 'react';
import api from '../services/api';
import GeospatialMap from '../components/common/GeospatialMap';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function LiveMap() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [liveDrivers, setLiveDrivers] = useState({});
  const [center, setCenter] = useState(
    user?.location?.coordinates 
      ? [user.location.coordinates[1], user.location.coordinates[0]] 
      : [19.0760, 72.8777] // Default: Mumbai (not BLR anymore since user is based in Mumbai)
  );

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [donationsRes, ngosRes] = await Promise.all([
          api.get('/donations'),
          api.get('/ngo/list')
        ]);
        
        const newMarkers = [];
        const newRoutes = [];
        
        // Add NGO Hubs
        if (ngosRes.data.success && ngosRes.data.ngos) {
          ngosRes.data.ngos.forEach(ngo => {
            if (ngo.location && ngo.location.coordinates) {
              const [lng, lat] = ngo.location.coordinates;
              newMarkers.push({
                position: [lat, lng],
                name: ngo.organizationName || ngo.name,
                label: 'NGO Hub',
                type: 'hub'
              });
            }
          });
        }
        
        // Add Donors and Routes for active deliveries
        if (donationsRes.data.success && donationsRes.data.donations) {
          const active = donationsRes.data.donations.filter(d => 
            d.status === 'matched' || d.status === 'in_transit' || d.status === 'pending'
          );
          
          active.forEach(donation => {
            if (donation.pickupLocation && donation.pickupLocation.coordinates) {
              const [dlng, dlat] = donation.pickupLocation.coordinates;
              newMarkers.push({
                position: [dlat, dlng],
                name: donation.donor?.organizationName || 'Donor',
                label: 'Origin',
                type: 'origin'
              });
              
              if (donation.matchedNGO && donation.matchedNGO.location && donation.matchedNGO.location.coordinates) {
                const [nlng, nlat] = donation.matchedNGO.location.coordinates;
                newRoutes.push({
                  coordinates: [[dlat, dlng], [nlat, nlng]]
                });
              }
            }
          });
        }
        
        setMarkers(newMarkers);
        setRoutes(newRoutes);
        
        // If we have markers, center on the first one
        if (newMarkers.length > 0) {
          setCenter(newMarkers[0].position);
        }
      } catch (error) {
        console.error('Failed to fetch map data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('driver:moved', (data) => {
        // data contains: { driverId, lat, lng, routeActive }
        if (data.routeActive) {
          setLiveDrivers(prev => ({ ...prev, [data.driverId]: data }));
        } else {
          setLiveDrivers(prev => {
            const next = { ...prev };
            delete next[data.driverId];
            return next;
          });
        }
      });
      return () => socket.off('driver:moved');
    }
  }, [socket]);

  const driverMarkers = Object.values(liveDrivers).map(d => ({
    position: [d.lat, d.lng],
    name: `Courier #${d.driverId.slice(-4)}`,
    type: 'driver'
  }));

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col">
      <div className="mb-8 border-b border-[var(--border)] pb-6 flex justify-between items-end">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Geospatial</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">Live Territory</h1>
        </div>
      </div>

      <div className="w-full h-[75vh] min-h-[500px] border border-[var(--border)] bg-[var(--surface-hover)] relative overflow-hidden z-0">
        {loading ? (
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] animate-pulse">Initializing Geospatial Grid...</p>
        ) : (
          <GeospatialMap 
            center={center} 
            zoom={12}
            markers={markers}
            routes={routes}
            drivers={driverMarkers}
          />
        )}
      </div>
    </div>
  );
}
