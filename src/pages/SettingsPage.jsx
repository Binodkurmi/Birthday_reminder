import React, { useState, useEffect } from 'react';
import { FaCog, FaBell, FaDatabase, FaUser, FaLightbulb } from "react-icons/fa";
import { toast } from 'react-toastify';

function SettingsPage({ settings, onSettingsUpdate, onRefresh, syncStatus, isOnline }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await onSettingsUpdate(localSettings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED
      
      const response = await fetch(`${API_BASE}/birthdays/export`, { // ✅ REMOVED duplicate /api
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExportData(JSON.stringify(data, null, 2));
        toast.success('Data exported successfully!');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImportData = async () => {
    if (!importData.trim()) {
      toast.error('Please paste export data first');
      return;
    }

    try {
      const parsedData = JSON.parse(importData);
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED
      
      const response = await fetch(`${API_BASE}/birthdays/import`, { // ✅ REMOVED duplicate /api
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedData)
      });

      if (response.ok) {
        toast.success('Data imported successfully!');
        setImportData('');
        if (onRefresh) onRefresh();
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Invalid import data format');
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('birthdays');
    localStorage.removeItem('appSettings');
    toast.info('Cache cleared successfully');
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        theme: 'system',
        notifications: true,
        autoCheck: true,
        language: 'en',
        weekStartsOn: 0
      };
      setLocalSettings(defaultSettings);
      toast.info('Settings reset to default');
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: <FaCog className="text-gray-600" /> },
    { id: "notifications", label: "Notifications", icon: <FaBell className="text-yellow-500" /> },
    { id: "data", label: "Data", icon: <FaDatabase className="text-blue-500" /> },
    { id: "account", label: "Account", icon: <FaUser className="text-green-500" /> }
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-4 md:mb-6 text-white">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2">Settings</h1>
        <p className="text-purple-100 text-sm md:text-base">Customize your Birthday Reminder experience</p>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs sm:text-sm text-gray-600">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            Sync: {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Error' : 'Updated'}
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-600 transition-colors w-full sm:w-auto mt-2 sm:mt-0"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Tabs - Improved for mobile */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-2 md:p-4 mb-4 md:mb-6">
        <div className="flex space-x-1 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-w-max ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1 md:mr-2 text-sm">{tab.icon}</span>
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Appearance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Theme
                  </label>
                  <select
                    value={localSettings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
                  >
                    <option value="system">System Default</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Language
                  </label>
                  <select
                    value={localSettings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Calendar</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Week starts on
                </label>
                <select
                  value={localSettings.weekStartsOn}
                  onChange={(e) => handleSettingChange('weekStartsOn', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Notification Preferences</h3>
              <div className="space-y-3 md:space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localSettings.autoCheck}
                    onChange={(e) => handleSettingChange('autoCheck', e.target.checked)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-check for birthdays</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Reminder Times</h3>
              <div className="text-sm text-gray-600">
                <p>Birthday reminders are sent at 9:00 AM local time.</p>
                <p className="mt-1">You'll receive notifications for:</p>
                <ul className="list-disc list-inside mt-2 ml-3 md:ml-4">
                  <li>Birthdays happening today</li>
                  <li>Birthdays happening tomorrow</li>
                  <li>Birthdays happening in the next 7 days</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Data Management */}
        {activeTab === 'data' && (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Export Data</h3>
              <div className="space-y-3 md:space-y-4">
                <p className="text-sm text-gray-600">
                  Export your birthday data as a JSON file for backup or transfer.
                </p>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm md:text-base w-full sm:w-auto"
                >
                  Export Data
                </button>
                {exportData && (
                  <div className="mt-3 md:mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Export Data (JSON)
                    </label>
                    <textarea
                      value={exportData}
                      readOnly
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs md:text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Import Data</h3>
              <div className="space-y-3 md:space-y-4">
                <p className="text-sm text-gray-600">
                  Import birthday data from a previous export. This will add to your existing data.
                </p>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste export JSON data here"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs md:text-sm"
                />
                <button
                  onClick={handleImportData}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base w-full sm:w-auto"
                >
                  Import Data
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Cache Management</h3>
              <div className="space-y-3 md:space-y-4">
                <p className="text-sm text-gray-600">
                  Clear cached data to free up space or resolve sync issues.
                </p>
                <button
                  onClick={handleClearCache}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm md:text-base w-full sm:w-auto"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Account Information</h3>
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Username:</span>
                    <p className="text-gray-600">user123</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">user@example.com</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Member since:</span>
                    <p className="text-gray-600">January 2024</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Storage used:</span>
                    <p className="text-gray-600">2.5 MB / 100 MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Danger Zone</h3>
              <div className="space-y-4 p-3 md:p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-800 mb-1 md:mb-2">Reset Settings</h4>
                  <p className="text-xs md:text-sm text-red-600 mb-2 md:mb-3">
                    Reset all settings to their default values.
                  </p>
                  <button
                    onClick={handleResetSettings}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs md:text-sm w-full sm:w-auto"
                  >
                    Reset to Defaults
                  </button>
                </div>

                <div className="pt-3 md:pt-4 border-t border-red-200">
                  <h4 className="font-medium text-red-800 mb-1 md:mb-2">Delete Account</h4>
                  <p className="text-xs md:text-sm text-red-600 mb-2 md:mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => toast.error('Account deletion would be implemented here')}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs md:text-sm w-full sm:w-auto"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2 md:px-6 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm md:text-base w-full sm:w-auto"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 md:mt-6 bg-blue-50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-blue-200">
        <h4 className="text-xs md:text-sm font-semibold text-blue-800 mb-1 md:mb-2 flex items-center">
          <span className="mr-2 text-yellow-500">
            <FaLightbulb />
          </span>
          Settings Tips
        </h4>
        <ul className="text-xs md:text-sm text-blue-700 space-y-0.5 md:space-y-1">
          <li>• Changes are automatically saved to your browser</li>
          <li>• Export your data regularly for backup</li>
          <li>• Use dark mode for better battery life on OLED screens</li>
          <li>• Enable auto-check to get timely birthday reminders</li>
        </ul>
      </div>
    </div>
  );
}

export default SettingsPage;