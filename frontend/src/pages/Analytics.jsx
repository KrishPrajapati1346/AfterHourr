import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MetricCard from '../components/common/MetricCard';

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/analytics/me');
        setStats(res.data.stats || {});
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] animate-pulse">Computing Intelligence...</p>
      </div>
    );
  }

  const roleMetrics = {
    donor: {
      heading: 'Impact Ledger',
      metrics: [
        { label: 'Meals Rescued', value: stats?.totalMeals || 0 },
        { label: 'CO₂ Prevented', value: `${stats?.totalCarbon || 0} kg` },
        { label: 'Value Saved', value: `$${stats?.totalValue || 0}` },
        { label: 'Total Logs', value: stats?.totalDonations || 0 },
      ],
      breakdowns: [
        { label: 'Successfully Delivered', value: stats?.deliveredCount || 0 },
        { label: 'In Transit', value: stats?.activeCount || 0 },
      ]
    },
    ngo: {
      heading: 'Resource Ledger',
      metrics: [
        { label: 'Shipments Received', value: stats?.receivedCount || 0 },
        { label: 'Total Meals', value: stats?.totalMealsReceived || 0 },
        { label: 'Claims Made', value: stats?.totalClaimed || 0 },
        { label: 'Pending Arrivals', value: stats?.pendingDeliveries || 0 },
      ],
      breakdowns: []
    },
    driver: {
      heading: 'Performance Ledger',
      metrics: [
        { label: 'Completed Runs', value: stats?.completedDeliveries || 0 },
        { label: 'Distance Covered', value: `${stats?.totalDistance || 0} km` },
        { label: 'Average Rating', value: `${stats?.rating || 0}/5` },
        { label: 'Active Routes', value: stats?.totalDeliveries || 0 },
      ],
      breakdowns: []
    },
  };

  const role = roleMetrics[user?.role] || roleMetrics.donor;
  const total = role.breakdowns.reduce((sum, b) => sum + b.value, 0) || 1;

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-12 border-b border-[var(--border)] pb-6">
        <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Analytics / {user?.role}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">{role.heading}</h1>
        <p className="text-[13px] mt-1 text-[var(--ink-muted)]">
          Historical ledger for {user?.organizationName || user?.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {role.metrics.map(m => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      {role.breakdowns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-minimal flex flex-col min-h-[300px]">
            <div className="p-6 border-b border-[var(--border)]">
              <h3 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">
                Status Distribution
              </h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
              {role.breakdowns.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-[var(--ink-muted)] font-medium">{b.label}</span>
                    <span className="text-[13px] text-[var(--ink)] font-semibold">{b.value}</span>
                  </div>
                  <div className="h-1 bg-[var(--surface-hover)]">
                    <div className="h-full bg-[var(--ink)] transition-all duration-1000" style={{ width: `${(b.value / total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-minimal flex flex-col min-h-[300px]">
            <div className="p-6 border-b border-[var(--border)]">
              <h3 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">
                Impact Equivalence
              </h3>
            </div>
            <div className="p-6 space-y-4 flex-1">
              {[
                { label: 'Equivalent to', value: `${Math.round((stats?.totalCarbon || 0) * 3.5)} km driven`, icon: '🚗' },
                { label: 'People fed', value: `~${Math.round((stats?.totalMeals || 0) / 3)} people / day`, icon: '👥' },
                { label: 'Food saved', value: `${Math.round((stats?.totalMeals || 0) * 0.4)}kg`, icon: '🍽️' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4 p-4 border border-[var(--border)] bg-[var(--surface)]">
                  <span className="text-lg opacity-80">{item.icon}</span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">{item.label}</p>
                    <p className="text-[14px] font-semibold mt-0.5 text-[var(--ink)]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
