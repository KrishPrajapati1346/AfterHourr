import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MetricCard from '../components/common/MetricCard';
import GeospatialMap from '../components/common/GeospatialMap';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineSearch, 
  HiOutlineMap,
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
  HiOutlineCheckCircle
} from 'react-icons/hi';

export default function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const [liveDrivers, setLiveDrivers] = useState({});
  const [activeDeliveries, setActiveDeliveries] = useState([]);

  // Smart Entry State
  const [entryMode, setEntryMode] = useState('input'); // 'input', 'parsing', 'review', 'submitting'
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, notifRes, donationsRes] = await Promise.all([
          api.get('/analytics/me'),
          api.get('/notifications'),
          api.get('/donations?status=pickup_assigned') // Get active ones (we'll also fetch in_transit below)
        ]);
        
        // Let's actually fetch all and filter to active
        const allDonationsRes = await api.get('/donations');
        if (allDonationsRes.data.success) {
           const active = allDonationsRes.data.donations.filter(d => ['pickup_assigned', 'arrived', 'in_transit'].includes(d.status));
           setActiveDeliveries(active);
        }

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (notifRes.data.success) {
          setNotifications(notifRes.data.notifications.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
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
        socket.off('driver:moved');
      };
    }
  }, [socket]);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setEntryMode('parsing');
    try {
      const res = await api.post('/ai/parse-food', { description: rawText });
      setParsedData(res.data.parsed);
      setEntryMode('review');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to parse data');
      setEntryMode('input');
    }
  };

  const handlePost = async () => {
    setEntryMode('submitting');
    try {
      await api.post('/donations', { 
        rawDescription: rawText,
        items: parsedData.items,
        totalServings: parsedData.totalServings,
        estimatedValue: parsedData.estimatedValue,
        carbonSaved: parsedData.carbonSaved
      });
      toast.success('Listing pushed to network successfully.');
      setRawText('');
      setParsedData(null);
      setEntryMode('input');
      // Refresh stats
      const { data } = await api.get('/analytics/me');
      if (data.success) setStats(data.stats);
    } catch (error) {
      toast.error('Failed to post listing');
      setEntryMode('review');
    }
  };

  return (
    <div className="w-full">
      
      {/* Top Header - Editorial style */}
      <div className="flex items-end justify-between mb-12 border-b border-[var(--border)] pb-6">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Daily Briefing</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">
            Good Evening, {user?.name?.split(' ')[0] || 'Partner'}.
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <HiOutlineSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search index..." 
              className="pl-7 pr-4 py-2 bg-transparent border-b border-[var(--border)] text-[13px] focus:outline-none focus:border-[var(--ink)] text-[var(--ink)] w-[200px] transition-colors placeholder:text-[var(--ink-faint)]"
            />
          </div>
          <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">
            Ops Desk
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          label="Meals Rescued" 
          value={loading ? '...' : (stats?.totalMeals || 0)} 
          trend="Lifetime" 
          icon={<HiOutlineMap className="w-5 h-5" />} 
        />
        <MetricCard 
          label="Active Pickups" 
          value={loading ? '...' : (stats?.activeCount || 0)} 
          icon={<HiOutlineTruck className="w-5 h-5" />} 
        />
        <MetricCard 
          label="Total Donations" 
          value={loading ? '...' : (stats?.totalDonations || 0)} 
          icon={<HiOutlineUserGroup className="w-5 h-5" />} 
        />
        <MetricCard 
          label="CO2 Offset" 
          value={loading ? '...' : `${stats?.totalCarbon || 0} Kg`} 
          trend="Saved" 
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        
        {/* Classy Monochrome Map */}
        <div className="card-minimal flex flex-col min-h-[500px]">
          <div className="p-6 flex justify-between items-center border-b border-[var(--border)]">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Live Territory</h2>
            <button 
              onClick={() => navigate('/map')}
              className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              Expand
            </button>
          </div>
          <div className="flex-1 relative bg-[var(--surface-hover)] overflow-hidden min-h-[350px]">
            <GeospatialMap 
              center={[user?.location?.coordinates?.[1] || 12.9716, user?.location?.coordinates?.[0] || 77.5946]} 
              zoom={12}
              markers={[
                // Default donor marker if no active deliveries, otherwise origin markers
                ...(activeDeliveries.length === 0 ? [{ position: [user?.location?.coordinates?.[1] || 12.9716, user?.location?.coordinates?.[0] || 77.5946], name: user?.organizationName || 'Your Location', label: 'Origin', type: 'origin' }] : []),
                
                ...activeDeliveries.map(d => ({
                  position: [d.pickupLocation.coordinates[1], d.pickupLocation.coordinates[0]],
                  name: d.donor?.organizationName || user?.organizationName || 'Pickup Location',
                  label: 'Origin',
                  type: 'origin'
                })),
                
                ...activeDeliveries.filter(d => d.matchedNGO && d.matchedNGO.location).map(d => ({
                  position: [d.matchedNGO.location.coordinates[1], d.matchedNGO.location.coordinates[0]],
                  name: d.matchedNGO.organizationName || 'NGO Location',
                  label: 'Destination',
                  type: 'destination'
                }))
              ]}
              routes={activeDeliveries.filter(d => d.matchedNGO && d.matchedNGO.location).map(d => ({
                coordinates: [
                  [d.pickupLocation.coordinates[1], d.pickupLocation.coordinates[0]],
                  [d.matchedNGO.location.coordinates[1], d.matchedNGO.location.coordinates[0]]
                ]
              }))}
              drivers={Object.values(liveDrivers).map(d => ({
                position: [d.lat, d.lng],
                name: `Courier #${d.driverId.slice(-4)}`,
                type: 'driver'
              }))}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          
          {/* AI Smart Entry */}
          <div className="card-minimal flex-1 flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-[var(--border)]">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)] flex items-center gap-2">
                <HiOutlineSparkles /> Smart Entry
              </h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              
              {entryMode === 'input' && (
                <div className="flex-1 flex flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-3">Log Surplus</p>
                  <textarea 
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="E.g. We have 45 burgers and 10 salads left over..."
                    className="w-full flex-1 min-h-[120px] bg-transparent border border-[var(--border)] p-4 text-[13px] focus:outline-none focus:border-[var(--ink)] resize-none mb-4"
                  />
                  <button onClick={handleParse} className="w-full py-2.5 bg-[var(--ink)] text-[var(--bg)] text-[11px] font-bold tracking-widest uppercase hover:opacity-80 transition-opacity">
                    Process Data
                  </button>
                </div>
              )}

              {entryMode === 'parsing' && (
                <div className="flex-1 flex flex-col items-center justify-center py-12 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTAgMjBoNDBNMCAzMGg0ME0xMCAwdjQwTTIwIDB2NDBNeiAgMHY0MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')]"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 border border-[var(--ink)] flex items-center justify-center mb-6 relative">
                      <div className="absolute inset-0 bg-[var(--ink)] animate-ping opacity-20"></div>
                      <HiOutlineSparkles className="w-6 h-6 text-[var(--ink)]" />
                    </div>
                    <p className="text-[14px] font-bold tracking-widest uppercase text-[var(--ink)] mb-2">Neural Engine Active</p>
                    <p className="text-[12px] text-[var(--ink-muted)] max-w-xs">Passing raw text prompt to AI logic layer. Calculating volume and carbon displacement...</p>
                    
                    <div className="mt-8 w-64 h-1 bg-[var(--surface-inset)] overflow-hidden relative">
                       <div className="absolute top-0 left-0 h-full bg-[var(--ink)] w-full animate-[progress_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              )}

              {entryMode === 'review' && parsedData && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
                    <div className="w-8 h-8 bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center">
                      <HiOutlineCheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--ink)]">Analysis Complete</p>
                      <p className="text-[11px] text-[var(--ink-muted)]">Data structured and ready for broadcast.</p>
                    </div>
                  </div>

                  {/* Breakdown List */}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Identified Inventory</p>
                  <div className="mb-6 max-h-[160px] overflow-y-auto no-scrollbar border border-[var(--border)] bg-[var(--surface-hover)]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                          <th className="p-3 text-[9px] font-bold uppercase tracking-widest text-[var(--ink-muted)] font-normal">Food Category</th>
                          <th className="p-3 text-[9px] font-bold uppercase tracking-widest text-[var(--ink-muted)] font-normal text-right">Est. Servings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface)] transition-colors group">
                            <td className="p-3">
                               <input 
                                  value={item.name}
                                  onChange={(e) => {
                                      const newItems = [...parsedData.items];
                                      newItems[idx].name = e.target.value;
                                      setParsedData({...parsedData, items: newItems});
                                  }}
                                  className="w-full bg-transparent text-[13px] font-medium text-[var(--ink)] focus:outline-none border-b border-transparent group-hover:border-[var(--ink-faint)] focus:border-[var(--ink)]"
                               />
                            </td>
                            <td className="p-3 text-right">
                              <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...parsedData.items];
                                  newItems[idx].quantity = Number(e.target.value) || 0;
                                  const newTotal = newItems.reduce((acc, curr) => acc + curr.quantity, 0);
                                  setParsedData({
                                    ...parsedData, 
                                    items: newItems,
                                    totalServings: newTotal,
                                    carbonSaved: Math.round(newTotal * 0.3 * 10) / 10
                                  });
                                }}
                                className="w-20 bg-transparent text-[14px] font-semibold text-[var(--ink)] text-right focus:outline-none border-b border-[var(--ink-faint)] focus:border-[var(--ink)]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border border-[var(--border)] p-4 flex flex-col justify-between bg-[var(--surface-hover)]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Total People Fed</p>
                      <p className="text-[32px] font-semibold tracking-tight text-[var(--ink)] leading-none">{parsedData.totalServings}</p>
                    </div>
                    <div className="border border-[var(--border)] p-4 flex flex-col justify-between bg-[var(--surface-hover)]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Total CO2 Impact</p>
                      <p className="text-[32px] font-semibold tracking-tight text-[var(--ink)] leading-none">{parsedData.carbonSaved} <span className="text-[14px] text-[var(--ink-muted)] tracking-normal">kg</span></p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button onClick={() => setEntryMode('input')} className="flex-1 py-3 border border-[var(--border)] text-[var(--ink)] text-[10px] font-bold tracking-widest uppercase hover:bg-[var(--surface-hover)] transition-colors">
                      Discard
                    </button>
                    <button onClick={handlePost} className="flex-[2] py-3 bg-[var(--ink)] text-[var(--bg)] text-[10px] font-bold tracking-widest uppercase hover:opacity-80 transition-opacity">
                      Confirm & Push to Network
                    </button>
                  </div>
                </div>
              )}

              {entryMode === 'submitting' && (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <div className="w-4 h-4 bg-[var(--ink)] rounded-full animate-ping mb-4" />
                  <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">Broadcasting to Network...</p>
                </div>
              )}

            </div>
          </div>

          {/* Activity Log */}
          <div className="card-minimal flex-1 flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-[var(--border)]">
              <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Activity Log</h2>
            </div>
            <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto max-h-[300px] no-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] text-center mt-10">
                  No recent activity.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif._id} className="border-l border-[var(--border)] pl-4 hover:border-[var(--ink)] transition-colors">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[13px] font-medium text-[var(--ink)]">{notif.title}</p>
                    <p className="text-[12px] text-[var(--ink-muted)] mt-0.5">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
