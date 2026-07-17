import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineLogout, HiOutlineMoon, HiOutlineSun, HiOutlineViewGrid, HiOutlineChartBar } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--surface)] border-b border-[var(--border)] shadow-sm">
      <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-display font-bold text-lg shadow-lg shadow-[var(--brand-primary)]/30 group-hover:scale-110 transition-transform">
            AH
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-[var(--ink)]">
            AfterHour
          </span>
        </div>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/dashboard" className={({isActive}) => `font-medium transition-colors ${isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}>
            Dashboard
          </NavLink>
          <NavLink to="/analytics" className={({isActive}) => `font-medium transition-colors ${isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}>
            Analytics
          </NavLink>
          <NavLink to="/network" className={({isActive}) => `font-medium transition-colors ${isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}>
            Network
          </NavLink>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] transition-colors">
            {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
          </button>
          
          <div className="h-8 w-px bg-[var(--border)] mx-1" />
          
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="font-display font-bold text-sm text-[var(--ink)] leading-none">{user?.name || 'User'}</p>
              <p className="text-xs text-[var(--ink-muted)] mt-1 capitalize">{user?.role || 'Guest'}</p>
            </div>
            <button onClick={handleLogout} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <HiOutlineLogout className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}
