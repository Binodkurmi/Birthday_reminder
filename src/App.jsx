import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion'; // Optional: install with `npm install framer-motion`

// Import page components
import HomePage from './pages/HomePages';
import AddBirthdayPage from './pages/AddBirthdayPage';
import ViewBirthdaysPage from './pages/ViewBirthdaysPage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotFoundPage from './pages/NotFoundPage'; // Create this
import ProtectedRoute from './components/ProtectedRoute'; // Create this
import Layout from './components/Layout'; // Create this

// Import components
import Header from './components/Header';

import './App.css';

// Page transition wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

function AppContent() {
  const [birthdays, setBirthdays] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBirthday, setSelectedBirthday] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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
    navigate('/home');
    toast.success('Logged in successfully!');
  }, [navigate]);

  const handleRegister = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    navigate('/home');
    toast.success('Account created successfully!');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('🔴 Logout function called');
      
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';

      // Try to call backend logout endpoint if token exists
      if (token) {
        try {
          const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📊 Logout API response status:', response.status);
        } catch (apiError) {
          console.log('🌐 Logout API call failed (might be offline):', apiError);
        }
      }
    } catch (error) {
      console.error('❌ Error in logout function:', error);
    } finally {
      // Clear client-side storage
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

      // Navigate to login page
      navigate('/login');
      
      // Show logout success message
      toast.info('Logged out successfully');
      
      console.log('✅ Logout completed - state reset');
    }
  }, [navigate]);

  const handleSearch = useCallback((query) => {
    console.log('Searching for:', query);
    if (query.trim() && isAuthenticated) {
      navigate('/birthdays');
    }
  }, [isAuthenticated, navigate]);

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
    navigate('/add-birthday', { state: { editing: true, birthday } });
  }, [navigate]);

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

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-4 text-lg">Checking authentication...</span>
      </div>
    );
  }

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
          <div>Current Page: {location.pathname}</div>
          <div>User: {user?.username || 'None'}</div>
        </div>
      )}

      <Header
        currentPage={location.pathname}
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
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/login" element={
              <PageWrapper>
                {isAuthenticated ? (
                  <Navigate to="/home" replace />
                ) : (
                  <LoginPage onLogin={handleLogin} />
                )}
              </PageWrapper>
            } />
            
            <Route path="/register" element={
              <PageWrapper>
                {isAuthenticated ? (
                  <Navigate to="/home" replace />
                ) : (
                  <RegisterPage onRegister={handleRegister} />
                )}
              </PageWrapper>
            } />

            {/* Protected routes */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
            } />
            
            <Route path="/home" element={
              isAuthenticated ? (
                <PageWrapper>
                  <HomePage
                    birthdays={birthdays}
                    notifications={notifications}
                    isLoading={isLoading}
                    onRefresh={handleRefresh}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            <Route path="/birthdays" element={
              isAuthenticated ? (
                <PageWrapper>
                  <ViewBirthdaysPage
                    birthdays={birthdays}
                    onBirthdayDeleted={fetchBirthdays}
                    onBirthdayEdit={handleEdit}
                    isLoading={isLoading}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            <Route path="/add-birthday" element={
              isAuthenticated ? (
                <PageWrapper>
                  <AddBirthdayPage
                    onBirthdayAdded={fetchBirthdays}
                    birthdayToEdit={selectedBirthday}
                    onEditComplete={() => {
                      setSelectedBirthday(null);
                      fetchBirthdays();
                    }}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            <Route path="/notifications" element={
              isAuthenticated ? (
                <PageWrapper>
                  <NotificationsPage
                    notifications={notifications}
                    setNotifications={setNotifications}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            <Route path="/settings" element={
              isAuthenticated ? (
                <PageWrapper>
                  <SettingsPage
                    settings={appSettings}
                    onSettingsUpdate={handleSettingsUpdate}
                    onRefresh={handleRefresh}
                    syncStatus={syncStatus}
                    isOnline={isOnline}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            <Route path="/profile" element={
              isAuthenticated ? (
                <PageWrapper>
                  <ProfilePage
                    user={user}
                    setUser={setUser}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            <Route path="/analytics" element={
              isAuthenticated ? (
                <PageWrapper>
                  <AnalyticsPage
                    birthdays={birthdays}
                    isLoading={isLoading}
                  />
                </PageWrapper>
              ) : (
                <Navigate to="/login" replace />
              )
            } />

            {/* 404 route */}
            <Route path="*" element={
              <PageWrapper>
                <NotFoundPage />
              </PageWrapper>
            } />
          </Routes>
        </AnimatePresence>
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

// Main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;