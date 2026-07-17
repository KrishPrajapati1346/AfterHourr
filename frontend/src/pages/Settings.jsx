import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import AddressAutocomplete from '../components/common/AddressAutocomplete';

export default function Settings() {
  const { user, login } = useAuth(); // Assuming login context can just update the user state if needed, or we just rely on the API and reload.
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organizationName: '',
    phone: '',
    address: '',
    city: '',
    location: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        organizationName: user.organizationName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
      });
    }
  }, [user]);

  const handleLocationSelect = (locData) => {
    setFormData(prev => ({
      ...prev,
      address: locData.address,
      city: locData.city,
      location: { coordinates: locData.coordinates }
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        toast.success('Profile updated successfully');
        // Technically we should update the AuthContext user, but a reload works for a quick fix if context doesn't expose setUser.
        // If useAuth exposes login/setUser we can do it, otherwise let's just let it be or force reload.
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-12 border-b border-[var(--border)] pb-6 flex justify-between items-end">
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Configuration</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">Account Settings</h1>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-1">Role</p>
          <p className="text-[14px] font-semibold text-[var(--ink)] uppercase">{user?.role}</p>
        </div>
      </div>

      <div className="card-minimal p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Email Address</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] p-3 text-[14px] text-[var(--ink-muted)] focus:outline-none cursor-not-allowed"
              />
              <p className="text-[10px] text-[var(--ink-muted)] mt-1">Email cannot be changed.</p>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[var(--surface)] border border-[var(--ink)] p-3 text-[14px] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Organization Name</label>
              <input 
                type="text" 
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full bg-[var(--surface)] border border-[var(--ink)] p-3 text-[14px] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Phone Number</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[var(--surface)] border border-[var(--ink)] p-3 text-[14px] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">Street Address</label>
            <AddressAutocomplete 
              value={formData.address}
              onChange={handleChange}
              onLocationSelect={handleLocationSelect}
              placeholder="Search for your address..."
              className="w-full bg-[var(--surface)] border border-[var(--ink)] p-3 text-[14px] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
            />
          </div>

          <div className="w-1/2 pr-3">
            <label className="block text-[11px] font-bold tracking-widest uppercase text-[var(--ink-muted)] mb-2">City</label>
            <input 
              type="text" 
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full bg-[var(--surface)] border border-[var(--ink)] p-3 text-[14px] text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
            />
          </div>

          <div className="pt-6 border-t border-[var(--border)] flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[var(--ink)] text-[var(--bg)] px-8 py-3 text-[11px] font-bold tracking-widest uppercase hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Committing...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
