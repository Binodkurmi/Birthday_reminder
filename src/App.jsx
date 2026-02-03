import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';

import './App.css';

// Simple Protected Route component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const [birthdays, setBirthdays] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBirthday, setSelectedBirthday] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    return !!(token && userData);
  });

  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const [appSettings, setAppSettings] = useState(() => {
    const settings = localStorage.getItem('appSettings');
    return settings ? JSON.parse(settings) : {
      theme: 'system',
      notifications: true,
      autoCheck: true,
      language: 'en',
      weekStartsOn: 0
    };
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Apply theme based on settings
  useEffect(() => {
    const root = document.documentElement;
    if (appSettings.theme === 'dark') {
      root.classList.add('dark');
    } else if (appSettings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [appSettings.theme]);

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

  // Check authentication on app load
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
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
        }
      } else {
        if (isAuthenticated) {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    checkAuthentication();
  }, []);

  // Sync auth state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (!isAuthenticated || user?.id !== parsedUser?.id) {
            console.log('🔄 Syncing auth state from localStorage');
            setIsAuthenticated(true);
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else if (isAuthenticated) {
        console.log('🔄 Clearing auth state (no token in localStorage)');
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, user]);

  // Check auth when route changes
  useEffect(() => {
    handleStorageCheck();
  }, [location.pathname]);

  const handleStorageCheck = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      if (!isAuthenticated) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
    } else if (isAuthenticated) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

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

  // Function to fetch user data
  const fetchUserData = async (token) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';
      
      // Fetch both birthdays and notifications in parallel
      const [birthdaysRes, notificationsRes] = await Promise.all([
        fetch(`${API_BASE}/birthdays`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (birthdaysRes.ok) {
        const birthdaysData = await birthdaysRes.json();
        setBirthdays(birthdaysData);
        localStorage.setItem('birthdays', JSON.stringify(birthdaysData));
        setIsLoading(false);
      }
      
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData);
      }
      
      console.log('✅ User data fetched successfully');
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.warning('Using cached data - check your connection');
      setIsLoading(false);
    }
  };

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
    console.log('🔑 handleLogin called with:', { 
      userName: userData?.name, 
      hasToken: !!token 
    });
    
    if (!userData || !token) {
      console.error('❌ Login failed: Missing user data or token');
      toast.error('Login incomplete. Please try again.');
      return;
    }
    
    // Clear old data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('birthdays');
    sessionStorage.clear();
    
    // Store new auth data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Force state update
    setUser(userData);
    setIsAuthenticated(true);
    
    // Fetch user data
    fetchUserData(token);
    
    // Navigate to home
    navigate('/home');
    
    toast.success(`👋 Welcome back, ${userData.name || 'User'}!`);
    
    console.log('✅ User logged in successfully');
  }, [navigate]);

  const handleRegister = useCallback((userData, token) => {
    console.log('🎉 handleRegister called with:', { 
      userName: userData?.name, 
      hasToken: !!token 
    });
    
    if (!userData || !token) {
      console.error('❌ Registration failed: Missing user data or token');
      toast.error('Registration incomplete. Please try logging in.');
      navigate('/login');
      return;
    }
    
    // Clear any existing data to start fresh
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('birthdays');
    sessionStorage.clear();
    
    // Store new auth data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Force React state update immediately
    setUser(userData);
    setIsAuthenticated(true);
    
    // Fetch user data with the new token
    fetchUserData(token);
    
    // Navigate to home
    navigate('/home');
    
    // Show welcome message
    toast.success(`🎂 Welcome to Birthday Reminder, ${userData.name || 'User'}!`);
    
    console.log('✅ User registered and logged in successfully');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('🔴 App: Logout function called');

      // Get token before clearing
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';

      // Try to call logout API if we have a token
      if (token) {
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (apiError) {
          console.log('🌐 Logout API call failed (may be offline):', apiError);
        }
      }
    } catch (error) {
      console.error('❌ Error in logout function:', error);
    } finally {
      // Clear client-side storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('birthdays');

      sessionStorage.clear();

      // Reset React state
      setIsAuthenticated(false);
      setUser(null);
      setBirthdays([]);
      setNotifications([]);

      // Navigate to login page
      navigate('/login', { replace: true });

      // Show logout success message
      toast.info('Logged out successfully');

      console.log('✅ App: Logout completed');
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
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
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

  // Check if current page is an auth page
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isPolicyPage = ['/privacy', '/terms'].includes(location.pathname);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${appSettings.theme === 'dark' ? 'dark bg-gray-900 text-white' :
        appSettings.theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-purple-50' :
          'bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-gray-900 dark:text-white'
      }`}>
      {/* Debug panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
          <div className="font-bold mb-1">Debug Panel:</div>
          <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
          <div>Current Page: {location.pathname}</div>
          <div>User: {user?.name || user?.username || 'None'}</div>
          <div>Token: {localStorage.getItem('token') ? '✅' : '❌'}</div>
        </div>
      )}

      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        onSearch={handleSearch}
        notificationsCount={notifications.filter(n => n && !n.isRead).length}
      />

      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm">
          ⚠️ You are currently offline. Some features may not be available.
        </div>
      )}

      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-4 pb-8">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            } />

            <Route path="/register" element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <RegisterPage onRegister={handleRegister} />
              )
            } />

            {/* Privacy and Terms pages (public) */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Navigate to="/home" replace />
              </ProtectedRoute>
            } />

            <Route path="/home" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <HomePage
                  birthdays={birthdays}
                  notifications={notifications}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </ProtectedRoute>
            } />

            <Route path="/birthdays" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ViewBirthdaysPage
                  birthdays={birthdays}
                  onBirthdayDeleted={fetchBirthdays}
                  onBirthdayEdit={handleEdit}
                  isLoading={isLoading}
                />
              </ProtectedRoute>
            } />

            <Route path="/add-birthday" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AddBirthdayPage
                  onBirthdayAdded={fetchBirthdays}
                  birthdayToEdit={selectedBirthday}
                  onEditComplete={() => {
                    setSelectedBirthday(null);
                    fetchBirthdays();
                  }}
                />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <NotificationsPage
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <SettingsPage
                  settings={appSettings}
                  onSettingsUpdate={handleSettingsUpdate}
                  onRefresh={handleRefresh}
                  isOnline={isOnline}
                />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProfilePage
                  user={user}
                  setUser={setUser}
                />
              </ProtectedRoute>
            } />

            <Route path="/analytics" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AnalyticsPage
                  birthdays={birthdays}
                  isLoading={isLoading}
                />
              </ProtectedRoute>
            } />

            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>

      {/* Show footer for authenticated users and policy pages, but not on auth pages */}
      {(isAuthenticated || isPolicyPage) && !isAuthPage && <Footer />}

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
        theme={appSettings.theme === 'dark' ? 'dark' : appSettings.theme === 'light' ? 'light' : 'colored'}
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