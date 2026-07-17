import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import { 
  HiOutlineSearch, 
  HiOutlineInboxIn,
  HiOutlineTruck,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import AddressAutocomplete from '../components/common/AddressAutocomplete';
import GeospatialMap from '../components/common/GeospatialMap';

export default function NGODashboard() {
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();
  const [availableDonations, setAvailableDonations] = useState([]);
  const [activeClaims, setActiveClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchCoords, setSearchCoords] = useState(null);
  const [liveDrivers, setLiveDrivers] = useState({});

  const fetchData = async () => {
    try {
      let queryParams = '';
      if (searchCoords) {
        queryParams = `?lat=${searchCoords[1]}&lng=${searchCoords[0]}`;
      }
      const [availRes, claimsRes, statsRes] = await Promise.all([
        api.get(`/ngo/nearby-donations${queryParams}`),
        api.get('/ngo/claims'),
        api.get('/analytics/me')
      ]);
      setAvailableDonations(availRes.data.donations || []);
      setActiveClaims(claimsRes.data.donations || []);
      setStats(statsRes.data.stats || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [searchCoords]);

  useEffect(() => {
    if (socket) {
      socket.on('newDonation', (donation) => {
        setAvailableDonations(prev => [donation, ...prev]);
        toast('New surplus available');
      });
      socket.on('donationClaimed', ({ donationId }) => {
        setAvailableDonations(prev => prev.filter(d => d._id !== donationId));
      });
      socket.on('deliveryUpdate', () => fetchData());
      socket.on('driver:moved', (data) => {
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

      return () => {
        socket.off('newDonation');
        socket.off('donationClaimed');
        socket.off('deliveryUpdate');
        socket.off('driver:moved');
      };
    }
  }, [socket]);

  const claimDonation = async (id) => {
    try {
      await api.post(`/donations/${id}/claim`);
      toast.success('Surplus claimed successfully.');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to claim');
    }
  };

  const toggleEmergency = async () => {
    try {
      const res = await api.put('/ngo/emergency');
      updateUser({ ...user, emergencyNeed: res.data.emergencyNeed });
      toast.success(res.data.emergencyNeed ? 'Emergency mode enabled' : 'Emergency mode disabled');
    } catch (e) { toast.error('Failed to update status'); }
  };

  const pendingClaims = activeClaims.filter(c => c.status !== 'delivered');
  const completedClaims = activeClaims.filter(c => c.status === 'delivered');

  // Map Data Builders
  const mapCenter = user?.location?.coordinates 
    ? [user.location.coordinates[1], user.location.coordinates[0]] 
    : [19.0760, 72.8777];

  const mapMarkers = [
    ...(user?.location?.coordinates ? [{ position: mapCenter, name: user.organizationName || 'HQ', type: 'hub', label: 'NGO Hub' }] : []),
    ...pendingClaims
      .filter(c => c.pickupLocation?.coordinates)
      .map(c => ({
        position: [c.pickupLocation.coordinates[1], c.pickupLocation.coordinates[0]],
        name: c.donor?.organizationName || 'Donor',
        type: 'origin',
        label: 'Pickup Location'
      }))
  ];

  const mapRoutes = pendingClaims
    .filter(c => c.pickupLocation?.coordinates && user?.location?.coordinates)
    .map(c => ({
      coordinates: [
        [c.pickupLocation.coordinates[1], c.pickupLocation.coordinates[0]],
        mapCenter
      ]
    }));

  const driverMarkers = Object.values(liveDrivers).map(d => ({
    position: [d.lat, d.lng],
    name: `Courier #${d.driverId.slice(-4)}`,
    type: 'driver'
  }));

  return (
    <div className="w-full">
      
      {/* Top Header - Editorial style */}
      <div className="flex items-end justify-between mb-12 border-b border-[var(--border)] pb-6">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Community Hub</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">
            {user?.organizationName || 'Intake Desk'}
          </h1>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">
            Capacity: <span className="text-[var(--ink)]">{user?.currentLoad}/{user?.capacity}</span>
          </div>
          <button 
            onClick={toggleEmergency}
            className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors border ${
              user?.emergencyNeed 
                ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' 
                : 'bg-transparent text-[var(--ink)] border-[var(--ink)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            {user?.emergencyNeed ? 'Emergency Active' : 'Enable Emergency'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard 
          label="Incoming Deliveries" 
          value={loading ? '...' : pendingClaims.length} 
          icon={<HiOutlineTruck className="w-5 h-5" />} 
        />
        <MetricCard 
          label="Total Received" 
          value={loading ? '...' : (stats?.totalMealsReceived || 0)} 
          icon={<HiOutlineInboxIn className="w-5 h-5" />} 
        />
        <MetricCard 
          label="Network Status" 
          value="Online" 
          icon={<HiOutlineLightningBolt className="w-5 h-5" />} 
        />
      </div>

      {/* Live Map Area */}
      <div className="w-full h-[350px] border border-[var(--border)] mb-8 overflow-hidden relative shadow-inner bg-[var(--surface-hover)]">
        <GeospatialMap 
          center={mapCenter} 
          zoom={12}
          markers={mapMarkers}
          routes={mapRoutes}
          drivers={driverMarkers}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Available Surplus */}
        <div className="card-minimal flex flex-col min-h-[500px]">
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[var(--border)] gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Available Surplus</h2>
              <div className="w-2 h-2 rounded-full bg-[var(--ink)] animate-pulse" />
            </div>
            <div className="w-full md:w-64 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] w-4 h-4" />
              <AddressAutocomplete 
                placeholder="Scan another territory..."
                onLocationSelect={(loc) => setSearchCoords(loc.coordinates)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] bg-[var(--surface-hover)] text-[12px] focus:outline-none focus:border-[var(--ink)] transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 p-6 bg-[var(--surface-hover)] overflow-y-auto no-scrollbar">
            {loading ? (
              <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] text-center mt-10">Syncing...</p>
            ) : availableDonations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">No active listings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableDonations.map(d => (
                  <div key={d._id} className="bg-[var(--surface)] border border-[var(--ink)] p-5 relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-1">Source</p>
                        <p className="font-semibold text-[var(--ink)] text-[14px]">{d.donor?.organizationName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-1">Volume</p>
                        <p className="font-semibold text-[var(--ink)] text-[18px] leading-none tracking-tight">{d.totalServings} <span className="text-[12px] font-normal text-[var(--ink-muted)]">meals</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => claimDonation(d._id)}
                      className="w-full py-2.5 bg-transparent border border-[var(--ink)] text-[var(--ink)] text-[11px] font-bold tracking-widest uppercase hover:bg-[var(--ink)] hover:text-[var(--bg)] transition-colors"
                    >
                      Dispatch Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Incoming Deliveries */}
        <div className="card-minimal flex flex-col min-h-[500px]">
          <div className="p-6 flex justify-between items-center border-b border-[var(--border)]">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Incoming Shipments</h2>
          </div>
          <div className="flex-1 p-6 bg-[var(--surface)] overflow-y-auto no-scrollbar">
            {loading ? (
              <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] text-center mt-10">Syncing...</p>
            ) : pendingClaims.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">No incoming shipments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingClaims.map(c => (
                  <div key={c._id} className="border border-[var(--border)] p-5">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border)]">
                      <StatusBadge status={c.status} />
                      <span className="font-semibold tracking-tight text-[var(--ink)]">{c.totalServings} meals</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-1">Origin</p>
                        <p className="text-[13px] text-[var(--ink)] font-medium">{c.donor?.organizationName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-1">Courier</p>
                        <p className="text-[13px] text-[var(--ink)] font-medium">{c.assignedDriver?.name || 'Awaiting Assign...'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Log */}
        <div className="card-minimal flex flex-col min-h-[500px]">
          <div className="p-6 flex justify-between items-center border-b border-[var(--border)]">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">History Log</h2>
          </div>
          <div className="flex-1 p-6 bg-[var(--surface)] overflow-y-auto no-scrollbar">
            {loading ? (
              <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] text-center mt-10">Syncing...</p>
            ) : completedClaims.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">No completed logs</p>
              </div>
            ) : (
              <div className="space-y-6">
                {completedClaims.map(c => (
                  <div key={c._id} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[13px] font-medium text-[var(--ink)] truncate max-w-[150px]">{c.donor?.organizationName || c.donor?.name || 'Unknown Origin'}</p>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)] border border-[var(--ink)] px-1.5 py-0.5">Done</span>
                    </div>
                    <p className="text-[12px] text-[var(--ink-muted)] truncate">{c.totalServings} meals received</p>
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
