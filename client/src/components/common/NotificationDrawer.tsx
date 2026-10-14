import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trophy,
  Calendar,
  Award,
  Zap,
  Info,
  Trash2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { notificationApi } from '../../services/notificationApi';
import { getSocket } from '../../services/socket';
import { InAppNotification } from '../../types/notification';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

export const NotificationDrawer: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationApi.getUserNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.warn('Failed to fetch user notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    const handleNewNotification = (data: { userId: string; notification: InAppNotification }) => {
      if (user && data.userId === user.id) {
        setNotifications((prev) => [data.notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(`🔔 ${data.notification.title}: ${data.notification.message}`);
      }
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [fetchNotifications, user, toast]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to update notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CERTIFICATE':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'MATCH':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'TOURNAMENT':
        return <Trophy className="w-4 h-4 text-purple-400" />;
      case 'SCHEDULE':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-sportex-400" />;
    }
  };

  return (
    <div className="relative" ref={drawerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all relative"
        aria-label="Open Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black font-mono flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Popover Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-50 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sportex-400" />
                <h4 className="text-sm font-bold text-white">Notifications</h4>
                {unreadCount > 0 && (
                  <Badge variant="danger" size="sm">
                    {unreadCount} New
                  </Badge>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                  className="text-[11px] font-semibold text-sportex-400 hover:text-sportex-300 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Bell className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">No Notifications</p>
                  <p className="text-[10px] text-slate-500">You're all caught up with campus sports alerts.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3 ${
                      !n.isRead ? 'bg-slate-800/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 mt-0.5">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sportex-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[9px] font-mono text-slate-500 pt-0.5">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          title="Mark as read"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5 text-sportex-400" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(n.id, e)}
                        title="Delete alert"
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
