import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import { HiOutlineSparkles, HiX, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AddressAutocomplete from '../components/common/AddressAutocomplete';

export default function Listings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCoords, setSearchCoords] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rawDescription, setRawDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = async () => {
    try {
      let res;
      let queryParams = '';
      if (searchCoords) {
        queryParams = `?lat=${searchCoords[1]}&lng=${searchCoords[0]}`;
      }
      
      if (user.role === 'ngo') {
        res = await api.get(`/ngo/nearby-donations${queryParams}`);
        setListings(res.data.donations || []);
      } else if (user.role === 'donor') {
        res = await api.get('/donations?status=pending');
        setListings(res.data.donations || []);
      }
    } catch (error) {
      console.error('Failed to fetch listings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user.role, user._id, searchCoords]);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!rawDescription.trim()) return;
    
    setSubmitting(true);
    try {
      await api.post('/donations', { rawDescription });
      toast.success('Listing created using AI Intelligence.');
      setRawDescription('');
      setIsModalOpen(false);
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const claimDonation = async (id) => {
    try {
      await api.post(`/donations/${id}/claim`);
      toast.success('Surplus claimed successfully.');
      fetchListings();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to claim');
    }
  };

  return (
    <div className="w-full relative">
      <div className="mb-12 border-b border-[var(--border)] pb-6 flex justify-between items-end">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Database</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">Active Listings</h1>
        </div>
        {user.role === 'donor' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary py-2.5 px-6">
            Create Listing
          </button>
        )}
      </div>

      <div className="card-minimal">
        <div className="p-6 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center bg-[var(--surface-hover)] gap-4">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink)]">Global Index</h2>
          {user.role === 'ngo' && (
            <div className="w-full md:w-64 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] w-4 h-4" />
              <AddressAutocomplete 
                placeholder="Scan another territory..."
                onLocationSelect={(loc) => setSearchCoords(loc.coordinates)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] bg-[var(--surface)] text-[12px] focus:outline-none focus:border-[var(--ink)] transition-colors"
              />
            </div>
          )}
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">
                <th className="p-4 font-normal">Origin</th>
                <th className="p-4 font-normal">Details</th>
                <th className="p-4 font-normal">Servings</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] animate-pulse">Syncing...</td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)]">No records found.</td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr key={item._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="p-4 text-[13px] font-medium text-[var(--ink)]">{item.donor?.organizationName || 'Unknown Origin'}</td>
                    <td className="p-4 text-[13px] text-[var(--ink-muted)] max-w-[200px] truncate">{item.rawDescription || 'Standard Package'}</td>
                    <td className="p-4 text-[13px] text-[var(--ink)]">{item.totalServings} M</td>
                    <td className="p-4"><StatusBadge status={item.status} /></td>
                    <td className="p-4 text-right">
                      {user.role === 'ngo' && item.status === 'pending' && (
                        <button onClick={() => claimDonation(item._id)} className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)] border-b border-[var(--ink)] hover:opacity-70 transition-opacity">
                          Claim
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Listing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--ink)] w-full max-w-lg p-8 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
              <HiX className="w-5 h-5" />
            </button>
            
            <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2 flex items-center gap-2">
              <HiOutlineSparkles className="w-3 h-3" /> AI Smart Entry
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)] mb-6">Log Surplus Food</h2>
            
            <form onSubmit={handleCreateListing}>
              <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">What do you have?</label>
                <textarea 
                  value={rawDescription}
                  onChange={(e) => setRawDescription(e.target.value)}
                  placeholder="e.g. We have 45 burgers, 2 trays of pasta, and 10 salads left over from tonight's event."
                  className="w-full h-32 p-4 bg-transparent border border-[var(--border)] text-[13px] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] resize-none"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-[var(--ink)] text-[var(--bg)] text-[11px] font-bold tracking-widest uppercase hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Parsing...' : 'Submit to Network'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
