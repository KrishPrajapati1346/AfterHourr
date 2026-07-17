import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import DriverDashboard from './pages/DriverDashboard';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import Listings from './pages/Listings';
import Network from './pages/Network';
import Deliveries from './pages/Deliveries';
import LiveMap from './pages/LiveMap';
import Settings from './pages/Settings';

// Role-based dashboard router
function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'donor': return <DonorDashboard />;
    case 'ngo': return <NGODashboard />;
    case 'driver': return <DriverDashboard />;
    default: return <DonorDashboard />;
  }
}

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? 'rgba(19,23,40,0.97)' : '#ffffff',
          color: isDark ? '#e4e6ef' : '#1a1d2e',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          backdropFilter: 'blur(20px)',
          fontSize: '13px',
          borderRadius: '1px',
          fontFamily: "'DM Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.1)',
        },
      }}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <ThemedToaster />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />

              {/* Auth */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Dashboard */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/map" element={<LiveMap />} />
                <Route path="/deliveries" element={<Deliveries />} />
                <Route path="/network" element={<Network />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
