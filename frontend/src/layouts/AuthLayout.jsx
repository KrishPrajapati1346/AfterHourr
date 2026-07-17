import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/common/LoadingState';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState fullScreen text="Loading..." />;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <Outlet />
    </div>
  );
}
