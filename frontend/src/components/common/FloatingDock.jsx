import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { slideDownHUD } from '../../animations/variants';
import { HiOutlineViewGrid, HiOutlineChartBar, HiOutlineLogout, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const roleNavItems = {
  donor: [
    { path: '/dashboard', label: 'Overview', icon: HiOutlineViewGrid },
    { path: '/analytics', label: 'Metrics', icon: HiOutlineChartBar },
  ],
  ngo: [
    { path: '/dashboard', label: 'Hub', icon: HiOutlineViewGrid },
    { path: '/analytics', label: 'Data', icon: HiOutlineChartBar },
  ],
  driver: [
    { path: '/dashboard', label: 'Route', icon: HiOutlineViewGrid },
    { path: '/analytics', label: 'Stats', icon: HiOutlineChartBar },
  ],
};

export default function FloatingDock() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = roleNavItems[user?.role] || roleNavItems.donor;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
      <motion.div
        variants={slideDownHUD}
        initial="initial"
        animate="animate"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 border rounded-[20px]"
        style={{ 
          background: '#1E1E1E', 
          borderColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}
      >
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path}>
              <div
                className="relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-200"
                style={{
                  background: isActive ? 'var(--surface-inset)' : 'transparent',
                  color: isActive ? 'var(--ink)' : 'var(--ink-muted)',
                  boxShadow: isActive ? 'inset 0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <Icon className="w-[18px] h-[18px] relative z-10" />
                {isActive && (
                  <div className="absolute bottom-1 w-3 h-[2px] rounded-full" style={{ background: 'var(--accent)' }} />
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 hover:opacity-100 transition-opacity text-[11px] font-semibold px-2 py-1 rounded shadow-sm pointer-events-none whitespace-nowrap"
                  style={{ background: 'var(--ink)', color: 'var(--surface)' }}
                >
                  {item.label}
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>

      <div className="w-px h-6 mx-1" style={{ background: 'var(--border)' }} />

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ color: 'var(--ink-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-inset)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {isDark ? <HiOutlineSun className="w-[18px] h-[18px]" /> : <HiOutlineMoon className="w-[18px] h-[18px]" />}
        </button>

        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={{ color: 'var(--coral)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--coral)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--coral)';
          }}
        >
          <HiOutlineLogout className="w-[18px] h-[18px]" />
        </button>
      </div>
    </motion.div>
  );
}
