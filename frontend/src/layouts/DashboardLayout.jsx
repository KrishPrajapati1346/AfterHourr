import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import LoadingState from '../components/common/LoadingState';

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState fullScreen text="Booting..." />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex">
      <Sidebar />
      <div className="flex-1 ml-[260px]">
        <main className="p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
