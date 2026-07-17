import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import { 
  HiOutlineSearch, 
  HiOutlineMap,
  HiOutlineTruck
} from 'react-icons/hi';
import GeospatialMap from '../components/common/GeospatialMap';

export default function DriverDashboard() {
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [activeRoutePoints, setActiveRoutePoints] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [pendingDispatch, setPendingDispatch] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const [routeRes, histRes, statsRes, notifRes] = await Promise.all([
        api.get('/driver/active-route'), 
        api.get('/driver/history'),
        api.get('/analytics/me'),
        api.get('/notifications')
      ]);
      
      const route = routeRes.data.route;
      const donations = route ? route.donations : [];
      setActiveDeliveries(donations);
      
      if (route && route.stops) {
        const points = route.stops.map(s => s.location.coordinates);
        setActiveRoutePoints(points);
        if (points.length > 0 && !currentLocation) {
          setCurrentLocation(points[0]);
        }
      } else {
        setActiveRoutePoints([]);
      }

      setCompletedDeliveries(histRes.data.deliveries || []);
      setStats(statsRes.data.stats || {});

      // Recover missed or pending dispatch alerts
      if (notifRes.data.success) {
        const dispatches = notifRes.data.notifications.filter(n => n.type === 'driver_assigned' && !n.read);
        if (dispatches.length > 0) {
          setPendingDispatch(dispatches[0]);
        }
      }

    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (socket) {
      socket.on('notification:new', (notification) => {
        if (notification.type === 'driver_assigned') {
          setPendingDispatch(notification);
          toast('New delivery dispatch received');
        }
      });
      return () => socket.off('notification:new');
    }
  }, [socket]);

  // Real GPS & Simulation Hook
  useEffect(() => {
    if (!user?.isOnline || !socket) return;

    let watchId;
    let simInterval;

    if (isSimulating && activeRoutePoints.length >= 2) {
      // Simulate movement from start to end
      let progress = 0;
      const start = activeRoutePoints[0];
      const end = activeRoutePoints[activeRoutePoints.length - 1];
      
      simInterval = setInterval(() => {
        progress += 0.02; // 2% per tick
        if (progress > 1) progress = 1;
        
        const currentLng = start[0] + (end[0] - start[0]) * progress;
        const currentLat = start[1] + (end[1] - start[1]) * progress;
        
        setCurrentLocation([currentLng, currentLat]);
        socket.emit('driver:location', {
          driverId: user._id,
          lat: currentLat,
          lng: currentLng,
          routeActive: activeDeliveries.length > 0
        });

        if (progress === 1) clearInterval(simInterval);
      }, 1000); // update every second
    } else if (!isSimulating && navigator.geolocation) {
      // Real GPS
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation([longitude, latitude]);
          socket.emit('driver:location', {
            driverId: user._id,
            lat: latitude,
            lng: longitude,
            routeActive: activeDeliveries.length > 0
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (simInterval) clearInterval(simInterval);
    };
  }, [user?.isOnline, isSimulating, activeRoutePoints, socket, activeDeliveries.length]);

  const toggleOnline = async () => {
    try {
      const res = await api.put('/driver/status');
      updateUser({ ...user, isOnline: res.data.isOnline });
      toast.success(res.data.isOnline ? 'You are now online' : 'You are now offline');
    } catch (e) { toast.error('Failed to update status'); }
  };

  const handleDispatch = async (accept) => {
    try {
      if (accept) {
        await api.post(`/driver/accept/${pendingDispatch.data.donationId}`);
        toast.success('Dispatch accepted.');
      }
      
      // Mark notification as read so it doesn't pop up again
      if (pendingDispatch?._id) {
        await api.put(`/notifications/${pendingDispatch._id}/read`);
      }

      setPendingDispatch(null);
      fetchData();
    } catch (e) { toast.error('Action failed'); }
  };

  const updateDelivery = async (deliveryId, status) => {
    setUpdating(true);
    try {
      await api.put(`/driver/delivery/${deliveryId}/status`, { status });
      toast.success(`Log updated to: ${status.replace('_', ' ')}`);
      fetchData();
    } catch (e) { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  const statusFlow = ['pickup_assigned', 'arrived', 'in_transit', 'delivered'];

  return (
    <div className="w-full">
      
      {/* Top Header - Editorial style */}
      <div className="flex items-end justify-between mb-12 border-b border-[var(--border)] pb-6">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Courier Desk</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">
            {user?.name || 'Courier'}
          </h1>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] flex items-center gap-2">
            Status: <span className="text-[var(--ink)]">{user?.isOnline ? 'Online' : 'Offline'}</span>
            <div className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-[var(--ink)]' : 'border border-[var(--ink-muted)]'}`} />
          </div>
          <button 
            onClick={toggleOnline}
            className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors border ${
              user?.isOnline 
                ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' 
                : 'bg-transparent text-[var(--ink)] border-[var(--ink)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {user?.isOnline ? 'Go Offline' : 'Go Online'}
          </button>
          {activeRoutePoints.length >= 2 && user?.isOnline && (
            <button 
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-4 py-1 text-[9px] font-bold tracking-widest uppercase transition-colors border ${
                isSimulating 
                  ? 'bg-[#10b981] text-white border-[#10b981]' 
                  : 'bg-transparent text-[var(--ink)] border-[var(--ink)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {isSimulating ? 'Stop Simulation' : 'Simulate Drive'}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard 
          label="Active Routes" 
          value={loading ? '...' : activeDeliveries.length} 
          icon={<HiOutlineTruck className="w-5 h-5" />} 
        />
        <MetricCard 
          label="Total Distance" 
          value={loading ? '...' : `${stats?.totalDistance || 0} km`} 
          icon={<HiOutlineMap className="w-5 h-5" />} 
        />
        <MetricCard 
          label="Completed Runs" 
          value={loading ? '...' : (stats?.completedDeliveries || 0)} 
        />
      </div>

      {/* Pending Dispatch Banner */}
      {pendingDispatch && (
        <div className="mb-8 border border-[var(--ink)] bg-[var(--surface)] p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)] mb-1">{pendingDispatch.title}</p>
            <div className="flex items-center gap-2 mt-2 text-[14px]">
              <span className="text-[var(--ink-muted)]">{pendingDispatch.message}</span>
            </div>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button onClick={() => handleDispatch(false)} className="px-6 py-2 border border-[var(--border)] text-[10px] font-bold tracking-widest uppercase hover:border-[var(--ink)]">
              Decline
            </button>
            <button onClick={() => handleDispatch(true)} className="px-6 py-2 bg-[var(--ink)] text-[var(--bg)] text-[10px] font-bold tracking-widest uppercase hover:opacity-80">
              Accept Route
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        
        {/* Active Deliveries */}
        <div className="card-minimal flex flex-col min-h-[500px]">
          <div className="p-6 flex justify-between items-center border-b border-[var(--border)]">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Active Manifest</h2>
          </div>
          <div className="flex-1 p-6 bg-[var(--surface-hover)] overflow-y-auto no-scrollbar">
            {loading ? (
              <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] text-center mt-10">Syncing...</p>
            ) : activeDeliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Manifest Empty</p>
                <p className="text-[12px] text-[var(--ink-muted)] mt-2">
                  {user?.isOnline ? 'Awaiting dispatch assignment.' : 'System offline.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeDeliveries.map(d => {
                  const currentIdx = statusFlow.indexOf(d.status);
                  const nextStatus = statusFlow[currentIdx + 1];

                  return (
                    <div key={d._id} className="bg-[var(--surface)] border border-[var(--border)] p-6 relative">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border)]">
                        <StatusBadge status={d.status} />
                        <span className="font-semibold tracking-tight text-[var(--ink)] text-[18px]">{d.totalServings} <span className="text-[12px] font-normal text-[var(--ink-muted)]">meals</span></span>
                      </div>

                      {/* Monochromatic Route Visual */}
                      <div className="relative mb-8 pl-6 border-l border-[var(--ink)] ml-2 space-y-6">
                        <div className="absolute -left-[4.5px] top-1 w-2 h-2 rounded-full bg-[var(--ink)]" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-1">Origin Point</p>
                          <p className="text-[15px] font-medium text-[var(--ink)]">{d.donor?.organizationName || d.donor?.name || 'Unknown Origin'}</p>
                        </div>
                        
                        <div className="absolute -left-[4.5px] bottom-1 w-2 h-2 rounded-full border-2 border-[var(--ink)] bg-[var(--surface)]" />
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-1">Destination</p>
                          <p className="text-[15px] font-medium text-[var(--ink)]">{d.matchedNGO?.organizationName || d.matchedNGO?.name || 'Unknown Destination'}</p>
                        </div>
                      </div>

                      {nextStatus && (
                        <button 
                          onClick={() => updateDelivery(d._id, nextStatus)} 
                          disabled={updating}
                          className="w-full py-3 bg-[var(--ink)] text-[var(--bg)] text-[11px] font-bold tracking-widest uppercase disabled:opacity-50 hover:opacity-80 transition-opacity"
                        >
                          {nextStatus === 'arrived' && 'Mark Arrived at Origin'}
                          {nextStatus === 'in_transit' && 'Log Transit Started'}
                          {nextStatus === 'delivered' && 'Confirm Final Handover'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live Route Map (Desktop only) */}
        <div className="hidden lg:block w-full h-[500px] border border-[var(--border)] overflow-hidden relative shadow-inner">
          <GeospatialMap 
            center={
              currentLocation 
                ? [currentLocation[1], currentLocation[0]] 
                : activeRoutePoints.length > 0 
                  ? [activeRoutePoints[0][1], activeRoutePoints[0][0]]
                  : (user?.location?.coordinates ? [user.location.coordinates[1], user.location.coordinates[0]] : [19.0760, 72.8777])
            }
            zoom={activeRoutePoints.length > 0 ? 14 : 11}
            donors={[]} 
            ngos={[]}
            routes={activeRoutePoints.length > 1 ? [{
              coordinates: activeRoutePoints.map(p => [p[1], p[0]])
            }] : []}
            drivers={currentLocation ? [{ 
              position: [currentLocation[1], currentLocation[0]], 
              name: user?.name, 
              type: 'driver' 
            }] : []}
          />
        </div>

        {/* History Log */}
        <div className="card-minimal flex flex-col min-h-[500px]">
          <div className="p-6 flex justify-between items-center border-b border-[var(--border)]">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Log</h2>
          </div>
          <div className="flex-1 p-6 bg-[var(--surface)] overflow-y-auto no-scrollbar">
            {completedDeliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">No log entries</p>
              </div>
            ) : (
              <div className="space-y-6">
                {completedDeliveries.map(d => (
                  <div key={d._id} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[13px] font-medium text-[var(--ink)] truncate max-w-[150px]">{d.donor?.organizationName || d.donor?.name || 'Unknown Origin'}</p>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)] border border-[var(--ink)] px-1.5 py-0.5">Done</span>
                    </div>
                    <p className="text-[12px] text-[var(--ink-muted)] truncate">→ {d.ngo?.organizationName || d.ngo?.name || 'Unknown Destination'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
