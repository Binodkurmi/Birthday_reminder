import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import HomePage from './pages/HomePages';
import AddBirthdayPage from './pages/AddBirthdayPage';
import ViewBirthdaysPage from './pages/ViewBirthdaysPage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
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
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

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

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  const fetchBirthdays = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/birthdays`, {
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
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/notifications`, {
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
  }, []);

  const handleRegister = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('home');
    toast.success('Account created successfully!');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('birthdays');
    
    setIsAuthenticated(false);
    setUser(null);
    setBirthdays([]);
    setNotifications([]);
    setCurrentPage('login');
    
  }, []);

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
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE}/api/birthdays/${birthdayId}`, {
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

  const renderPage = () => {
    if (checkingAuth) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
    <div className={`min-h-screen transition-colors duration-200 ${
      appSettings.theme === 'dark' ? 'dark bg-gray-900 text-white' : 
      appSettings.theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-purple-50' :
      'bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-gray-900 dark:text-white'
    }`}>
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        notificationsCount={notifications.filter(n => !n.isRead).length} 
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
      
      {/* Status indicators */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm">
          ⚠️ You are currently offline
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