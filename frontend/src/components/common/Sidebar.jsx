import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineClipboardList, 
  HiOutlineMap, 
  HiOutlineTruck, 
  HiOutlineUserGroup, 
  HiOutlineChartBar, 
  HiOutlineCog,
  HiOutlineLogout
} from 'react-icons/hi';

const roleNavItems = {
  donor: [
    { path: '/dashboard', label: 'Overview', icon: HiOutlineViewGrid },
    { path: '/listings', label: 'My Listings', icon: HiOutlineClipboardList },
    { path: '/deliveries', label: 'Deliveries', icon: HiOutlineTruck },
    { path: '/network', label: 'Network', icon: HiOutlineUserGroup },
    { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  ],
  ngo: [
    { path: '/dashboard', label: 'Hub', icon: HiOutlineViewGrid },
    { path: '/listings', label: 'Find Food', icon: HiOutlineClipboardList },
    { path: '/deliveries', label: 'My Claims', icon: HiOutlineTruck },
    { path: '/network', label: 'Network', icon: HiOutlineUserGroup },
    { path: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  ],
  driver: [
    { path: '/dashboard', label: 'Active Route', icon: HiOutlineViewGrid },
    { path: '/deliveries', label: 'Logbook', icon: HiOutlineClipboardList },
    { path: '/analytics', label: 'Stats', icon: HiOutlineChartBar },
  ]
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = roleNavItems[user?.role] || roleNavItems.donor;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col justify-between p-8 border-r bg-[var(--sidebar-bg)] border-[var(--border)]">
      
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-6 h-6 bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center text-[10px] font-bold tracking-widest uppercase">
            AH
          </div>
          <span className="font-semibold text-lg tracking-tight uppercase">AfterHour</span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
            const Icon = item.icon;
            
            return (
              <NavLink key={item.path} to={item.path}>
                <div 
                  className={`flex items-center gap-4 px-3 py-2.5 rounded-sm transition-colors ${
                    isActive 
                      ? 'bg-[var(--ink)] text-[var(--bg)]' 
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] stroke-2" />
                  <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-[var(--border)] pt-6">
        <NavLink to="/settings">
          <div className="flex items-center gap-4 px-3 py-2.5 rounded-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
            <HiOutlineCog className="w-[18px] h-[18px] stroke-2" />
            <span className="text-[13px] font-medium tracking-wide">Settings</span>
          </div>
        </NavLink>

        <button 
          onClick={handleLogout} 
          className="w-full mt-2 flex items-center gap-4 px-3 py-2.5 rounded-sm text-[var(--ink-muted)] hover:text-red-500 transition-colors"
        >
          <HiOutlineLogout className="w-[18px] h-[18px] stroke-2" />
          <span className="text-[13px] font-medium tracking-wide">Disconnect</span>
        </button>
        
        <div className="mt-6">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--ink-faint)] mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--ink)]" />
            <span className="text-[12px] font-medium text-[var(--ink)]">Network Active</span>
          </div>
        </div>
      </div>
      
    </aside>
  );
}
