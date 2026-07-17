import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { slideDownHUD } from '../../animations/variants';
import { HiOutlineBell } from 'react-icons/hi';
import api from '../../services/api';

export default function TopHUD() {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications?.slice(0, 5) || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <>
      <motion.div
        variants={slideDownHUD}
        initial="initial"
        animate="animate"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-3 border rounded-[20px]"
        style={{ 
          background: '#1E1E1E', 
          borderColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] text-white shadow-sm"
            style={{ background: 'var(--accent)' }}>
            AH
          </div>
          <span className="text-[14px] font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>
            AfterHour
          </span>
        </div>

        <div className="w-px h-4" style={{ background: 'var(--border)' }} />

        <div className="flex items-center gap-3">
          <span className="data-value text-[13px]" style={{ color: 'var(--ink)' }}>{timeStr}</span>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: connected ? 'var(--mint)' : 'var(--coral)', boxShadow: `0 0 8px ${connected ? 'var(--mint)' : 'var(--coral)'}` }}
            />
            <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--ink-faint)' }}>
              {connected ? 'Sync' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="w-px h-4" style={{ background: 'var(--border)' }} />

        <button
          onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) fetchNotifications(); }}
          className="relative flex items-center justify-center w-8 h-8 rounded-md transition-colors"
          style={{ background: showNotifs ? 'var(--surface-inset)' : 'transparent', color: 'var(--ink)' }}
        >
          <HiOutlineBell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2" 
              style={{ background: 'var(--accent)', borderColor: 'var(--surface)' }} 
            />
          )}
        </button>
      </motion.div>

      {/* Premium Notification Modal */}
      <AnimatePresence>
        {showNotifs && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[380px] z-[60] card-minimal p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="heading-lg text-[15px]">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[12px] font-semibold transition-colors hover:brightness-110" style={{ color: 'var(--accent)' }}>
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-[13px] text-center py-6" style={{ color: 'var(--ink-muted)' }}>You're all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="p-3 rounded-lg relative transition-colors cursor-default" style={{ background: 'var(--surface-inset)' }}>
                    {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
                    <div className={!n.read ? 'pl-3' : ''}>
                      <p className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{n.title}</p>
                      <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
