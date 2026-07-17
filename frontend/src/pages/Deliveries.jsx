import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';

export default function Deliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        let res;
        if (user.role === 'driver') {
          res = await api.get('/driver/history');
          setDeliveries(res.data.deliveries || []);
        } else if (user.role === 'ngo') {
          res = await api.get('/ngo/claims');
          setDeliveries(res.data.donations || []);
        } else if (user.role === 'donor') {
          res = await api.get('/donations');
          const activeDeliveries = res.data.donations.filter(d => d.status !== 'pending');
          setDeliveries(activeDeliveries || []);
        } else {
          setDeliveries([]);
        }
      } catch (error) {
        console.error('Failed to fetch deliveries', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, [user.role]);

  return (
    <div className="w-full">
      <div className="mb-12 border-b border-[var(--border)] pb-6 flex justify-between items-end">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Manifest</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">Deliveries</h1>
        </div>
      </div>

      {/* Active Routes */}
      <div className="card-minimal mb-8">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-hover)]">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Active Routes</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">
                <th className="p-4 font-normal">Origin</th>
                <th className="p-4 font-normal">Destination</th>
                <th className="p-4 font-normal">Volume</th>
                <th className="p-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] animate-pulse">Syncing...</td>
                </tr>
              ) : deliveries.filter(d => d.status !== 'delivered').length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">No active routes found.</td>
                </tr>
              ) : (
                deliveries.filter(d => d.status !== 'delivered').map((item) => {
                  // Handle population differences between driver and ngo routes
                  const origin = item.donation?.donor?.organizationName || item.donation?.donor?.name || item.donor?.organizationName || item.donor?.name || 'Unknown';
                  const destination = item.donation?.matchedNGO?.organizationName || item.donation?.matchedNGO?.name || item.matchedNGO?.organizationName || item.matchedNGO?.name || item.ngo?.organizationName || item.ngo?.name || user.organizationName || user.name || 'Unknown';
                  const volume = item.totalServings || item.donation?.totalServings || 0;

                  return (
                    <tr key={item._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="p-4 text-[13px] font-medium text-[var(--ink)]">{origin}</td>
                      <td className="p-4 text-[13px] text-[var(--ink-muted)]">{destination}</td>
                      <td className="p-4 text-[13px] text-[var(--ink)]">{volume} M</td>
                      <td className="p-4"><StatusBadge status={item.status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Log */}
      <div className="card-minimal">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-hover)]">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Completed Deliveries</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">
                <th className="p-4 font-normal">Origin</th>
                <th className="p-4 font-normal">Destination</th>
                <th className="p-4 font-normal">Volume</th>
                <th className="p-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] animate-pulse">Syncing...</td>
                </tr>
              ) : deliveries.filter(d => d.status === 'delivered').length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">No completed deliveries found.</td>
                </tr>
              ) : (
                deliveries.filter(d => d.status === 'delivered').map((item) => {
                  const origin = item.donation?.donor?.organizationName || item.donation?.donor?.name || item.donor?.organizationName || item.donor?.name || 'Unknown';
                  const destination = item.donation?.matchedNGO?.organizationName || item.donation?.matchedNGO?.name || item.matchedNGO?.organizationName || item.matchedNGO?.name || item.ngo?.organizationName || item.ngo?.name || user.organizationName || user.name || 'Unknown';
                  const volume = item.totalServings || item.donation?.totalServings || 0;

                  return (
                    <tr key={item._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors opacity-70">
                      <td className="p-4 text-[13px] font-medium text-[var(--ink)]">{origin}</td>
                      <td className="p-4 text-[13px] text-[var(--ink-muted)]">{destination}</td>
                      <td className="p-4 text-[13px] text-[var(--ink)]">{volume} M</td>
                      <td className="p-4"><span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)] border border-[var(--ink)] px-1.5 py-0.5">Delivered</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
