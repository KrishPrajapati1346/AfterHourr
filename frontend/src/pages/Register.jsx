import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { 
  HiOutlineMoon, 
  HiOutlineSun, 
  HiOutlineOfficeBuilding, 
  HiOutlineHome, 
  HiOutlineTruck,
  HiOutlineArrowRight,
  HiOutlineArrowLeft
} from 'react-icons/hi';
import AddressAutocomplete from '../components/common/AddressAutocomplete';

const roles = [
  { value: 'donor', label: 'Food Partner', icon: HiOutlineOfficeBuilding, desc: 'Log your surplus food for pickup' },
  { value: 'ngo', label: 'Community Hub', icon: HiOutlineHome, desc: 'Receive food for your community' },
  { value: 'driver', label: 'Route Runner', icon: HiOutlineTruck, desc: 'Help transport food locally' },
];

export default function Register() {
  const { register, googleRegister } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: '', phone: '',
    organizationName: '', address: '', city: 'Mumbai', vehicleType: 'car', capacity: 100,
  });
  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (coordinates) {
        payload.location = { type: 'Point', coordinates };
      } else {
        // Fallback default
        payload.location = { type: 'Point', coordinates: [72.8777, 19.0760] };
      }
      await register(payload);
    } catch (err) { 
      setError(err.response?.data?.message || 'Registration failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await googleRegister({
        credential: credentialResponse.credential,
        ...form
      });
      toast.success('Account created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.value === form.role);

  return (
    <div className="w-full flex items-center justify-center relative min-h-screen py-20 bg-[var(--bg)] text-[var(--ink)]">
      
      {/* Top Nav inside auth */}
      <div className="absolute top-0 w-full p-8 flex justify-between items-center z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center text-[8px] font-bold uppercase tracking-widest">
            AH
          </div>
          <span className="font-semibold text-lg tracking-tight uppercase">
            AfterHour
          </span>
        </Link>
        <button onClick={toggleTheme} className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
          {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
        </button>
      </div>

      <motion.div 
        key={step}
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-xl p-10 sm:p-14 border border-[var(--border)] bg-[var(--surface)] mx-auto"
      >
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-3">
            {step === 1 ? 'Step 01' : 'Step 02'}
          </p>
          <h1 className="font-semibold text-4xl sm:text-5xl tracking-tighter text-[var(--ink)] mb-4">
            {step === 1 ? 'Join the network.' : `Set up as ${selectedRole?.label}.`}
          </h1>
          <p className="text-[var(--ink-muted)] text-[14px]">
            {step === 1 ? 'Choose how you want to make an impact.' : 'Just a few more details to get started.'}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-[var(--ink)] text-[var(--ink)] text-[12px] font-medium text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button 
                  key={role.value} 
                  onClick={() => { setForm({ ...form, role: role.value }); setStep(2); }} 
                  className="w-full p-6 border border-[var(--border)] hover:border-[var(--ink)] flex items-center gap-6 text-left transition-colors group bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
                >
                  <div className="w-12 h-12 border border-[var(--ink)] flex items-center justify-center text-[var(--ink)] bg-[var(--bg)] group-hover:bg-[var(--ink)] group-hover:text-[var(--bg)] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <strong className="font-semibold text-xl text-[var(--ink)] block tracking-tight">{role.label}</strong>
                    <span className="text-[13px] text-[var(--ink-muted)] mt-1.5 block">{role.desc}</span>
                  </div>
                  <HiOutlineArrowRight className="w-5 h-5 text-[var(--ink-muted)] group-hover:text-[var(--ink)] transition-colors" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-8 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Registration Failed')}
                theme={isDark ? 'filled_black' : 'outline'}
                shape="rectangular"
                size="large"
                text="signup_with"
                width="300"
              />
            </div>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-[var(--border)]"></div>
              <span className="mx-4 text-[10px] uppercase font-bold tracking-widest text-[var(--ink-muted)]">Or sign up with email</span>
              <div className="flex-grow border-t border-[var(--border)]"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Full Name</label>
                <input className="input" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Phone</label>
                <input className="input" type="tel" placeholder="+91 98765..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            
            {(form.role === 'donor' || form.role === 'ngo') && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Organisation Name</label>
                <input className="input" type="text" placeholder="e.g. The Grand Hotel" value={form.organizationName} onChange={e => setForm({ ...form, organizationName: e.target.value })} />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Email</label>
                <input className="input" type="email" placeholder="name@domain.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Password</label>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Base Address</label>
              <AddressAutocomplete 
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                onLocationSelect={(loc) => {
                  setForm(prev => ({ ...prev, address: loc.address, city: loc.city || prev.city }));
                  setCoordinates(loc.coordinates);
                }}
                className="input"
              />
            </div>

            <div className="flex gap-4 pt-6 mt-4 border-t border-[var(--border)]">
              <button type="button" onClick={() => setStep(1)} className="btn btn-outline flex-1 py-4">
                Back
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary flex-[1.5] py-4 disabled:opacity-50">
                {loading ? 'Creating...' : 'Join Network'}
              </button>
            </div>
          </form>
          </div>
        )}

        <div className="mt-12 text-center pt-8 border-t border-[var(--border)]">
          <p className="text-[13px] text-[var(--ink-muted)]">
            Already on the network?{' '}
            <Link to="/login" className="font-semibold text-[var(--ink)] hover:underline border-b border-[var(--ink)] pb-0.5 ml-1">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>

    </div>
  );
}
