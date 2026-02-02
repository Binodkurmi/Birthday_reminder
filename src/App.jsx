import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AddBirthdayPage from './pages/AddBirthdayPage';
import ViewBirthdaysPage from './pages/ViewBirthdaysPage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [birthdays, setBirthdays] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBirthday, setSelectedBirthday] = useState(null);

  // Initialize authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return !!token;
  });

  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const [appSettings, setAppSettings] = useState({
    theme: 'system',
    notifications: true,
    autoCheck: true,
    language: 'en',
    weekStartsOn: 0
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [checkingAuth, setCheckingAuth] = useState(!!localStorage.getItem('token'));

  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online!');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Some features may not work.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        setAppSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Listen for route changes from Header
    const handleRouteChange = (event) => {
      const { page } = event.detail;
      setCurrentPage(page);
    };

    window.addEventListener('routeChange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('routeChange', handleRouteChange);
    };
  }, []);

  // Check authentication on app load
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          setCheckingAuth(true);
          const isValid = await checkAuth();
          if (isValid) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
            setCurrentPage('home');
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          handleLogout();
        } finally {
          setCheckingAuth(false);
        }
      } else {
        setCheckingAuth(false);
        if (isAuthenticated) {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    checkAuthentication();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBirthdays();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  }, []);

  const fetchBirthdays = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';

      const response = await fetch(`${API_BASE}/birthdays`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBirthdays(data);
        localStorage.setItem('birthdays', JSON.stringify(data));
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      const cachedBirthdays = localStorage.getItem('birthdays');
      if (cachedBirthdays) {
        setBirthdays(JSON.parse(cachedBirthdays));
        toast.warning('Using cached data - check your connection');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';

      const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogin = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('home');
    toast.success('Logged in successfully!');
  }, []);

  const handleRegister = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('home');
    toast.success('Account created successfully!');
  }, []);

  // FIXED: Working logout function
  const handleLogout = useCallback(async () => {
    try {
      console.log('🔴 Logout function called in App.js');
      
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';

      console.log('🔑 Token exists:', !!token);
      console.log('🌐 API Base:', API_BASE);

      // Try to call backend logout endpoint if token exists
      if (token) {
        try {
          console.log('📡 Attempting to call logout API...');
          
          // Note: Changed from GET to POST as most APIs use POST for logout
          const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📊 Logout API response status:', response.status);
          
          if (response.ok) {
            console.log('✅ Backend logout successful');
          } else {
            console.log('⚠️ Backend logout failed with status:', response.status);
            // Don't throw error - continue with client-side logout
          }
        } catch (apiError) {
          console.log('🌐 Logout API call failed (might be offline):', apiError);
          // Continue with client-side logout even if server call fails
        }
      } else {
        console.log('🔓 No token found, skipping API call');
      }
    } catch (error) {
      console.error('❌ Error in logout function:', error);
    } finally {
      // ALWAYS clear client-side storage regardless of API success
      console.log('🗑️ Clearing client-side storage...');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('birthdays');
      localStorage.removeItem('appSettings');

      // Clear session storage
      sessionStorage.clear();

      // Reset React state
      setIsAuthenticated(false);
      setUser(null);
      setBirthdays([]);
      setNotifications([]);
      setCurrentPage('login');

      // Show logout success message
      toast.info('Logged out successfully');
      
      console.log('✅ Logout completed - state reset');
      
      // Force a page reload to ensure clean state
      setTimeout(() => {
        console.log('🔄 Reloading page...');
        window.location.reload();
      }, 300);
    }
  }, []);

  const handleSearch = useCallback((query) => {
    console.log('Searching for:', query);
    if (query.trim() && currentPage !== 'view') {
      setCurrentPage('view');
    }
  }, [currentPage]);

  const handleSettingsUpdate = useCallback((newSettings) => {
    setAppSettings(newSettings);
    toast.success('Settings updated successfully');
  }, []);

  const handleRefresh = useCallback(() => {
    if (isAuthenticated) {
      fetchBirthdays();
      fetchNotifications();
      toast.info('Data refreshed');
    }
  }, [isAuthenticated]);

  const handleEdit = useCallback((birthday) => {
    setSelectedBirthday(birthday);
    setCurrentPage('add');
  }, []);

  const handleDelete = useCallback(async (birthdayId) => {
    if (!window.confirm('Are you sure you want to delete this birthday?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';

      const response = await fetch(`${API_BASE}/birthdays/${birthdayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Birthday deleted successfully');
        fetchBirthdays();
      } else if (response.status === 401) {
        handleLogout();
      } else {
        throw new Error('Failed to delete birthday');
      }
    } catch (error) {
      console.error('Error deleting birthday:', error);
      toast.error(error.message || 'Failed to delete birthday');
    }
  }, [handleLogout]);

  // Handle page change with authentication check
  const handlePageChange = useCallback((page) => {
    const protectedPages = ['home', 'add', 'view', 'analytics', 'profile', 'settings', 'notifications'];
    
    if (protectedPages.includes(page) && !isAuthenticated) {
      toast.error('Please login to access this page');
      setCurrentPage('login');
      return;
    }
    
    setCurrentPage(page);
  }, [isAuthenticated]);

  const renderPage = () => {
    if (checkingAuth) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-4 text-lg">Checking authentication...</span>
        </div>
      );
    }

    if (!isAuthenticated) {
      switch (currentPage) {
        case 'register':
          return <RegisterPage setCurrentPage={setCurrentPage} onRegister={handleRegister} />;
        case 'login':
        default:
          return <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />;
      }
    }

    switch (currentPage) {
      case 'add':
        return (
          <AddBirthdayPage
            setCurrentPage={setCurrentPage}
            onBirthdayAdded={fetchBirthdays}
            birthdayToEdit={selectedBirthday}
            onEditComplete={() => {
              setSelectedBirthday(null);
              fetchBirthdays();
            }}
          />
        );
      case 'view':
        return (
          <ViewBirthdaysPage
            birthdays={birthdays}
            onBirthdayDeleted={fetchBirthdays}
            onBirthdayEdit={handleEdit}
            isLoading={isLoading}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={appSettings}
            onSettingsUpdate={handleSettingsUpdate}
            onRefresh={handleRefresh}
            syncStatus={syncStatus}
            isOnline={isOnline}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            user={user}
            setUser={setUser}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            birthdays={birthdays}
            isLoading={isLoading}
          />
        );
      case 'home':
      default:
        return (
          <HomePage
            birthdays={birthdays}
            notifications={notifications}
            isLoading={isLoading}
            setCurrentPage={setCurrentPage}
            onRefresh={handleRefresh}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${appSettings.theme === 'dark' ? 'dark bg-gray-900 text-white' :
        appSettings.theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-purple-50' :
          'bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-gray-900 dark:text-white'
      }`}>
      {/* Debug panel - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
          <div className="font-bold mb-1">Debug Panel:</div>
          <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
          <div>Token: {localStorage.getItem('token') ? '✅' : '❌'}</div>
          <div>Current Page: {currentPage}</div>
          <div>User: {user?.username || 'None'}</div>
          <button 
            onClick={() => {
              console.log('Manual logout test');
              handleLogout();
            }}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs w-full"
          >
            Test Logout
          </button>
        </div>
      )}

      <Header
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        notificationsCount={notifications.filter(n => !n.isRead).length}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />

      {/* Status indicators */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm">
          ⚠️ You are currently offline. Some features may not be available.
        </div>
      )}

      <main className="container mx-auto px-4 pt-0 pb-8">
        {renderPage()}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={appSettings.theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}

export default App;