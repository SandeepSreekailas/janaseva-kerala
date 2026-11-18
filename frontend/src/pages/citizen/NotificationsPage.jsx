import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Inbox,
  Filter,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getNotifications, markNotificationRead } from '../../api/misc';
import { useAuth } from '../../contexts/AuthContext';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [tabFilter, setTabFilter] = useState('all'); // all, unread, read

  const getGrievanceLink = (gid) => {
    const r = (user?.role || '').toLowerCase();
    if (r === 'cmo' || r === 'cmo_admin' || r === 'admin') {
      return `/cmo/grievances/${gid}`;
    }
    if (r === 'officer') {
      return `/officer/grievances/${gid}`;
    }
    return `/citizen/grievances/${gid}`;
  };

  const fetchNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await getNotifications();
      const list = Array.isArray(data) ? data : data?.results || [];
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Unable to retrieve notifications. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark all unread notifications as read
  const handleMarkAllRead = async () => {
    setActionInProgress(true);
    try {
      await markNotificationRead();
      // Update local state to mark all as read
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  // Mark a single notification as read
  const handleMarkSingleRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationRead([id]);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(`Failed to mark notification ${id} read:`, err);
    }
  };

  // Counts
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const readCount = useMemo(() => {
    return notifications.filter((n) => n.is_read).length;
  }, [notifications]);

  // Filtered list based on active tab
  const filteredList = useMemo(() => {
    if (tabFilter === 'unread') return notifications.filter((n) => !n.is_read);
    if (tabFilter === 'read') return notifications.filter((n) => n.is_read);
    return notifications;
  }, [notifications, tabFilter]);

  // Determine icon by notification title or content
  const getNotificationIcon = (item) => {
    const text = `${item.title || ''} ${item.message || ''}`.toLowerCase();
    if (text.includes('resolved') || text.includes('approved')) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
    if (text.includes('escalated') || text.includes('urgent') || text.includes('rejected')) {
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    }
    if (text.includes('assigned') || text.includes('review') || text.includes('progress')) {
      return <FileText className="w-5 h-5 text-[#245A91]" />;
    }
    return <Bell className="w-5 h-5 text-indigo-600" />;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16865B] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-[#16865B]" />
              Official Citizen Alerts
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#17365D]">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#245A91] text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Live updates on status changes, officer assignments, and ATR submissions for your grievances.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchNotifications(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#245A91]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={actionInProgress}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#245A91]/30 hover:bg-blue-50 text-[#245A91] text-xs font-semibold transition-all shadow-2xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchNotifications()}
              className="text-xs font-semibold text-red-700 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setTabFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 -mb-1 ${
              tabFilter === 'all'
                ? 'border-[#245A91] text-[#245A91]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setTabFilter('unread')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 -mb-1 ${
              tabFilter === 'unread'
                ? 'border-[#245A91] text-[#245A91]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setTabFilter('read')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 -mb-1 ${
              tabFilter === 'read'
                ? 'border-[#245A91] text-[#245A91]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Read ({readCount})
          </button>
        </div>

        {/* Notifications List Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner size="md" text="Loading notifications..." />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {tabFilter === 'unread'
                  ? 'No unread notifications'
                  : tabFilter === 'read'
                  ? 'No read notifications'
                  : 'No notifications yet'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {tabFilter === 'unread'
                  ? 'You are all caught up! Updates regarding your submitted grievances will appear here.'
                  : 'You will receive notifications here as your grievances are assigned, reviewed, and resolved.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredList.map((item) => {
                const grievanceId = item.grievance?.id || item.grievance;
                const grievanceRef = item.grievance?.reference_number;

                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 transition-colors flex items-start gap-3.5 sm:gap-4 ${
                      !item.is_read
                        ? 'bg-blue-50/40 hover:bg-blue-50/70'
                        : 'bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(item)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm ${
                            !item.is_read
                              ? 'font-bold text-slate-900'
                              : 'font-semibold text-slate-800'
                          }`}
                        >
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">
                            {formatDate(item.created_at)}
                          </span>
                          {!item.is_read && (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-[#245A91] shrink-0"
                              title="Unread"
                            />
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>

                      {/* Footer actions & Grievance Link */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100/80">
                        {grievanceId ? (
                          <Link
                            to={getGrievanceLink(grievanceId)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245A91] hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>
                              View Grievance{' '}
                              {grievanceRef ? `(${grievanceRef})` : `#${grievanceId}`}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span />
                        )}

                        {!item.is_read && (
                          <button
                            onClick={(e) => handleMarkSingleRead(item.id, e)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors ml-auto flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
