import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { 
      await login(form.email, form.password); 
    } catch (err) { 
      setError(err.response?.data?.message || 'Login failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential);
      toast.success('Logged in successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center relative min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      
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
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md p-10 sm:p-14 border border-[var(--border)] bg-[var(--surface)] mx-auto"
      >
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-3">
            Authentication
          </p>
          <h1 className="font-semibold text-4xl sm:text-5xl tracking-tighter text-[var(--ink)] mb-4">
            Welcome back.
          </h1>
          <p className="text-[var(--ink-muted)] text-[14px]">
            Sign in to log surplus and track your impact.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-[var(--ink)] text-[var(--ink)] text-[12px] font-medium text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <div className="mb-8 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            theme={isDark ? 'filled_black' : 'outline'}
            shape="rectangular"
            size="large"
            text="continue_with"
            width="300"
          />
        </div>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="mx-4 text-[10px] uppercase font-bold tracking-widest text-[var(--ink-muted)]">Or</span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Email address</label>
            <input 
              type="email" 
              className="input" 
              placeholder="name@organisation.org" 
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 mt-8 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-12 text-center pt-8 border-t border-[var(--border)]">
          <p className="text-[13px] text-[var(--ink-muted)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[var(--ink)] hover:underline border-b border-[var(--ink)] pb-0.5 ml-1">
              Sign up now
            </Link>
          </p>
        </div>
      </motion.div>

    </div>
  );
}
