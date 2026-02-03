import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

// App configuration from environment variables
const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'ChronoBirthday',
  logoGradient: import.meta.env.VITE_LOGO_COLOR || 'from-purple-600 to-pink-500',
  apiBaseUrl: import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api',
  enableAnalytics: import.meta.env.PROD || false,
  baseUrl: window.location.origin
};

// Pages configuration with URLs
const PAGE_ROUTES = {
  dashboard: '/',
  home: '/',
  add: '/add',
  view: '/view',
  analytics: '/analytics',
  login: '/login',
  register: '/register',
  profile: '/profile',
  settings: '/settings',
  notifications: '/notifications'
};

// Error Boundary for Header
class HeaderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (APP_CONFIG.enableAnalytics) {
      console.error('Header Error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <p className="text-red-600 font-medium">Header failed to load</p>
              <p className="text-red-500 text-sm mt-1">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Header({ 
  currentPage, 
  setCurrentPage, 
  notificationsCount = 0, 
  isAuthenticated = false, 
  user = null, 
  onLogout = () => {},
  onSearch = () => {}
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      // Close dropdown on Escape
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setShowSearch(false);
      }
      // Focus search on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        // Focus search input
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"]');
          searchInput?.focus();
        }, 100);
      }
      // Navigation shortcuts (Alt+Number)
      if (e.altKey && !isNaN(e.key) && e.key >= 1 && e.key <= 4) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const pages = ['dashboard', 'add', 'view', 'analytics'];
        if (pages[index]) {
          handleNavigation(pages[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search using custom debounce function
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

  // Navigation with URL update
  const handleNavigation = useCallback((page) => {
    setIsLoading(true);
    
    try {
      // Update parent component state
      setCurrentPage(page);
      setShowDropdown(false);
      setShowSearch(false);
      
      // Get the URL for the page
      const pageUrl = PAGE_ROUTES[page] || `/${page}`;
      
      // Update browser URL without reloading
      window.history.pushState({ page }, '', pageUrl);
      
      // Dispatch custom event for SPA routing
      window.dispatchEvent(new CustomEvent('routeChange', { 
        detail: { 
          page,
          url: pageUrl,
          timestamp: Date.now()
        }
      }));
      
      // Log for analytics in production
      if (APP_CONFIG.enableAnalytics) {
        console.log(`Navigating to: ${page} (${pageUrl})`);
      }
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [setCurrentPage]);

  // Handle back/forward browser buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentPage]);

  const handleSearch = (e) => setSearchQuery(e.target.value);
  
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearch(false);
    if (onSearch) onSearch('');
  }, [onSearch]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    console.log('🚪 Logout button clicked');
    setIsLoggingOut(true);
    
    try {
      // Clear all client-side storage first
      console.log('🗑️ Clearing local storage...');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("birthdays");
      localStorage.removeItem("appSettings");
      
      // Clear session storage
      sessionStorage.clear();
      
      // Close dropdown
      setShowDropdown(false);
      
      // Call the parent logout handler if provided
      if (onLogout && typeof onLogout === 'function') {
        console.log('📞 Calling parent onLogout handler...');
        try {
          await onLogout();
          console.log('✅ Parent onLogout completed');
        } catch (error) {
          console.error('❌ Error in parent logout handler:', error);
        }
      } else {
        console.warn('⚠️ onLogout prop not provided or not a function');
      }
      
      // Clear any pending search
      clearSearch();
      
      // Force hard redirect to login page
      console.log('🚀 Redirecting to login page...');
      setTimeout(() => {
        window.location.href = '/login';
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('💥 Critical logout error:', error);
      
      // Emergency cleanup and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
      window.location.reload();
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDropdownToggle = () => setShowDropdown(prev => !prev);

  const navigationItems = [
    { 
      page: 'home', 
      label: 'Dashboard', 
      icon: <MdDashboard />, 
      accent: 'from-blue-500 to-cyan-500',
      shortcut: 'Alt+1'
    },
    { 
      page: 'add', 
      label: 'Add Birthday', 
      icon: <FaUserPlus />, 
      accent: 'from-emerald-500 to-teal-500',
      shortcut: 'Alt+2'
    },
    { 
      page: 'view', 
      label: 'Birthdays', 
      icon: <MdCelebration />, 
      accent: 'from-purple-500 to-pink-500',
      shortcut: 'Alt+3'
    },
    { 
      page: 'analytics', 
      label: 'Analytics', 
      icon: <HiChartBar />, 
      accent: 'from-amber-500 to-orange-500',
      shortcut: 'Alt+4'
    }
  ];

  const UserAvatar = React.memo(({ user, size = 'md' }) => (
    <div 
      className={`relative ${size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} ${size === 'xl' ? 'w-12 h-12' : ''} rounded-xl overflow-hidden border border-white/20 shadow`}
      role="img"
      aria-label={`Avatar of ${user?.username || 'User'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold select-none">
        {user?.username?.charAt(0).toUpperCase() || 'U'}
      </div>
    </div>
  ));

  UserAvatar.displayName = 'UserAvatar';

  // Loading overlay
  if (isLoading) {
    return (
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-600 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Header */}
      <header 
        ref={headerRef}
        className={`hidden md:block sticky top-0 z-50 transition-all duration-200 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
            : 'bg-white/90 backdrop-blur-sm border-b border-gray-100'
        }`}
        role="banner"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleNavigation('home')}
                className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg p-1"
                aria-label="Go to dashboard"
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
              </button>
            </div>

            {/* Navigation - Authenticated */}
            {isAuthenticated && (
              <nav className="flex items-center space-x-1" aria-label="Main navigation">
                {navigationItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNavigation(item.page)}
                    aria-current={currentPage === item.page ? 'page' : undefined}
                    aria-label={`Navigate to ${item.label}`}
                    title={`${item.label} (${item.shortcut})`}
                    className={`group relative px-3 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                      currentPage === item.page
                        ? 'text-white shadow'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {currentPage === item.page && (
                      <div 
                        className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.accent}`}
                        aria-hidden="true"
                      ></div>
                    )}
                    <div className="relative flex items-center space-x-2">
                      <span className={`text-base ${currentPage === item.page ? 'text-white' : `bg-gradient-to-r ${item.accent} bg-clip-text text-transparent`}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm tracking-wide">{item.label}</span>
                    </div>
                    <div 
                      className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 rounded-full ${
                        currentPage === item.page ? `bg-gradient-to-r ${item.accent}` : 'bg-transparent'
                      } transition-all duration-200`}
                      aria-hidden="true"
                    ></div>
                    <span className="sr-only">Keyboard shortcut: {item.shortcut}</span>
                  </button>
                ))}
              </nav>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Time Display */}
              <div 
                className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
                  scrolled ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-white/50'
                }`}
                role="timer"
                aria-live="polite"
                aria-label={`Current time is ${memoizedFormatTime}, date is ${memoizedFormatDate}`}
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
                          aria-label="Search birthdays"
                          title="Search birthdays (Ctrl+K)"
                        />
                        <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" aria-hidden="true" />
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                            aria-label="Clear search"
                          >
                            <FaTimes className="text-sm" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSearch(true)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Open search"
                        title="Search (Ctrl+K)"
                      >
                        <FaSearch className="text-gray-500 text-sm" />
                      </button>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => handleNavigation('notifications')}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-200 hover:border-amber-200 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 relative"
                      aria-label={`Notifications ${notificationsCount > 0 ? `(${notificationsCount} unread)` : ''}`}
                    >
                      <MdNotifications className="text-gray-500 text-sm" />
                      {notificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center shadow">
                          {notificationsCount > 9 ? '9+' : notificationsCount}
                          <span className="sr-only">unread notifications</span>
                        </span>
                      )}
                    </button>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={handleDropdownToggle}
                      className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      aria-label="User menu"
                      aria-expanded={showDropdown}
                    >
                      <UserAvatar user={user} />
                      <div className="text-left hidden lg:block">
                        <div className="font-medium text-gray-900 text-sm">{user?.username || 'User'}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]">
                          {user?.email || ''}
                        </div>
                      </div>
                      <FaChevronDown className={`text-gray-400 transition-transform duration-200 text-xs ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                      <div 
                        className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fadeIn"
                        role="menu"
                        aria-orientation="vertical"
                      >
                        <div className="p-3 bg-gradient-to-r from-gray-50 to-white border-b">
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
                        
                        <div className="p-1" role="none">
                          {['profile', 'settings'].map((page) => (
                            <button 
                              key={page}
                              onClick={() => { handleNavigation(page); setShowDropdown(false); }}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm focus:outline-none focus:bg-gray-50"
                              role="menuitem"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                {page === 'profile' && <FaUserCircle className="text-purple-600 text-sm" />}
                                {page === 'settings' && <FaCog className="text-blue-600 text-sm" />}
                              </div>
                              <span className="font-medium capitalize">{page}</span>
                            </button>
                          ))}
                          
                          <div className="border-t border-gray-100 my-1" role="separator"></div>
                          
                          <button 
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm focus:outline-none focus:bg-red-50 ${
                              isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            role="menuitem"
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
                  <button
                    onClick={() => handleNavigation('login')}
                    className="px-3 py-1.5 rounded-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Sign in"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigation('register')}
                    className="px-4 py-1.5 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:shadow-md transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Get started"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50">
        <div className={`${scrolled ? 'bg-white shadow' : 'bg-white'} transition-all duration-200`}>
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
                    aria-label="Search"
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" aria-hidden="true" />
                  {searchQuery && (
                    <button 
                      onClick={clearSearch} 
                      className="absolute right-2 top-2.5 text-gray-400 focus:outline-none"
                      aria-label="Clear search"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="px-2 py-2 text-blue-600 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                  aria-label="Cancel search"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {/* Logo */}
                <button
                  onClick={() => handleNavigation('home')}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-label="Go to dashboard"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow">
                    <FaCalendarAlt className="text-white text-sm" />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900 text-sm">{APP_CONFIG.name}</h1>
                    <time className="text-xs text-gray-500">{memoizedFormatTime}</time>
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => setShowSearch(true)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        aria-label="Search"
                      >
                        <FaSearch className="text-gray-600 text-sm" />
                      </button>
                      <button 
                        onClick={() => handleNavigation('notifications')}
                        className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        aria-label={`Notifications ${notificationsCount > 0 ? `(${notificationsCount} unread)` : ''}`}
                      >
                        <MdNotifications className="text-gray-600 text-sm" />
                        {notificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                            {notificationsCount}
                            <span className="sr-only">unread notifications</span>
                          </span>
                        )}
                      </button>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={handleDropdownToggle}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-white shadow focus:outline-none focus:ring-1 focus:ring-purple-500"
                          aria-label="User menu"
                          aria-expanded={showDropdown}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleNavigation('login')}
                        className="px-2 py-1.5 text-gray-700 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 rounded"
                        aria-label="Login"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => handleNavigation('register')}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        aria-label="Sign up"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          {isAuthenticated && !showSearch && (
            <nav className="border-t border-gray-100" aria-label="Mobile navigation">
              <div className="flex justify-around items-center px-1 py-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNavigation(item.page)}
                    aria-current={currentPage === item.page ? 'page' : undefined}
                    aria-label={item.label}
                    className={`flex flex-col items-center justify-center p-1 transition-all duration-200 flex-1 mx-0.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                      currentPage === item.page
                        ? `text-white bg-gradient-to-r ${item.accent} shadow`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-medium mt-0.5">{item.label}</span>
                  </button>
                ))}
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
          role="presentation"
        >
          <div 
            className="w-4/5 max-w-sm bg-white h-full shadow-xl animate-slideIn overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="User menu"
          >
            <div className="p-4 bg-gradient-to-b from-gray-50 to-white border-b sticky top-0">
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
              {['profile', 'settings'].map((page) => (
                <button
                  key={page}
                  onClick={() => { handleNavigation(page); setShowDropdown(false); }}
                  className="w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-2 text-sm focus:outline-none focus:bg-gray-50"
                  role="menuitem"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    {page === 'profile' && <FaUserCircle className="text-purple-600 text-sm" />}
                    {page === 'settings' && <FaCog className="text-blue-600 text-sm" />}
                  </div>
                  <span className="font-medium capitalize">{page}</span>
                </button>
              ))}
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`w-full mt-2 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2 text-sm focus:outline-none focus:bg-red-50 ${
                  isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                role="menuitem"
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
      {isAuthenticated && !showSearch && <div className="md:hidden h-16" aria-hidden="false"></div>}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
        
        /* Focus styles for better accessibility */
        *:focus {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
        }
        
        *:focus:not(:focus-visible) {
          outline: none;
        }
        
        *:focus-visible {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}

// Wrap with Error Boundary
const HeaderWithErrorBoundary = React.memo((props) => (
  <HeaderErrorBoundary>
    <Header {...props} />
  </HeaderErrorBoundary>
));

HeaderWithErrorBoundary.displayName = 'Header';

export default HeaderWithErrorBoundary;