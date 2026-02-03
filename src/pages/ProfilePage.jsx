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
  FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProfilePage = ({ user, setUser, setCurrentPage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    bio: user?.bio || '',
    notificationSettings: user?.notificationSettings || {
      email: true,
      push: true,
      sms: false,
      reminderDays: [7, 3, 1],
      reminderTime: '09:00'
    },
    theme: user?.theme || 'light',
    language: user?.language || 'en'
  });

  // Stats data (you can fetch this from API)
  const [stats, setStats] = useState({
    totalBirthdays: 0,
    upcomingBirthdays: 0,
    notificationsSent: 0,
    streakDays: 0,
    level: 1,
    xp: 250,
    nextLevelXp: 500
  });

  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';
      
      const response = await fetch(`${API_BASE}/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';
      
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
        setUser(prev => ({ ...prev, profileImage: data.profileImage }));
        localStorage.setItem('user', JSON.stringify({ ...user, profileImage: data.profileImage }));
        toast.success('Profile image updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';
      
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
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';
      
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
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      // Implement delete account logic
      toast.warning('Account deletion feature coming soon!');
    }
  };

  const generateProfileShareLink = () => {
    const shareData = {
      name: user?.name,
      totalBirthdays: stats.totalBirthdays,
      streak: stats.streakDays
    };
    
    const encoded = btoa(JSON.stringify(shareData));
    const link = `${window.location.origin}/share/profile/${encoded}`;
    
    navigator.clipboard.writeText(link);
    toast.success('Profile share link copied to clipboard! 🔗');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUserCircle /> },
    { id: 'stats', label: 'Stats', icon: <FaChartLine /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-2xl shadow-xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-full h-full p-4 text-white/70" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <FaCamera className="text-purple-600" />
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
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{user?.name || 'User'}</h1>
              <p className="text-purple-100">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Level {stats.level}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{stats.streakDays} day streak 🔥</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
            >
              <FaUserEdit className="mr-2" /> Edit Profile
            </button>
            <button 
              onClick={generateProfileShareLink}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center"
            >
              <FaShareAlt className="mr-2" /> Share
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Level {stats.level}</span>
            <span>{stats.xp}/{stats.nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
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
      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                    maxLength="200"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.bio.length}/200 characters
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center"
                  >
                    <FaSave className="mr-2" /> Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <FaUserCircle className="mr-2 text-blue-500" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="text-lg font-semibold">{user?.name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-lg font-semibold flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          {user?.email || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <FaStar className="mr-2 text-yellow-500" />
                      Achievements
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">{stats.totalBirthdays}</div>
                        <div className="text-xs text-gray-600">Birthdays</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{stats.streakDays}</div>
                        <div className="text-xs text-gray-600">Day Streak</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <FaCrown className="mr-2 text-amber-500" />
                      Premium Status
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Free Plan</p>
                        <p className="text-sm text-gray-600">Upgrade for more features</p>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-orange-600">
                        Upgrade
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Birthdays</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalBirthdays}</p>
                  </div>
                  <FaBirthdayCake className="text-blue-500 text-2xl" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-green-600">{stats.upcomingBirthdays}</p>
                  </div>
                  <FaCalendarAlt className="text-green-500 text-2xl" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Notifications Sent</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.notificationsSent}</p>
                  </div>
                  <FaBell className="text-purple-500 text-2xl" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.streakDays} days</p>
                  </div>
                  <FaFire className="text-orange-500 text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Activity History</h3>
              <div className="space-y-3">
                {/* Add activity timeline here */}
                <p className="text-gray-600 text-center py-4">No recent activity</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <FaBell className="mr-2 text-blue-500" />
                Notification Settings
              </h3>
              <div className="space-y-4">
                {Object.entries(formData.notificationSettings).map(([key, value]) => (
                  typeof value === 'boolean' && (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key} Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={value}
                          className="sr-only peer"
                          onChange={(e) => setFormData({
                            ...formData,
                            notificationSettings: {
                              ...formData.notificationSettings,
                              [key]: e.target.checked
                            }
                          })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <FaPalette className="mr-2 text-purple-500" />
                  Appearance
                </h3>
                <select 
                  value={formData.theme}
                  onChange={(e) => setFormData({...formData, theme: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <FaGlobe className="mr-2 text-green-500" />
                  Language
                </h3>
                <select 
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-red-500" />
                Account Security
              </h3>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50">
                  <div className="flex items-center">
                    <FaLock className="mr-3 text-gray-400" />
                    <div>
                      <p className="font-semibold">Change Password</p>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </button>
                
                <button 
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <FaDownload className="mr-3 text-gray-400" />
                    <div>
                      <p className="font-semibold">Export Data</p>
                      <p className="text-sm text-gray-600">Download all your data</p>
                    </div>
                  </div>
                  <FaChevronRight className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center text-red-600">
                <FaTrash className="mr-2" />
                Danger Zone
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600">Once you delete your account, there is no going back. Please be certain.</p>
                <button 
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;