// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaUserEdit, 
  FaCamera, 
  FaSave, 
  FaTimes, 
  FaUserCircle,
  FaBirthdayCake,
  FaEnvelope,
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaShieldAlt,
  FaTrash,
  FaDownload,
  FaLock,
  FaHistory,
  FaStar,
  FaCrown,
  FaShareAlt,
  FaQrcode,
  FaPalette,
  FaCog,
  FaGlobe,
  FaFire,
  FaChevronRight,
  FaArrowLeft,
  FaKey,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProfilePage = ({ user, setUser, setCurrentPage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    birthday: user?.birthday || '',
    notificationSettings: user?.notificationSettings || {
      email: true,
      push: true,
      sms: false,
      birthdayReminders: true,
      weeklyDigest: false,
      reminderDays: [7, 3, 1],
      reminderTime: '09:00'
    },
    theme: user?.theme || 'light',
    language: user?.language || 'en',
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    totalBirthdays: 0,
    upcomingBirthdays: 0,
    notificationsSent: 0,
    streakDays: 0,
    level: 1,
    xp: 250,
    nextLevelXp: 500,
    totalReminders: 0,
    completedReminders: 0,
    averageResponseTime: '0s',
    favoriteMonth: 'January'
  });

  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [activityHistory, setActivityHistory] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';

  useEffect(() => {
    fetchUserStats();
    fetchActivityHistory();
  }, []);

  const fetchUserStats = async () => {
    setIsLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Mock data for development
        setStats({
          totalBirthdays: 24,
          upcomingBirthdays: 5,
          notificationsSent: 156,
          streakDays: 12,
          level: 3,
          xp: 750,
          nextLevelXp: 1000,
          totalReminders: 48,
          completedReminders: 42,
          averageResponseTime: '2.5h',
          favoriteMonth: 'December'
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set mock data on error
      setStats({
        totalBirthdays: 24,
        upcomingBirthdays: 5,
        notificationsSent: 156,
        streakDays: 12,
        level: 3,
        xp: 750,
        nextLevelXp: 1000,
        totalReminders: 48,
        completedReminders: 42,
        averageResponseTime: '2.5h',
        favoriteMonth: 'December'
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchActivityHistory = async () => {
    setIsLoadingActivity(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/users/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivityHistory(data);
      } else {
        // Mock activity data
        setActivityHistory([
          { id: 1, action: 'Added birthday', target: 'John Doe', date: '2024-01-15T10:30:00', type: 'add' },
          { id: 2, action: 'Sent notification', target: 'Sarah Smith', date: '2024-01-14T09:15:00', type: 'notification' },
          { id: 3, action: 'Updated profile', target: 'Profile', date: '2024-01-13T14:20:00', type: 'update' },
          { id: 4, action: 'Exported data', target: 'All data', date: '2024-01-12T11:45:00', type: 'export' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      // Set mock data on error
      setActivityHistory([
        { id: 1, action: 'Added birthday', target: 'John Doe', date: '2024-01-15T10:30:00', type: 'add' },
        { id: 2, action: 'Sent notification', target: 'Sarah Smith', date: '2024-01-14T09:15:00', type: 'notification' }
      ]);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch(`${API_BASE}/users/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.profileImage);
        const updatedUser = { ...user, profileImage: data.profileImage };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile image updated successfully! 🎉');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        toast.success('Profile updated successfully! 🎉');
        
        // Refresh activity history
        fetchActivityHistory();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        toast.success('Password changed successfully! 🔒');
        setIsChangePasswordOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/users/export-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `birthday-reminder-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Data exported successfully! 📥');
        
        // Log activity
        fetchActivityHistory();
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('⚠️ Are you absolutely sure you want to delete your account?\n\nThis action cannot be undone and all your data will be permanently lost.')) {
      const confirmText = window.prompt('Type "DELETE" to confirm account deletion:');
      
      if (confirmText === 'DELETE') {
        try {
          const token = localStorage.getItem('token');
          
          const response = await fetch(`${API_BASE}/auth/delete-account`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            localStorage.clear();
            toast.info('Your account has been deleted. We\'re sorry to see you go!');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            throw new Error('Deletion failed');
          }
        } catch (error) {
          console.error('Error deleting account:', error);
          toast.error('Failed to delete account. Please try again.');
        }
      } else {
        toast.info('Account deletion cancelled');
      }
    }
  };

  const generateProfileShareLink = async () => {
    try {
      const shareData = {
        name: user?.name,
        totalBirthdays: stats.totalBirthdays,
        streak: stats.streakDays,
        level: stats.level
      };
      
      const encoded = btoa(JSON.stringify(shareData));
      const link = `${window.location.origin}/share/profile/${encoded}`;
      
      await navigator.clipboard.writeText(link);
      toast.success('Profile share link copied to clipboard! 🔗');
    } catch (error) {
      console.error('Error sharing profile:', error);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  const handleNotificationChange = (key, value) => {
    setFormData({
      ...formData,
      notificationSettings: {
        ...formData.notificationSettings,
        [key]: value
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'add': return <FaBirthdayCake className="text-green-500" />;
      case 'notification': return <FaBell className="text-blue-500" />;
      case 'update': return <FaUserEdit className="text-purple-500" />;
      case 'export': return <FaDownload className="text-orange-500" />;
      default: return <FaHistory className="text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUserCircle /> },
    { id: 'stats', label: 'Stats', icon: <FaChartLine /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Back Button */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center sticky top-0 z-30">
        <button 
          onClick={() => setCurrentPage && setCurrentPage('dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          aria-label="Go back to dashboard"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Profile</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/30 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={`${user?.name || 'User'}'s profile`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        setProfileImage('');
                      }}
                    />
                  ) : (
                    <FaUserCircle className="w-full h-full p-4 text-white/70" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 sm:p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <FaCamera className="text-purple-600 text-xs sm:text-sm" />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
                  {user?.name || 'User'}
                </h1>
                <p className="text-purple-100 text-sm sm:text-base break-all">
                  {user?.email}
                </p>
                {user?.phone && (
                  <p className="text-purple-100 text-xs sm:text-sm mt-1">
                    {user.phone}
                  </p>
                )}
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                  <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs sm:text-sm">
                    Level {stats.level}
                  </span>
                  <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs sm:text-sm flex items-center">
                    <FaFire className="mr-1 text-xs" /> {stats.streakDays} day streak
                  </span>
                  {user?.premium && (
                    <span className="bg-yellow-400/30 px-2.5 py-1 rounded-full text-xs sm:text-sm flex items-center">
                      <FaCrown className="mr-1 text-xs" /> Premium
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center text-sm sm:text-base"
                  disabled={isLoading}
                >
                  <FaUserEdit className="mr-2" /> Edit
                </button>
                <button 
                  onClick={generateProfileShareLink}
                  className="w-full sm:w-auto bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center justify-center text-sm sm:text-base"
                  disabled={isLoading}
                >
                  <FaShareAlt className="mr-2" /> Share
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span>Level {stats.level}</span>
                <span>{stats.xp}/{stats.nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 sm:h-2.5">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 sm:h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.xp / stats.nextLevelXp) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Dropdown */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between"
            aria-expanded={isMobileMenuOpen}
            aria-label="Select tab"
          >
            <span className="flex items-center font-medium">
              {tabs.find(tab => tab.id === activeTab)?.icon}
              <span className="ml-2">{tabs.find(tab => tab.id === activeTab)?.label}</span>
            </span>
            <FaChevronRight className={`text-gray-400 transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`} />
          </button>
          
          {isMobileMenuOpen && (
            <div className="absolute z-20 mt-1 w-[calc(100%-2rem)] bg-white rounded-xl shadow-lg border py-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm ${
                    activeTab === tab.id
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm mb-6">
          <div className="flex overflow-x-auto border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-500'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="City, Country"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Birthday</label>
                      <input
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Tell us about yourself..."
                      maxLength="200"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {formData.bio.length}/200 characters
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" /> Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                      <FaTimes className="mr-2" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-5 rounded-xl border border-blue-100">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center text-sm sm:text-base">
                        <FaUserCircle className="mr-2 text-blue-500" />
                        Personal Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Full Name</p>
                          <p className="text-base sm:text-lg font-semibold break-words">
                            {user?.name || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Email</p>
                          <p className="text-base sm:text-lg font-semibold flex items-center break-all">
                            <FaEnvelope className="mr-2 text-gray-400 flex-shrink-0" />
                            <span className="break-all">{user?.email || 'Not set'}</span>
                          </p>
                        </div>
                        {user?.phone && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                            <p className="text-base sm:text-lg font-semibold">{user.phone}</p>
                          </div>
                        )}
                        {user?.location && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Location</p>
                            <p className="text-base sm:text-lg font-semibold">{user.location}</p>
                          </div>
                        )}
                        {user?.birthday && (
                          <div>
                            <p className="text-xs sm:text-sm text-gray-500">Birthday</p>
                            <p className="text-base sm:text-lg font-semibold">
                              {new Date(user.birthday).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {user?.bio && (
                      <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-5 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center text-sm sm:text-base">
                          About Me
                        </h3>
                        <p className="text-gray-700 text-sm sm:text-base">{user.bio}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-5 rounded-xl border border-green-100">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center text-sm sm:text-base">
                        <FaStar className="mr-2 text-yellow-500" />
                        Achievements
                      </h3>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">
                            {stats.totalBirthdays}
                          </div>
                          <div className="text-xs text-gray-600">Birthdays Added</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {stats.streakDays}
                          </div>
                          <div className="text-xs text-gray-600">Day Streak</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-xl sm:text-2xl font-bold text-green-600">
                            {stats.notificationsSent}
                          </div>
                          <div className="text-xs text-gray-600">Notifications</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                          <div className="text-xl sm:text-2xl font-bold text-orange-600">
                            {stats.level}
                          </div>
                          <div className="text-xs text-gray-600">Current Level</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-5 rounded-xl border border-amber-100">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center text-sm sm:text-base">
                        <FaCrown className="mr-2 text-amber-500" />
                        Premium Status
                      </h3>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-center sm:text-left">
                          <p className="font-semibold">{user?.premium ? 'Premium Plan' : 'Free Plan'}</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {user?.premium 
                              ? 'Thanks for being a premium member!' 
                              : 'Upgrade for unlimited birthdays and advanced features'}
                          </p>
                        </div>
                        {!user?.premium && (
                          <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors">
                            Upgrade Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {isLoadingStats ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600">Total Birthdays</p>
                          <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalBirthdays}</p>
                        </div>
                        <FaBirthdayCake className="text-blue-500 text-xl sm:text-2xl" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600">Upcoming</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.upcomingBirthdays}</p>
                        </div>
                        <FaCalendarAlt className="text-green-500 text-xl sm:text-2xl" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600">Notifications</p>
                          <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.notificationsSent}</p>
                        </div>
                        <FaBell className="text-purple-500 text-xl sm:text-2xl" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600">Active Streak</p>
                          <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.streakDays}d</p>
                        </div>
                        <FaFire className="text-orange-500 text-xl sm:text-2xl" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 rounded-xl border border-indigo-100">
                      <h3 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">Reminder Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Total Reminders Set</span>
                          <span className="font-semibold text-indigo-600">{stats.totalReminders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Completed Reminders</span>
                          <span className="font-semibold text-green-600">{stats.completedReminders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Success Rate</span>
                          <span className="font-semibold text-purple-600">
                            {stats.totalReminders > 0 
                              ? Math.round((stats.completedReminders / stats.totalReminders) * 100) 
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 sm:p-6 rounded-xl border border-pink-100">
                      <h3 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">Performance</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Average Response Time</span>
                          <span className="font-semibold text-pink-600">{stats.averageResponseTime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Favorite Month</span>
                          <span className="font-semibold text-rose-600">{stats.favoriteMonth}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">This Week's Activity</span>
                          <span className="font-semibold text-blue-600">+{Math.floor(Math.random() * 10) + 5}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center">
                        <FaHistory className="mr-2 text-gray-500" />
                        Activity History
                      </h3>
                      <button 
                        onClick={fetchActivityHistory}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        Refresh
                      </button>
                    </div>
                    
                    {isLoadingActivity ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      </div>
                    ) : activityHistory.length > 0 ? (
                      <div className="space-y-3">
                        {activityHistory.map(activity => (
                          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                            <div className="mt-0.5">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.action}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity.target} • {formatDate(activity.date)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4 text-sm">No recent activity</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center text-sm sm:text-base">
                  <FaBell className="mr-2 text-blue-500" />
                  Notification Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm sm:text-base font-medium">Email Notifications</span>
                      <p className="text-xs text-gray-500">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notificationSettings.email}
                        className="sr-only peer"
                        onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm sm:text-base font-medium">Push Notifications</span>
                      <p className="text-xs text-gray-500">Get instant updates in browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notificationSettings.push}
                        className="sr-only peer"
                        onChange={(e) => handleNotificationChange('push', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm sm:text-base font-medium">SMS Notifications</span>
                      <p className="text-xs text-gray-500">Get reminders via text message</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notificationSettings.sms}
                        className="sr-only peer"
                        onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm sm:text-base font-medium">Birthday Reminders</span>
                      <p className="text-xs text-gray-500">Get notified about upcoming birthdays</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notificationSettings.birthdayReminders}
                        className="sr-only peer"
                        onChange={(e) => handleNotificationChange('birthdayReminders', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm sm:text-base font-medium">Weekly Digest</span>
                      <p className="text-xs text-gray-500">Weekly summary of your activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notificationSettings.weeklyDigest}
                        className="sr-only peer"
                        onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Time
                    </label>
                    <input
                      type="time"
                      value={formData.notificationSettings.reminderTime}
                      onChange={(e) => handleNotificationChange('reminderTime', e.target.value)}
                      className="w-full sm:w-auto p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-sm sm:text-base">
                    <FaPalette className="mr-2 text-purple-500" />
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Theme</label>
                      <select 
                        value={formData.theme}
                        onChange={(e) => setFormData({...formData, theme: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="light">☀️ Light Mode</option>
                        <option value="dark">🌙 Dark Mode</option>
                        <option value="auto">🔄 Auto (System)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-sm sm:text-base">
                    <FaGlobe className="mr-2 text-green-500" />
                    Localization
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Language</label>
                      <select 
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="en">🇺🇸 English</option>
                        <option value="es">🇪🇸 Español</option>
                        <option value="fr">🇫🇷 Français</option>
                        <option value="de">🇩🇪 Deutsch</option>
                        <option value="it">🇮🇹 Italiano</option>
                        <option value="pt">🇵🇹 Português</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Timezone</label>
                      <select 
                        value={formData.timezone}
                        onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500"
                      >
                        <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                          {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password Modal */}
              {isChangePasswordOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                      <button
                        onClick={() => setIsChangePasswordOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                          minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Changing...' : 'Change Password'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsChangePasswordOpen(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-red-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center text-sm sm:text-base">
                  <FaShieldAlt className="mr-2 text-red-500" />
                  Account Security
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <FaLock className="mr-3 text-gray-400 flex-shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">Change Password</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Update your account password</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 flex-shrink-0 ml-2" />
                  </button>
                  
                  <button 
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <FaDownload className="mr-3 text-gray-400 flex-shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">Export Data</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Download all your data</p>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400 flex-shrink-0 ml-2" />
                  </button>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center">
                      <FaCheckCircle className="mr-3 text-green-500" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base">Two-Factor Authentication</p>
                        <p className="text-xs sm:text-sm text-gray-600">Enhance your account security</p>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">Coming Soon</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center text-red-600 text-sm sm:text-base">
                  <FaExclamationTriangle className="mr-2" />
                  Danger Zone
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Once you delete your account, there is no going back. All your data, including birthdays, reminders, and settings will be permanently deleted.
                  </p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm sm:text-base"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;