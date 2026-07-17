import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Network() {
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const res = await api.get('/ngo/list');
        setNetwork(res.data.ngos || []);
      } catch (error) {
        console.error('Failed to fetch network partners', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-12 border-b border-[var(--border)] pb-6 flex justify-between items-end">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Directory</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">Network Partners</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
           <p className="col-span-4 text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] text-center mt-10 animate-pulse">Syncing Directory...</p>
        ) : (
          network.map(partner => (
            <div key={partner._id} className="card-minimal p-6 flex flex-col justify-between hover:border-[var(--ink)] transition-colors h-[180px]">
              <div className="flex justify-between items-start">
                <div className={`text-[9px] font-bold uppercase tracking-widest border px-1.5 py-0.5 ${partner.emergencyNeed ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]' : 'border-[var(--ink-muted)] text-[var(--ink-muted)]'}`}>
                  {partner.emergencyNeed ? 'Emergency Active' : 'Active'}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-1">NGO Hub</p>
                <p className="font-semibold text-[16px] text-[var(--ink)]">{partner.organizationName || partner.name}</p>
                <p className="text-[12px] text-[var(--ink-muted)] mt-1">{partner.address}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
