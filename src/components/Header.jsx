import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  useNavigate,
  useLocation,
  Link
} from 'react-router-dom';
import {
  FaCalendarAlt,
  FaUserPlus,
  FaSearch,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaTimes,
  FaUserCircle,
  FaSpinner
} from "react-icons/fa";
import { MdDashboard, MdCelebration, MdNotifications } from "react-icons/md";
import { HiChartBar } from "react-icons/hi";

// Custom debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// App configuration
const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Birthday Reminder',
  logoGradient: import.meta.env.VITE_LOGO_COLOR || 'from-purple-600 to-pink-500',
  apiBaseUrl: import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api',
};

function Header({
  notificationsCount = 0,
  isAuthenticated = false,
  user = null,
  onLogout = () => { },
  onSearch = () => { }
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeNav, setActiveNav] = useState('');

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const headerRef = useRef(null);

  // Memoized time and date
  const memoizedFormatTime = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, [currentTime]);

  const memoizedFormatDate = useMemo(() => {
    return currentTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [currentTime]);

  // Get current page from pathname
  const currentPage = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'dashboard';
    if (path === '/add-birthday') return 'add';
    if (path === '/birthdays') return 'view';
    if (path === '/analytics') return 'analytics';
    if (path === '/notifications') return 'notifications';
    if (path === '/profile') return 'profile';
    if (path === '/settings') return 'settings';
    return '';
  }, [location.pathname]);

  // Set active nav when page changes
  useEffect(() => {
    setActiveNav(currentPage);
  }, [currentPage]);

  // Detect mobile devices and scroll
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => setScrolled(window.scrollY > 5);

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && searchQuery === '') {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setShowSearch(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"]');
          searchInput?.focus();
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((query) => {
      if (onSearch) onSearch(query);
    }, 300)
  ).current;

  useEffect(() => {
    if (searchQuery !== undefined) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  // Navigation handler
  const handleNavigation = (path, navKey) => {
    setActiveNav(navKey);
    navigate(path);
    setShowDropdown(false);
    setShowSearch(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
    if (onSearch) onSearch('');
  };

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    console.log('Logout button clicked');
    setIsLoggingOut(true);

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("birthdays");
      localStorage.removeItem("appSettings");

      sessionStorage.clear();

      setShowDropdown(false);

      if (onLogout && typeof onLogout === 'function') {
        await onLogout();
      }

      clearSearch();

      setTimeout(() => {
        navigate('/login');
      }, 100);

    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  }, [onLogout, navigate]);

  const handleDropdownToggle = () => setShowDropdown(prev => !prev);

  // Navigation items with React Router Link
  const navigationItems = [
    {
      path: '/home',
      key: 'dashboard',
      label: 'Dashboard',
      icon: <MdDashboard />,
      accent: 'from-blue-500 to-cyan-500',
    },
    {
      path: '/add-birthday',
      key: 'add',
      label: 'Add Birthday',
      icon: <FaUserPlus />,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      path: '/birthdays',
      key: 'view',
      label: 'Birthdays',
      icon: <MdCelebration />,
      accent: 'from-purple-500 to-pink-500',
    },
    {
      path: '/analytics',
      key: 'analytics',
      label: 'Analytics',
      icon: <HiChartBar />,
      accent: 'from-amber-500 to-orange-500',
    }
  ];

  const UserAvatar = React.memo(({ user, size = 'md' }) => (
    <div
      className={`relative ${size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} ${size === 'xl' ? 'w-12 h-12' : ''} rounded-xl overflow-hidden shadow`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold select-none">
        {user?.username?.charAt(0).toUpperCase() || 'U'}
      </div>
    </div>
  ));

  UserAvatar.displayName = 'UserAvatar';

  return (
    <>
      {/* Desktop Header */}
      <header
        ref={headerRef}
        className={`hidden md:block sticky top-0 z-50 transition-all duration-200 ${scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/90 backdrop-blur-sm'
          }`}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <Link
                to={isAuthenticated ? "/home" : "/login"}
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg p-1"
              >
                <div className="relative">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${APP_CONFIG.logoGradient} shadow flex items-center justify-center`}>
                    <FaCalendarAlt className="text-white text-sm" />
                  </div>
                </div>

                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {APP_CONFIG.name}
                  </h1>
                  <p className="text-xs text-gray-500 hidden lg:block">
                    Never miss a birthday
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation - Authenticated */}
            {isAuthenticated && (
              <nav className="flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const isActive = activeNav === item.key;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setActiveNav(item.key)}
                      className={`group relative px-3 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                      }`}
                    >
                      {/* Background gradient for active state */}
                      {isActive && (
                        <div
                          className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.accent} transition-all duration-500 ease-out`}
                          style={{
                            animation: isActive ? 'fadeInScale 0.3s ease-out' : 'none'
                          }}
                        ></div>
                      )}
                      
                      <div className="relative flex items-center space-x-2">
                        <span className={`text-base transition-colors duration-300 ${
                          isActive 
                            ? 'text-white' 
                            : `bg-gradient-to-r ${item.accent} bg-clip-text text-transparent`
                        }`}>
                          {item.icon}
                        </span>
                        <span className="font-medium text-sm tracking-wide relative">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Time Display */}
              <div
                className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg ${scrolled ? 'bg-gray-50' : 'bg-white/50'
                  }`}
              >
                <time className="text-sm font-medium text-gray-900">{memoizedFormatTime}</time>
                <div className="text-xs text-gray-500" aria-hidden="true">•</div>
                <time className="text-xs text-gray-500">{memoizedFormatDate}</time>
              </div>

              {isAuthenticated ? (
                <>
                  {/* Search */}
                  <div className="relative" ref={searchRef}>
                    {showSearch ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={handleSearch}
                          placeholder="Search birthdays..."
                          className="w-56 px-3 py-2 pl-10 pr-8 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-all duration-200 text-sm"
                          autoFocus
                        />
                        <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                          >
                            <FaTimes className="text-sm" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSearch(true)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <FaSearch className="text-gray-500 text-sm" />
                      </button>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="relative">
                    <Link
                      to="/notifications"
                      onClick={() => setActiveNav('notifications')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 relative ${
                        activeNav === 'notifications'
                          ? 'bg-amber-50 shadow-md'
                          : 'bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <MdNotifications className={`text-sm transition-colors duration-300 ${
                        activeNav === 'notifications' ? 'text-amber-600' : 'text-gray-500'
                      }`} />
                      {notificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center shadow animate-pulse">
                          {notificationsCount > 9 ? '9+' : notificationsCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={handleDropdownToggle}
                      className={`flex items-center space-x-2 p-1 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        showDropdown 
                          ? 'bg-gray-50 ring-1 ring-purple-100' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <UserAvatar user={user} />
                      <div className="text-left hidden lg:block">
                        <div className="font-medium text-gray-900 text-sm">{user?.username || 'User'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]">
                          {user?.email || ''}
                        </div>
                      </div>
                      <FaChevronDown className={`text-gray-400 transition-transform duration-300 text-xs ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn">
                        <div className="p-3 bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex items-center space-x-3">
                            <UserAvatar user={user} size="lg" />
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 text-sm truncate">{user?.username || 'User'}</div>
                              <div className="text-xs text-gray-600 truncate">{user?.email || ''}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {APP_CONFIG.apiBaseUrl.includes('render.com') ? 'Production' : 'Development'} Mode
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-1">
                          {/* Profile Link */}
                          <button
                            onClick={() => {
                              setActiveNav('profile');
                              setShowDropdown(false);
                              navigate('/profile');
                            }}
                            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 text-sm focus:outline-none focus:bg-gray-50 ${
                              activeNav === 'profile'
                                ? 'bg-purple-50 text-purple-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                              activeNav === 'profile'
                                ? 'bg-purple-100'
                                : 'bg-gray-100'
                            }`}>
                              <FaUserCircle className={`text-sm ${
                                activeNav === 'profile'
                                  ? 'text-purple-600'
                                  : 'text-gray-600'
                              }`} />
                            </div>
                            <span className="font-medium">Profile</span>
                          </button>

                          {/* Settings Link */}
                          <button
                            onClick={() => {
                              setActiveNav('settings');
                              setShowDropdown(false);
                              navigate('/settings');
                            }}
                            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 text-sm focus:outline-none focus:bg-gray-50 ${
                              activeNav === 'settings'
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                              activeNav === 'settings'
                                ? 'bg-blue-100'
                                : 'bg-gray-100'
                            }`}>
                              <FaCog className={`text-sm ${
                                activeNav === 'settings'
                                  ? 'text-blue-600'
                                  : 'text-gray-600'
                              }`} />
                            </div>
                            <span className="font-medium">Settings</span>
                          </button>

                          <div className="border-t border-gray-100 my-1"></div>

                          {/* Logout Button */}
                          <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 text-sm focus:outline-none ${
                              isLoggingOut 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-red-50 focus:bg-red-50'
                            } ${isLoggingOut ? 'text-red-400' : 'text-red-600'}`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                              {isLoggingOut ? (
                                <FaSpinner className="text-red-500 text-sm animate-spin" />
                              ) : (
                                <FaSignOutAlt className="text-red-500 text-sm" />
                              )}
                            </div>
                            <span className="font-medium">
                              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Auth Buttons */
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:shadow-md transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50">
        <div className={`${scrolled ? 'bg-white shadow-lg' : 'bg-white'} transition-all duration-200`}>
          {/* Top Bar */}
          <div className="px-3 py-2">
            {showSearch ? (
              <div className="flex items-center space-x-2" ref={searchRef}>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search..."
                    className="w-full px-3 py-2 pl-10 pr-8 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-blue-400 transition-all text-sm"
                    autoFocus
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-2.5 text-gray-400 focus:outline-none"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="px-2 py-2 text-blue-600 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link
                  to={isAuthenticated ? "/home" : "/login"}
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setActiveNav('dashboard')}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow">
                    <FaCalendarAlt className="text-white text-sm" />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900 text-sm">{APP_CONFIG.name}</h1>
                    <time className="text-xs text-gray-500">{memoizedFormatTime}</time>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => setShowSearch(true)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <FaSearch className="text-gray-600 text-sm" />
                      </button>
                      <Link
                        to="/notifications"
                        onClick={() => setActiveNav('notifications')}
                        className={`relative w-8 h-8 rounded-lg flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          activeNav === 'notifications'
                            ? 'bg-amber-50'
                            : 'bg-gray-100'
                        }`}
                      >
                        <MdNotifications className={`text-sm ${
                          activeNav === 'notifications' ? 'text-amber-600' : 'text-gray-600'
                        }`} />
                        {notificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center animate-pulse">
                            {notificationsCount}
                          </span>
                        )}
                      </Link>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={handleDropdownToggle}
                          className="w-8 h-8 rounded-lg overflow-hidden shadow focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex space-x-1">
                      <Link
                        to="/login"
                        className="px-2 py-1.5 text-gray-700 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 rounded"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          {isAuthenticated && !showSearch && (
            <nav>
              <div className="flex justify-around items-center px-1 py-1">
                {navigationItems.map((item) => {
                  const isActive = activeNav === item.key;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setActiveNav(item.key)}
                      className={`group relative flex flex-col items-center justify-center p-1 transition-all duration-300 flex-1 mx-0.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                        isActive
                          ? `text-white shadow-lg scale-105`
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {/* Background for active state */}
                      {isActive && (
                        <div
                          className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.accent}`}
                          style={{
                            animation: 'fadeIn 0.3s ease-out'
                          }}
                        />
                      )}
                      
                      <span className={`text-base relative z-10 transition-all duration-300 ${
                        isActive ? 'scale-110' : ''
                      }`}>
                        {item.icon}
                      </span>
                      <span className={`text-xs font-medium mt-0.5 relative z-10 ${
                        isActive ? 'font-semibold' : ''
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {showDropdown && isAuthenticated && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50 flex justify-end"
          onClick={() => setShowDropdown(false)}
        >
          <div
            className="w-4/5 max-w-sm bg-white h-full shadow-xl animate-slideIn overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-b from-gray-50 to-white sticky top-0">
              <div className="flex items-center space-x-3">
                <UserAvatar user={user} size="xl" />
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-base truncate">{user?.username || 'User'}</h3>
                  <p className="text-xs text-gray-600 truncate">{user?.email || ''}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {APP_CONFIG.apiBaseUrl.includes('render.com') ? 'Production' : 'Development'} Mode
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setActiveNav('profile');
                  setShowDropdown(false);
                  navigate('/profile');
                }}
                className={`w-full text-left px-3 py-3 rounded-lg flex items-center space-x-2 text-sm focus:outline-none transition-colors duration-300 ${
                  activeNav === 'profile'
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                  activeNav === 'profile'
                    ? 'bg-purple-100'
                    : 'bg-gray-100'
                }`}>
                  <FaUserCircle className={`text-sm ${
                    activeNav === 'profile'
                      ? 'text-purple-600'
                      : 'text-gray-600'
                  }`} />
                </div>
                <span className="font-medium">Profile</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('settings');
                  setShowDropdown(false);
                  navigate('/settings');
                }}
                className={`w-full text-left px-3 py-3 rounded-lg flex items-center space-x-2 text-sm focus:outline-none transition-colors duration-300 ${
                  activeNav === 'settings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                  activeNav === 'settings'
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                }`}>
                  <FaCog className={`text-sm ${
                    activeNav === 'settings'
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`} />
                </div>
                <span className="font-medium">Settings</span>
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`w-full mt-2 px-3 py-3 rounded-lg flex items-center space-x-2 text-sm focus:outline-none transition-colors duration-300 ${
                  isLoggingOut 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-red-50'
                } ${isLoggingOut ? 'text-red-400' : 'text-red-600'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  {isLoggingOut ? (
                    <FaSpinner className="text-red-500 text-sm animate-spin" />
                  ) : (
                    <FaSignOutAlt className="text-red-500 text-sm" />
                  )}
                </div>
                <span className="font-medium">
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Spacer */}
      {isAuthenticated && !showSearch && <div className="md:hidden "></div>}
    </>
  );
}

export default Header;