// pages/HomePage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import BirthdayCard from '../components/BirthdayCard';
import {
  FaCalendarAlt,
  FaBirthdayCake,
  FaChartLine,
  FaBell,
  FaHistory,
  FaUsers,
  FaSearch,
  FaPlus,
  FaEye,
  FaCog,
  FaLightbulb,
  FaSync
} from 'react-icons/fa';

// Constants for better maintainability
const FILTER_OPTIONS = {
  UPCOMING: 'upcoming',
  TODAY: 'today',
  RECENT: 'recent',
  ALL: 'all'
};

const STAT_CARDS = [
  { key: 'total', label: 'Total', color: 'purple' },
  { key: 'upcoming', label: 'Next 7 Days', color: 'blue' },
  { key: 'thisMonth', label: 'This Month', color: 'green' },
  { key: 'averageAge', label: 'Avg Age', color: 'orange' }
];

const ACTION_BUTTONS = [
  { label: 'Add New', action: 'add', color: 'purple', icon: FaPlus },
  { label: 'View All', action: 'view', color: 'white', variant: 'outline' },
  { label: 'Notifications', action: 'notifications', color: 'yellow' },
  { label: 'Settings', action: 'settings', color: 'gray' }
];

function HomePage({ 
  birthdays, 
  notifications, 
  isLoading, 
  setCurrentPage, 
  onRefresh, 
  onEdit, 
  onDelete 
}) {
  // Data sanitization
  const safeBirthdays = Array.isArray(birthdays) ? birthdays : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  
  // State management
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [activeFilter, setActiveFilter] = useState(FILTER_OPTIONS.UPCOMING);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Statistics calculation
  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    
    const upcoming = safeBirthdays.filter(birthday => {
      const birthDate = new Date(birthday.date);
      birthDate.setFullYear(today.getFullYear());
      const diffDays = Math.ceil((birthDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    const todayBdays = safeBirthdays.filter(birthday => {
      const birthDate = new Date(birthday.date);
      return birthDate.getMonth() === today.getMonth() && 
             birthDate.getDate() === today.getDate();
    });

    const thisMonth = safeBirthdays.filter(birthday => {
      const birthDate = new Date(birthday.date);
      return birthDate.getMonth() === currentMonth;
    });

    const totalAge = safeBirthdays.reduce((sum, birthday) => {
      return sum + (today.getFullYear() - new Date(birthday.date).getFullYear());
    }, 0);
    
    const averageAge = safeBirthdays.length > 0 
      ? Math.round(totalAge / safeBirthdays.length) 
      : 0;

    return {
      total: safeBirthdays.length,
      upcoming: upcoming.length,
      today: todayBdays.length,
      thisMonth: thisMonth.length,
      notificationCount: safeNotifications.length,
      averageAge
    };
  }, [safeBirthdays, safeNotifications]);

  // Get greeting based on time of day
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Handle edit birthday
  const handleEdit = useCallback((birthday) => {
    if (onEdit) {
      onEdit(birthday);
    } else {
      console.log("Edit birthday:", birthday);
      // Implement fallback edit logic here
    }
  }, [onEdit]);

  // Handle delete birthday
  const handleDelete = useCallback((birthdayId) => {
    if (onDelete) {
      onDelete(birthdayId);
    } else {
      console.log("Delete birthday with ID:", birthdayId);
      // Implement fallback delete logic here
    }
  }, [onDelete]);

  // Handle quick check for notifications
  const handleQuickCheck = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/notifications/check`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notifications?.length > 0) {
          toast.success(`Found ${data.notifications.length} new notifications!`);
          onRefresh?.();
        } else {
          toast.info('Everything is up to date!');
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        window.location.reload();
      } else {
        throw new Error('Failed to check notifications');
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
      toast.error('Failed to check for notifications');
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  // Handle quick add
  const handleQuickAdd = useCallback(() => {
    setCurrentPage('add');
  }, [setCurrentPage]);

  // Filter and sort birthdays
  useEffect(() => {
    const today = new Date();
    let filtered = [];

    switch (activeFilter) {
      case FILTER_OPTIONS.UPCOMING:
        filtered = safeBirthdays.filter(birthday => {
          const birthDate = new Date(birthday.date);
          birthDate.setFullYear(today.getFullYear());
          const diffDays = Math.ceil((birthDate - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 30;
        }).sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          dateA.setFullYear(today.getFullYear());
          dateB.setFullYear(today.getFullYear());
          return dateA - dateB;
        });
        break;

      case FILTER_OPTIONS.TODAY:
        filtered = safeBirthdays.filter(birthday => {
          const birthDate = new Date(birthday.date);
          return birthDate.getMonth() === today.getMonth() && 
                 birthDate.getDate() === today.getDate();
        });
        break;

      case FILTER_OPTIONS.RECENT:
        filtered = safeBirthdays.filter(birthday => {
          const birthDate = new Date(birthday.date);
          birthDate.setFullYear(today.getFullYear());
          const diffDays = Math.ceil((today - birthDate) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        }).sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          dateA.setFullYear(today.getFullYear());
          dateB.setFullYear(today.getFullYear());
          return dateB - dateA;
        });
        break;

      default:
        filtered = [...safeBirthdays];
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(birthday =>
        birthday.name.toLowerCase().includes(term) ||
        (birthday.notes && birthday.notes.toLowerCase().includes(term))
      );
    }

    setUpcomingBirthdays(filtered);
  }, [safeBirthdays, activeFilter, searchTerm]);

  // Component for filter buttons
  const FilterButton = ({ filter, label, icon: Icon }) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        activeFilter === filter
          ? 'bg-purple-600 text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
      }`}
      aria-label={`Filter by ${label}`}
    >
      <Icon className="mr-2 text-base" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  // Get filter display label
  const getFilterLabel = () => {
    switch (activeFilter) {
      case FILTER_OPTIONS.TODAY: return "Today's Birthdays";
      case FILTER_OPTIONS.RECENT: return "Recent Birthdays";
      case FILTER_OPTIONS.ALL: return "All Birthdays";
      default: return "Upcoming Birthdays";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mt-0 sm:mt-0">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              {getGreeting()}! 
            </h1>
            <p className="text-purple-100 text-sm sm:text-base">
              {stats.today > 0 
                ? `${stats.today} birthday${stats.today !== 1 ? 's' : ''} today!`
                : 'No birthdays today. Check upcoming celebrations below.'
              }
            </p>
          </div>
          <button
            onClick={handleQuickCheck}
            disabled={isRefreshing}
            className="bg-white/20 hover:bg-white/30 p-2 sm:p-3 rounded-xl transition-colors disabled:opacity-50"
            title="Check for updates"
            aria-label="Check for updates"
          >
            <FaSync className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {STAT_CARDS.map(({ key, label, color }) => (
          <div 
            key={key} 
            className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100"
          >
            <div className={`text-xl sm:text-2xl font-bold text-${color}-600`}>
              {stats[key]}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Quick Insights Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-purple-100">
          <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-3 flex items-center">
            <FaLightbulb className="mr-2" />
            Quick Insights
          </h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Notifications</span>
              <span className="font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {stats.notificationCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today's Celebrations</span>
              <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {stats.today}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Upcoming Week</span>
              <span className="font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {stats.upcoming}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 sm:p-6 border border-yellow-100">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-3 flex items-center">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {ACTION_BUTTONS.map(({ label, action, color, variant, icon: Icon }) => (
              <button
                key={action}
                onClick={() => setCurrentPage(action)}
                className={`py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm flex items-center justify-center ${
                  variant === 'outline'
                    ? 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                    : `bg-${color}-${color === 'white' ? '' : '500'} text-white hover:bg-${color}-${color === 'white' ? '100' : '600'}`
                }`}
              >
                {Icon && <Icon className="mr-1 sm:mr-2" />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            <FilterButton filter={FILTER_OPTIONS.UPCOMING} label="Upcoming" icon={FaCalendarAlt} />
            <FilterButton filter={FILTER_OPTIONS.TODAY} label="Today" icon={FaBirthdayCake} />
            <FilterButton filter={FILTER_OPTIONS.RECENT} label="Recent" icon={FaHistory} />
            <FilterButton filter={FILTER_OPTIONS.ALL} label="All" icon={FaUsers} />
          </div>
          
          <div className="relative w-full sm:w-48 lg:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search birthdays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              aria-label="Search birthdays"
            />
          </div>
        </div>
      </div>

      {/* Birthdays Grid */}
      {isLoading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading birthdays...</p>
        </div>
      ) : upcomingBirthdays.length > 0 ? (
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {getFilterLabel()}
            </h2>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
              {upcomingBirthdays.length} {upcomingBirthdays.length === 1 ? 'result' : 'results'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {upcomingBirthdays.map(birthday => (
              <BirthdayCard 
                key={birthday._id || birthday.id} 
                birthday={birthday} 
                onEdit={() => handleEdit(birthday)}
                onDelete={() => handleDelete(birthday._id || birthday.id)}
                showActions
                imageBaseUrl="http://localhost:5000"
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState 
          searchTerm={searchTerm}
          onQuickAdd={handleQuickAdd}
        />
      )}

      {/* Tips and Analytics Section */}
      {!isLoading && safeBirthdays.length > 2 && (
        <TipsAndAnalytics 
          stats={stats}
          safeBirthdays={safeBirthdays}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Notification Preview */}
      {stats.notificationCount > 0 && (
        <NotificationPreview 
          notificationCount={stats.notificationCount}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
}

// Sub-components for better organization

const EmptyState = ({ searchTerm, onQuickAdd }) => (
  <div className="text-center py-8 sm:py-16 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border-2 border-dashed border-gray-200">
    <div className="mb-4 sm:mb-6">
      <FaBirthdayCake className="text-4xl sm:text-6xl text-purple-400 mx-auto" />
    </div>
    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
      {searchTerm ? 'No birthdays found' : 'No birthdays yet'}
    </h3>
    <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
      {searchTerm 
        ? `No birthdays match "${searchTerm}". Try a different search term.`
        : 'Start by adding birthdays to get reminders and celebrate special moments!'
      }
    </p>
    {!searchTerm && (
      <button 
        onClick={onQuickAdd}
        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
      >
        Add Your First Birthday
      </button>
    )}
  </div>
);

const TipsAndAnalytics = ({ stats, safeBirthdays, setCurrentPage }) => (
  <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
    <div className="bg-blue-50 rounded-2xl p-4 sm:p-5 border border-blue-200">
      <h4 className="text-base sm:text-lg font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center">
        <FaChartLine className="mr-2 text-xl" />
        Pro Tip
      </h4>
      <p className="text-blue-700 text-xs sm:text-sm mb-2 sm:mb-3">
        Use the search feature to quickly find birthdays by name or notes. You can also filter by relationship type in the View All page.
      </p>
      <button 
        onClick={() => setCurrentPage('view')}
        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
      >
        Explore all birthdays →
      </button>
    </div>

    <div className="bg-green-50 rounded-2xl p-4 sm:p-5 border border-green-200">
      <h4 className="text-base sm:text-lg font-semibold text-green-800 mb-2 sm:mb-3 flex items-center">
        <FaBell className="mr-2 text-xl" />
        Birthday Insights
      </h4>
      <p className="text-green-700 text-xs sm:text-sm">
        You have birthdays spread across {new Set(safeBirthdays.map(b => new Date(b.date).getMonth())).size} different months. 
        The most common age in your list is {stats.averageAge} years old.
      </p>
    </div>
  </div>
);

const NotificationPreview = ({ notificationCount, setCurrentPage }) => (
  <div className="bg-yellow-50 rounded-2xl p-4 sm:p-5 border border-yellow-200 mb-6 sm:mb-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex-1">
        <h4 className="text-base sm:text-lg font-semibold text-yellow-800 mb-1 flex items-center">
          <FaBell className="mr-2 w-5 h-5" />
          You have {notificationCount} notification{notificationCount !== 1 ? 's' : ''}
        </h4>
        <p className="text-yellow-700 text-xs sm:text-sm">
          Check your notifications for upcoming birthdays and reminders.
        </p>
      </div>
      <button 
        onClick={() => setCurrentPage('notifications')}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap text-xs sm:text-sm"
      >
        View Notifications
      </button>
    </div>
  </div>
);

export default HomePage;