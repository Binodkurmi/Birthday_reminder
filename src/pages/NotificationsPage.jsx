import React, { useState, useEffect, useMemo } from 'react';
import { FaBirthdayCake, FaBell, FaCog, FaRedo, FaClock, FaInbox, FaLightbulb } from "react-icons/fa";
import { toast } from 'react-toastify';

function NotificationsPage({ notifications, setNotifications, onNotificationAction }) {
  const [isLoading, setIsLoading] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read', 'birthday', 'system'
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  // Filter notifications based on current filter
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      switch (filter) {
        case 'unread':
          return !notif.isRead;
        case 'read':
          return notif.isRead;
        case 'birthday':
          return notif.type === 'birthday';
        case 'system':
          return notif.type === 'system';
        default:
          return true;
      }
    });
  }, [notifications, filter]);

  const unreadCount = notifications.filter(notif => !notif.isRead).length;
  const birthdayNotifications = notifications.filter(notif => notif.type === 'birthday').length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED

      const response = await fetch(`${API_BASE}/notifications`, { // ✅ REMOVED duplicate /api
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        window.location.reload();
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED

      const response = await fetch(`${API_BASE}/notifications/${id}/read`, { // ✅ REMOVED duplicate /api
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif =>
          notif._id === id ? { ...notif, isRead: true } : notif
        ));
        toast.success('Marked as read');
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        window.location.reload();
      } else {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markMultipleAsRead = async (ids) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED

      const response = await fetch(`${API_BASE}/notifications/read-multiple`, { // ✅ REMOVED duplicate /api
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: Array.from(ids) })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif =>
          ids.has(notif._id) ? { ...notif, isRead: true } : notif
        ));
        setSelectedNotifications(new Set());
        toast.success(`Marked ${ids.size} notifications as read`);
      } else {
        throw new Error('Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED

      const response = await fetch(`${API_BASE}/notifications/${id}`, { // ✅ REMOVED duplicate /api
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== id));
        setSelectedNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        toast.success('Notification deleted');
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        window.location.reload();
      } else {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const deleteMultipleNotifications = async (ids) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED

      const deletePromises = Array.from(ids).map(id =>
        fetch(`${API_BASE}/notifications/${id}`, { // ✅ REMOVED duplicate /api
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );

      await Promise.all(deletePromises);

      setNotifications(prev => prev.filter(notif => !ids.has(notif._id)));
      setSelectedNotifications(new Set());
      toast.success(`Deleted ${ids.size} notifications`);
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED

      const response = await fetch(`${API_BASE}/notifications/read-all`, { // ✅ REMOVED duplicate /api
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        toast.success('All notifications marked as read');
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        window.location.reload();
      } else {
        throw new Error('Failed to mark all as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;

    if (!window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }

    setClearingAll(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED

      const response = await fetch(`${API_BASE}/notifications`, { // ✅ REMOVED duplicate /api
        method: 'DELETE', // Changed to DELETE for clearing all
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications([]);
        setSelectedNotifications(new Set());
        toast.success('All notifications cleared');
      } else {
        throw new Error('Failed to clear notifications');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    } finally {
      setClearingAll(false);
    }
  };

  const handleNotificationClick = (notif) => {
    if (isSelecting) {
      setSelectedNotifications(prev => {
        const newSet = new Set(prev);
        if (newSet.has(notif._id)) {
          newSet.delete(notif._id);
        } else {
          newSet.add(notif._id);
        }
        return newSet;
      });
    } else if (!notif.isRead) {
      markAsRead(notif._id);
    }
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n._id)));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "birthday":
        return <FaBirthdayCake className="text-pink-500" />;
      case "reminder":
        return <FaClock className="text-blue-500" />;
      case "system":
        return <FaCog className="text-gray-600" />;
      case "update":
        return <FaRedo className="text-green-500" />;
      default:
        return <FaBell className="text-yellow-500" />;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-purple-100">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up!'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchNotifications}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              title="Refresh notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats and Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('birthday')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'birthday'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Birthdays ({birthdayNotifications})
            </button>
          </div>

          <div className="flex space-x-2">
            {selectedNotifications.size > 0 && (
              <>
                <button
                  onClick={() => markMultipleAsRead(selectedNotifications)}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  Mark Read ({selectedNotifications.size})
                </button>
                <button
                  onClick={() => deleteMultipleNotifications(selectedNotifications)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  Delete ({selectedNotifications.size})
                </button>
              </>
            )}
            <button
              onClick={() => setIsSelecting(!isSelecting)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isSelecting
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {isSelecting ? 'Cancel' : 'Select'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 text-blue-500">
              <FaInbox />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'Notifications will appear here for upcoming birthdays and system updates.'
                : `Try changing the filter to see ${filter === 'unread' ? 'read' : 'other'} notifications.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {isSelecting && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.size === filteredNotifications.length}
                    onChange={toggleSelectAll}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Select all ({filteredNotifications.length})
                  </span>
                </label>
              </div>
            )}

            {filteredNotifications.map(notif => (
              <div
                key={notif._id}
                className={`p-4 transition-colors cursor-pointer ${selectedNotifications.has(notif._id)
                  ? 'bg-blue-50'
                  : !notif.isRead
                    ? 'bg-purple-50'
                    : 'hover:bg-gray-50'
                  }`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex items-start space-x-3">
                  {isSelecting && (
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notif._id)}
                      onChange={() => { }}
                      className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                        <h3 className={`font-medium ${!notif.isRead ? 'text-purple-900' : 'text-gray-900'}`}>
                          {notif.message}
                        </h3>
                        {!notif.isRead && !isSelecting && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {getTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    {notif.birthdayId && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="text-xl sm:text-2xl md:text-3xl">
                          <FaBirthdayCake />
                        </span>{notif.birthdayId.name}
                      </p>
                    )}

                    {notif.metadata && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(notif.metadata).map(([key, value]) => (
                          <span key={key} className="bg-gray-100 px-2 py-1 rounded mr-2">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}

                    {!isSelecting && (
                      <div className="flex space-x-2 mt-3">
                        {!notif.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif._id);
                            }}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif._id);
                          }}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Actions Footer */}
      {notifications.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              {unreadCount} unread • {notifications.length} total
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={clearAllNotifications}
                disabled={clearingAll}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {clearingAll ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
          <span className="mr-2 text-yellow-500">
            <FaLightbulb />
          </span>
          Notification Tips
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click on notifications to mark them as read</li>
          <li>• Use the select mode to manage multiple notifications at once</li>
          <li>• Notifications are automatically created for upcoming birthdays</li>
        </ul>
      </div>
    </div>
  );
}

export default NotificationsPage;