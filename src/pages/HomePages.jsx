import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaSync,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const FILTER_OPTIONS = {
  UPCOMING: 'upcoming',
  TODAY: 'today',
  RECENT: 'recent',
  ALL: 'all'
};

function HomePage({ 
  birthdays = [], 
  notifications = [], 
  isLoading = false, 
  onRefresh = () => {}, 
  onEdit = () => {}, 
  onDelete = () => {} 
}) {
  const navigate = useNavigate();
  
  const [filteredBirthdays, setFilteredBirthdays] = useState([]);
  const [activeFilter, setActiveFilter] = useState(FILTER_OPTIONS.UPCOMING);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllBirthdays, setShowAllBirthdays] = useState(false);
  const [displayBirthdays, setDisplayBirthdays] = useState([]);

  // Ensure birthdays is an array
  const safeBirthdays = Array.isArray(birthdays) ? birthdays : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // Statistics calculation
  const stats = useMemo(() => {
    try {
      const today = new Date();
      const currentMonth = today.getMonth();
      
      const upcoming = safeBirthdays.filter(birthday => {
        try {
          const birthDate = new Date(birthday.date);
          birthDate.setFullYear(today.getFullYear());
          const diffDays = Math.ceil((birthDate - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        } catch (error) {
          console.error('Error processing birthday date:', error);
          return false;
        }
      });

      const todayBdays = safeBirthdays.filter(birthday => {
        try {
          const birthDate = new Date(birthday.date);
          return birthDate.getMonth() === today.getMonth() && 
                birthDate.getDate() === today.getDate();
        } catch (error) {
          return false;
        }
      });

      const thisMonth = safeBirthdays.filter(birthday => {
        try {
          const birthDate = new Date(birthday.date);
          return birthDate.getMonth() === currentMonth;
        } catch (error) {
          return false;
        }
      });

      const totalAge = safeBirthdays.reduce((sum, birthday) => {
        try {
          const birthYear = new Date(birthday.date).getFullYear();
          return sum + (today.getFullYear() - birthYear);
        } catch (error) {
          return sum;
        }
      }, 0);
      
      const averageAge = safeBirthdays.length > 0 
        ? Math.round(totalAge / safeBirthdays.length) 
        : 0;

      return {
        total: safeBirthdays.length,
        upcoming: upcoming.length,
        today: todayBdays.length,
        thisMonth: thisMonth.length,
        notificationCount: safeNotifications.filter(n => n && !n.isRead).length,
        averageAge
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        total: 0,
        upcoming: 0,
        today: 0,
        thisMonth: 0,
        notificationCount: 0,
        averageAge: 0
      };
    }
  }, [safeBirthdays, safeNotifications]);

  // Get greeting based on time of day
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Handle quick check for notifications
  const handleQuickCheck = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';
      
      const response = await fetch(`${API_BASE}/notifications/check`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Data refreshed successfully!');
        onRefresh();
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        throw new Error('Failed to refresh data');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, navigate]);

  // Filter and sort birthdays
  useEffect(() => {
    try {
      const today = new Date();
      let filtered = [];

      switch (activeFilter) {
        case FILTER_OPTIONS.UPCOMING:
          filtered = safeBirthdays.filter(birthday => {
            try {
              const birthDate = new Date(birthday.date);
              birthDate.setFullYear(today.getFullYear());
              const diffDays = Math.ceil((birthDate - today) / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays <= 30;
            } catch (error) {
              return false;
            }
          }).sort((a, b) => {
            try {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              dateA.setFullYear(today.getFullYear());
              dateB.setFullYear(today.getFullYear());
              return dateA - dateB;
            } catch (error) {
              return 0;
            }
          });
          break;

        case FILTER_OPTIONS.TODAY:
          filtered = safeBirthdays.filter(birthday => {
            try {
              const birthDate = new Date(birthday.date);
              return birthDate.getMonth() === today.getMonth() && 
                    birthDate.getDate() === today.getDate();
            } catch (error) {
              return false;
            }
          });
          break;

        case FILTER_OPTIONS.RECENT:
          filtered = safeBirthdays.filter(birthday => {
            try {
              const birthDate = new Date(birthday.date);
              birthDate.setFullYear(today.getFullYear());
              const diffDays = Math.ceil((today - birthDate) / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays <= 7;
            } catch (error) {
              return false;
            }
          }).sort((a, b) => {
            try {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              dateA.setFullYear(today.getFullYear());
              dateB.setFullYear(today.getFullYear());
              return dateB - dateA;
            } catch (error) {
              return 0;
            }
          });
          break;

        default:
          filtered = [...safeBirthdays];
      }

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(birthday => {
          if (!birthday) return false;
          const name = birthday.name ? birthday.name.toLowerCase() : '';
          const notes = birthday.notes ? birthday.notes.toLowerCase() : '';
          const relationship = birthday.relationship ? birthday.relationship.toLowerCase() : '';
          return name.includes(term) || notes.includes(term) || relationship.includes(term);
        });
      }

      // Set filtered birthdays for stats
      setFilteredBirthdays(filtered);
      
      // Set display birthdays based on showAll state
      if (showAllBirthdays) {
        setDisplayBirthdays(filtered);
      } else {
        setDisplayBirthdays(filtered.slice(0, 8));
      }
    } catch (error) {
      console.error('Error filtering birthdays:', error);
      setFilteredBirthdays([]);
      setDisplayBirthdays([]);
    }
  }, [safeBirthdays, activeFilter, searchTerm, showAllBirthdays]);

  // Toggle show all birthdays
  const toggleShowAllBirthdays = () => {
    setShowAllBirthdays(!showAllBirthdays);
  };

  const getFilterLabel = () => {
    switch (activeFilter) {
      case FILTER_OPTIONS.TODAY: return "Today's Birthdays";
      case FILTER_OPTIONS.RECENT: return "Recent Birthdays";
      case FILTER_OPTIONS.ALL: return "All Birthdays";
      default: return "Upcoming Birthdays";
    }
  };

  // Navigation handlers
  const navigateTo = (path) => {
    navigate(path);
  };

  const FilterButton = ({ filter, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveFilter(filter);
        setShowAllBirthdays(false); // Reset to limited view when filter changes
      }}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        activeFilter === filter
          ? 'bg-purple-600 text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
      }`}
    >
      <Icon className="mr-2 text-base" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const ActionButton = ({ onClick, children, className = '', icon: Icon }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors ${className}`}
    >
      {Icon && <Icon className="mr-2" />}
      {children}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {getGreeting()}! 
            </h1>
            <p className="text-purple-100 mt-1">
              {stats.today > 0 
                ? `${stats.today} birthday${stats.today !== 1 ? 's' : ''} today!`
                : 'No birthdays today. Check upcoming celebrations below.'
              }
            </p>
          </div>
          <button
            onClick={handleQuickCheck}
            disabled={isRefreshing}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-colors disabled:opacity-50"
          >
            <FaSync className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Birthdays</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          <div className="text-sm text-gray-600">Next 7 Days</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-orange-600">{stats.averageAge}</div>
          <div className="text-sm text-gray-600">Avg Age</div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {/* Quick Insights Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-800 flex items-center">
            <FaLightbulb className="mr-2" />
            Quick Insights
          </h3>
          <div className="space-y-2 text-sm mt-2">
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
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-100">
          <h3 className="text-lg font-semibold text-yellow-800">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <ActionButton 
              onClick={() => navigateTo('/add-birthday')}
              className="bg-purple-500 text-white hover:bg-purple-600"
              icon={FaPlus}
            >
              Add New
            </ActionButton>
            <ActionButton 
              onClick={() => navigateTo('/birthdays')}
              className="bg-white text-purple-700 border border-purple-300 hover:bg-purple-50"
              icon={FaEye}
            >
              View All
            </ActionButton>
            <ActionButton 
              onClick={() => navigateTo('/notifications')}
              className="bg-yellow-500 text-white hover:bg-yellow-600"
              icon={FaBell}
            >
              Notifications
            </ActionButton>
            <ActionButton 
              onClick={() => navigateTo('/settings')}
              className="bg-gray-500 text-white hover:bg-gray-600"
              icon={FaCog}
            >
              Settings
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mt-6">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            <FilterButton filter={FILTER_OPTIONS.UPCOMING} label="Upcoming" icon={FaCalendarAlt} />
            <FilterButton filter={FILTER_OPTIONS.TODAY} label="Today" icon={FaBirthdayCake} />
            <FilterButton filter={FILTER_OPTIONS.RECENT} label="Recent" icon={FaHistory} />
            <FilterButton filter={FILTER_OPTIONS.ALL} label="All" icon={FaUsers} />
          </div>
          
          <div className="relative w-full md:w-64 mt-3 md:mt-0">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search birthdays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Birthdays Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-3 text-gray-600">Loading birthdays...</p>
        </div>
      ) : displayBirthdays.length > 0 ? (
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {getFilterLabel()}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredBirthdays.length} {searchTerm ? 'found' : 'total'}
              </span>
            </div>
            
            {!showAllBirthdays && filteredBirthdays.length > 8 && (
              <button
                onClick={toggleShowAllBirthdays}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium text-sm"
              >
                <FaEye className="w-4 h-4" />
                View All ({filteredBirthdays.length})
                <FaChevronDown className="w-3 h-3" />
              </button>
            )}
            
            {showAllBirthdays && filteredBirthdays.length > 8 && (
              <button
                onClick={toggleShowAllBirthdays}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-lg hover:from-gray-600 hover:to-gray-800 transition-all duration-200 font-medium text-sm"
              >
                <FaEye className="w-4 h-4" />
                Show Less
                <FaChevronUp className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {displayBirthdays.map(birthday => {
              if (!birthday) return null;
              return (
                <BirthdayCard 
                  key={birthday._id || Math.random()} 
                  birthday={birthday} 
                  onEdit={() => onEdit(birthday)}
                  onDelete={() => onDelete(birthday._id)}
                  showActions
                  imageBaseUrl="https://birthdarreminder.onrender.com"
                />
              );
            })}
          </div>
          
          {/* View All reminder when not showing all */}
          {!showAllBirthdays && filteredBirthdays.length > 8 && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-3 text-gray-600 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-200">
                <FaExclamationCircle className="text-blue-500 w-5 h-5" />
                <span className="text-sm">
                  Showing 8 of {filteredBirthdays.length} birthdays. 
                  <button 
                    onClick={toggleShowAllBirthdays}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                  >
                    Click here to view all
                  </button>
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl border-2 border-dashed border-gray-200 mt-6">
          <FaBirthdayCake className="text-5xl text-purple-400 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-700 mt-3">
            {searchTerm ? 'No birthdays found' : 'No birthdays yet'}
          </h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
            {searchTerm 
              ? `No birthdays match "${searchTerm}". Try a different search term.`
              : 'Start by adding birthdays to get reminders!'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={() => navigateTo('/add-birthday')}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl mt-4"
            >
              Add Your First Birthday
            </button>
          )}
        </div>
      )}

      {/* Tips Section */}
      {!isLoading && safeBirthdays.length > 2 && !showAllBirthdays && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <h4 className="text-md font-semibold text-blue-800 flex items-center">
              <FaChartLine className="mr-2" />
              Pro Tip
            </h4>
            <p className="text-blue-700 text-sm mt-2">
              Use the "View All" button to see all birthdays at once. Filter by categories or search for specific people.
            </p>
            <button 
              onClick={() => navigateTo('/birthdays')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
            >
              Explore all birthdays in full page →
            </button>
          </div>

          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <h4 className="text-md font-semibold text-green-800 flex items-center">
              <FaBell className="mr-2" />
              Birthday Insights
            </h4>
            <p className="text-green-700 text-sm mt-2">
              You have birthdays spread across {new Set(safeBirthdays.map(b => {
                try {
                  return new Date(b.date).getMonth();
                } catch {
                  return -1;
                }
              })).size} different months.
            </p>
          </div>
        </div>
      )}

      {/* Notification Preview */}
      {stats.notificationCount > 0 && (
        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200 mt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex-1">
              <h4 className="text-md font-semibold text-yellow-800 flex items-center">
                <FaBell className="mr-2 w-4 h-4" />
                You have {stats.notificationCount} notification{stats.notificationCount !== 1 ? 's' : ''}
              </h4>
              <p className="text-yellow-700 text-sm mt-1">
                Check your notifications for upcoming birthdays and reminders.
              </p>
            </div>
            <button 
              onClick={() => navigateTo('/notifications')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap text-sm mt-2 md:mt-0"
            >
              View Notifications
            </button>
          </div>
        </div>
      )}

      {/* Current View Info */}
      {showAllBirthdays && displayBirthdays.length > 0 && (
        <div className="fixed bottom-4 right-4 z-10">
          <div className="bg-white rounded-xl shadow-xl p-3 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                Showing all {displayBirthdays.length} birthdays
              </span>
              <button
                onClick={toggleShowAllBirthdays}
                className="ml-2 text-xs text-gray-500 hover:text-gray-700"
              >
                [Show Less]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;