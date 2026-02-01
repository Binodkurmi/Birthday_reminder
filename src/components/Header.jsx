import React, { useState, useEffect, useRef } from 'react';
import { 
  FaCalendarAlt, 
  FaUserPlus, 
  FaSearch, 
  FaBell, 
  FaCog, 
  FaSignOutAlt, 
  FaChevronDown,
  FaTimes,
  FaUserCircle
} from "react-icons/fa";
import { MdDashboard, MdCelebration, MdNotifications } from "react-icons/md";
import { HiChartBar } from "react-icons/hi";

function Header({ 
  currentPage, 
  setCurrentPage, 
  notificationsCount, 
  isAuthenticated, 
  user, 
  onLogout,
  onSearch 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const headerRef = useRef(null);

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

  // Handle search input changes
  useEffect(() => {
    if (onSearch) onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setShowDropdown(false);
    setShowSearch(false);
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const clearSearch = () => {
    setSearchQuery('');
    setShowSearch(false);
    onSearch?.('');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      onLogout();
      setShowDropdown(false);
    }
  };

  const handleDropdownToggle = () => setShowDropdown(prev => !prev);

  const navigationItems = [
    { page: 'dashboard', label: 'Dashboard', icon: <MdDashboard />, accent: 'from-blue-500 to-cyan-500' },
    { page: 'add', label: 'Add', icon: <FaUserPlus />, accent: 'from-emerald-500 to-teal-500' },
    { page: 'view', label: 'Birthdays', icon: <MdCelebration />, accent: 'from-purple-500 to-pink-500' },
    { page: 'analytics', label: 'Analytics', icon: <HiChartBar />, accent: 'from-amber-500 to-orange-500' }
  ];

  const UserAvatar = ({ user, size = 'md' }) => (
    <div className={`relative ${size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} rounded-xl overflow-hidden border border-white/20 shadow`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
      <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
        {user?.username?.charAt(0).toUpperCase() || 'U'}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Header - Reduced Height */}
      <header 
        ref={headerRef}
        className={`hidden md:block sticky top-0 z-50 transition-all duration-200 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
            : 'bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 shadow flex items-center justify-center">
                  <FaCalendarAlt className="text-white text-sm" />
                </div>
              </div>
              
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ChronoBirthday
                </h1>
              </div>
            </div>

            {/* Navigation - Authenticated */}
            {isAuthenticated && (
              <nav className="flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNavigation(item.page)}
                    className={`group relative px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === item.page
                        ? 'text-white shadow'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {currentPage === item.page && (
                      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.accent}`}></div>
                    )}
                    <div className="relative flex items-center space-x-2">
                      <span className={`text-base ${currentPage === item.page ? 'text-white' : `bg-gradient-to-r ${item.accent} bg-clip-text text-transparent`}`}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm tracking-wide">{item.label}</span>
                    </div>
                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-0.5 rounded-full ${
                      currentPage === item.page ? `bg-gradient-to-r ${item.accent}` : 'bg-transparent'
                    } transition-all duration-200`}></div>
                  </button>
                ))}
              </nav>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Time Display */}
              <div className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
                scrolled ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-white/50'
              }`}>
                <div className="text-sm font-medium text-gray-900">{formatTime()}</div>
                <div className="text-xs text-gray-500">•</div>
                <div className="text-xs text-gray-500">{formatDate()}</div>
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
                            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            <FaTimes className="text-sm" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSearch(true)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                      >
                        <FaSearch className="text-gray-500 text-sm" />
                      </button>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => handleNavigation('notifications')}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-200 hover:border-amber-200 hover:shadow-sm transition-all duration-200 relative"
                    >
                      <MdNotifications className="text-gray-500 text-sm" />
                      {notificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center shadow">
                          {notificationsCount > 9 ? '9+' : notificationsCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={handleDropdownToggle}
                      className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <UserAvatar user={user} />
                      <div className="text-left hidden lg:block">
                        <div className="font-medium text-gray-900 text-sm">{user?.username || 'User'}</div>
                      </div>
                      <FaChevronDown className={`text-gray-400 transition-transform duration-200 text-xs ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                        <div className="p-3 bg-gradient-to-r from-gray-50 to-white border-b">
                          <div className="flex items-center space-x-3">
                            <UserAvatar user={user} size="lg" />
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{user?.username}</div>
                              <div className="text-xs text-gray-600">{user?.email}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-1">
                          {['profile', 'settings'].map((page, idx) => (
                            <button 
                              key={page}
                              onClick={() => { handleNavigation(page); setShowDropdown(false); }}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                {page === 'profile' && <FaUserCircle className="text-purple-600 text-sm" />}
                                {page === 'settings' && <FaCog className="text-blue-600 text-sm" />}
                              </div>
                              <span className="font-medium capitalize">{page}</span>
                            </button>
                          ))}
                          
                          <div className="border-t border-gray-100 my-1"></div>
                          
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                              <FaSignOutAlt className="text-red-500 text-sm" />
                            </div>
                            <span className="font-medium">Sign Out</span>
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
                    className="px-3 py-1.5 rounded-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigation('register')}
                    className="px-4 py-1.5 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:shadow-md transition-all duration-200 text-sm"
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
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                  {searchQuery && (
                    <button onClick={clearSearch} className="absolute right-2 top-2.5 text-gray-400">
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="px-2 py-2 text-blue-600 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow">
                    <FaCalendarAlt className="text-white text-sm" />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900 text-sm">ChronoBirthday</h1>
                    <p className="text-xs text-gray-500">{formatTime()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => setShowSearch(true)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100"
                      >
                        <FaSearch className="text-gray-600 text-sm" />
                      </button>
                      <button 
                        onClick={() => handleNavigation('notifications')}
                        className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100"
                      >
                        <MdNotifications className="text-gray-600 text-sm" />
                        {notificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                            {notificationsCount}
                          </span>
                        )}
                      </button>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={handleDropdownToggle}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-white shadow"
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
                        className="px-2 py-1.5 text-gray-700 font-medium text-sm"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => handleNavigation('register')}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow text-sm"
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
            <nav className="border-t border-gray-100">
              <div className="flex justify-around items-center px-1 py-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNavigation(item.page)}
                    className={`flex flex-col items-center justify-center p-1 transition-all duration-200 flex-1 mx-0.5 rounded-lg ${
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
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-xl animate-slideIn">
            <div className="p-4 bg-gradient-to-b from-gray-50 to-white border-b">
              <div className="flex items-center space-x-3">
                <UserAvatar user={user} size="lg" />
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{user?.username}</h3>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              {['profile', 'settings'].map((page, idx) => (
                <button
                  key={page}
                  onClick={() => { handleNavigation(page); setShowDropdown(false); }}
                  className="w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-2 text-sm"
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
                className="w-full mt-2 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2 text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <FaSignOutAlt className="text-red-500 text-sm" />
                </div>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Spacer */}
      {isAuthenticated && !showSearch && <div className="md:hidden h-16"></div>}

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
      `}</style>
    </>
  );
}

export default Header;