// src/pages/AddBirthdayPage.jsx
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaArrowLeft, 
  FaSave, 
  FaUser, 
  FaCalendarDay, 
  FaImage, 
  FaBell, 
  FaNotesMedical,
  FaSync 
} from 'react-icons/fa';

// Constants
const RELATIONSHIPS = [
  'Family', 'Friend', 'Colleague', 'Relative', 'Partner', 
  'Acquaintance', 'Other'
];

// Updated to match backend expectations
const NOTIFICATION_PREFERENCES = [
  { id: 'onTheDay', label: 'On the day', value: 'onTheDay' },
  { id: 'oneDayBefore', label: '1 day before', value: 'oneDayBefore' },
  { id: 'oneWeekBefore', label: '1 week before', value: 'oneWeekBefore' }
];

const ZODIAC_SIGNS = [
  { sign: "मकर", start: [1, 1], end: [1, 19] },
  { sign: "कुम्भ", start: [1, 20], end: [2, 18] },
  { sign: "मीन", start: [2, 19], end: [3, 20] },
  { sign: "मेष", start: [3, 21], end: [4, 19] },
  { sign: "वृषभ", start: [4, 20], end: [5, 20] },
  { sign: "मिथुन", start: [5, 21], end: [6, 20] },
  { sign: "कर्क", start: [6, 21], end: [7, 22] },
  { sign: "सिंह", start: [7, 23], end: [8, 22] },
  { sign: "कन्या", start: [8, 23], end: [9, 22] },
  { sign: "तुला", start: [9, 23], end: [10, 22] },
  { sign: "वृश्चिक", start: [10, 23], end: [11, 21] },
  { sign: "धनु", start: [11, 22], end: [12, 21] },
  { sign: "मकर", start: [12, 22], end: [12, 31] }
];

// Initial form state - updated to match backend
const INITIAL_FORM_DATA = {
  name: '',
  date: '',
  relationship: '',
  notes: '',
  image: null,
  imagePreview: null,
  notificationPreferences: {
    oneDayBefore: true,
    oneWeekBefore: true,
    onTheDay: true
  }
};

const AddBirthdayPage = () => {
  const navigate = useNavigate();
  
  // State management
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      toast.info('Refreshing...');
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(1);
      setValidationErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => {
        toast.success('Form refreshed!');
      }, 500);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get gradient color based on urgency
  const getHeaderGradient = () => {
    return 'bg-gradient-to-r from-blue-500 to-purple-500';
  };

  // Calculate age from birth date
  const calculateAge = useCallback(() => {
    if (!formData.date) return null;
    
    const birthDate = new Date(formData.date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }, [formData.date]);

  // Get zodiac sign from date
  const getZodiacSign = useCallback((date) => {
    if (!date) return null;
    
    const birthDate = new Date(date);
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    
    return ZODIAC_SIGNS.find(sign => 
      (month === sign.start[0] && day >= sign.start[1]) || 
      (month === sign.end[0] && day <= sign.end[1])
    )?.sign;
  }, []);

  // Form field handlers
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('notificationPreferences.')) {
      const prefName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [prefName]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [validationErrors]);

  // Image upload handler
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: reader.result
      }));
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, []);

  // Remove selected image
  const removeImage = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Toggle all notifications
  const toggleAllNotifications = useCallback(() => {
    const allEnabled = Object.values(formData.notificationPreferences).every(Boolean);
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        oneDayBefore: !allEnabled,
        oneWeekBefore: !allEnabled,
        onTheDay: !allEnabled
      }
    }));
  }, [formData.notificationPreferences]);

  // Form validation
  const validateStep1 = useCallback(() => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.date) {
      errors.date = 'Birth date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      
      if (selectedDate > today) {
        errors.date = 'Birth date cannot be in the future';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.name, formData.date]);

  // Navigation between steps
  const nextStep = useCallback(() => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  }, [validateStep1]);

  const prevStep = useCallback(() => {
    setCurrentStep(1);
    setValidationErrors({});
  }, []);

  // Form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('date', formData.date);
      submitData.append('relationship', formData.relationship);
      submitData.append('notes', formData.notes);
      
      // Send notification preferences as JSON string
      submitData.append('notificationPreferences', JSON.stringify(formData.notificationPreferences));
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';
      const response = await fetch(`${API_BASE}/birthdays`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = { message: 'Server response error' };
      }

      if (response.ok) {
        toast.success('🎉 Birthday added successfully!');
        
        setFormData(INITIAL_FORM_DATA);
        setCurrentStep(1);
        setValidationErrors({});
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (response.status === 400) {
        toast.error(responseData.message || 'Please check your inputs and try again.');
      } else if (response.status === 409) {
        toast.error('A birthday with this name already exists.');
      } else {
        toast.error(responseData.message || 'Unable to save birthday. Please try again.');
      }
    } catch (error) {
      console.error('Error adding birthday:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateStep1, navigate]);

  // Age and zodiac display
  const ageDisplay = useMemo(() => {
    const age = calculateAge();
    const zodiac = getZodiacSign(formData.date);
    
    if (!age && !zodiac) return null;
    
    return (
      <div className="mt-1 flex items-center space-x-2 text-xs">
        {age !== null && (
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full font-medium">
            {age} years old
          </span>
        )}
        {zodiac && (
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full font-medium">
            {zodiac}
          </span>
        )}
      </div>
    );
  }, [formData.date, calculateAge, getZodiacSign]);

  // Get max date for date input (today)
  const maxDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Form completion percentage
  const completionPercentage = useMemo(() => {
    let completed = 0;
    if (formData.name.trim()) completed += 25;
    if (formData.date) completed += 25;
    if (formData.relationship) completed += 20;
    if (formData.notes) completed += 15;
    if (formData.imagePreview) completed += 15;
    return Math.min(completed, 100);
  }, [formData]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Header Section with Nav Menu Color Scheme */}
      <div className={`${getHeaderGradient()} rounded-2xl shadow-xl p-6 mb-6 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Add New Birthday</h1>
            <p className="opacity-90 text-sm">
              {completionPercentage === 100 
                ? 'Ready to save!'
                : `Form progress: ${completionPercentage}%`
              }
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-colors disabled:opacity-50"
          >
            <FaSync className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content - Compact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Steps and Progress */}
        <div className="lg:col-span-1">
          {/* Progress Steps */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Steps</h3>
            <div className="space-y-4">
              <div className={`flex items-center p-3 rounded-lg ${currentStep === 1 ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' : ''}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                  currentStep >= 1 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-400'
                } font-semibold text-sm`}>
                  1
                </div>
                <div>
                  <div className={`font-medium ${currentStep === 1 ? 'text-blue-700' : 'text-gray-600'}`}>
                    Basic Details
                  </div>
                  <div className="text-xs text-gray-500">Name, Date, Relationship</div>
                </div>
              </div>
              
              <div className={`flex items-center p-3 rounded-lg ${currentStep === 2 ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' : ''}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                  currentStep >= 2 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-400'
                } font-semibold text-sm`}>
                  2
                </div>
                <div>
                  <div className={`font-medium ${currentStep === 2 ? 'text-blue-700' : 'text-gray-600'}`}>
                    Additional Info
                  </div>
                  <div className="text-xs text-gray-500">Photo, Notes, Reminders</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Completion</span>
                <span className="text-sm font-bold text-purple-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    completionPercentage === 100 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {completionPercentage === 100 
                  ? 'All required fields completed!'
                  : 'Fill in all fields to complete the form'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2">
          {/* Compact Form */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <form onSubmit={handleSubmit} className="p-5">
              {/* Step Indicator Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  {currentStep === 1 ? (
                    <>
                      <FaUser className="mr-2 text-blue-600" />
                      Step 1: Basic Information
                    </>
                  ) : (
                    <>
                      <FaImage className="mr-2 text-purple-600" />
                      Step 2: Additional Details
                    </>
                  )}
                </h2>
                <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Step {currentStep} of 2
                </div>
              </div>

              {currentStep === 1 ? (
                <Step1Form 
                  formData={formData}
                  validationErrors={validationErrors}
                  relationships={RELATIONSHIPS}
                  maxDate={maxDate}
                  ageDisplay={ageDisplay}
                  onInputChange={handleInputChange}
                  onNextStep={nextStep}
                />
              ) : (
                <Step2Form 
                  formData={formData}
                  fileInputRef={fileInputRef}
                  notificationPreferences={NOTIFICATION_PREFERENCES}
                  onInputChange={handleInputChange}
                  onImageChange={handleImageChange}
                  onRemoveImage={removeImage}
                  onToggleAllNotifications={toggleAllNotifications}
                  onPrevStep={prevStep}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 1 Component - Compact
const Step1Form = ({ 
  formData, 
  validationErrors, 
  relationships, 
  maxDate, 
  ageDisplay, 
  onInputChange, 
  onNextStep 
}) => (
  <div className="space-y-5">
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
        Full Name <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter full name"
          className={`w-full pl-10 pr-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          aria-invalid={!!validationErrors.name}
          aria-describedby={validationErrors.name ? "name-error" : undefined}
        />
        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {validationErrors.name && (
        <p id="name-error" className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
      )}
    </div>
    
    <div>
      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
        Birth Date <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={onInputChange}
          max={maxDate}
          className={`w-full pl-10 pr-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            validationErrors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          aria-invalid={!!validationErrors.date}
          aria-describedby={validationErrors.date ? "date-error" : undefined}
        />
        <FaCalendarDay className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {validationErrors.date && (
        <p id="date-error" className="mt-1 text-xs text-red-600">{validationErrors.date}</p>
      )}
      {ageDisplay}
    </div>
    
    <div>
      <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
        Relationship
      </label>
      <select
        id="relationship"
        name="relationship"
        value={formData.relationship}
        onChange={onInputChange}
        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
      >
        <option value="">Select relationship</option>
        {relationships.map(rel => (
          <option key={rel} value={rel}>{rel}</option>
        ))}
      </select>
    </div>

    <button
      type="button"
      onClick={onNextStep}
      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow hover:shadow-md"
    >
      Continue to Step 2
    </button>
  </div>
);

// Step 2 Component - Compact with updated notification preferences
const Step2Form = ({ 
  formData, 
  fileInputRef, 
  notificationPreferences, 
  onInputChange, 
  onImageChange, 
  onRemoveImage, 
  onToggleAllNotifications,
  onPrevStep, 
  onSubmit, 
  isSubmitting 
}) => {
  const allNotificationsEnabled = Object.values(formData.notificationPreferences).every(Boolean);
  
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo (Optional)
        </label>
        {formData.imagePreview ? (
          <div className="mb-4">
            <div className="relative inline-block">
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={onRemoveImage}
                className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs hover:opacity-90 transition-opacity shadow"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gradient-to-br from-gray-50 to-purple-50"
          >
            <FaImage className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-xs text-gray-600">Click to upload a photo</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={onImageChange}
          className="w-full text-xs text-gray-500 mt-2 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gradient-to-r file:from-blue-50 file:to-purple-50 file:text-purple-700 hover:file:bg-gradient-to-r hover:file:from-blue-100 hover:file:to-purple-100 transition-colors"
        />
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <FaNotesMedical className="mr-2 text-gray-400" />
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={onInputChange}
          rows={3}
          placeholder="Add special memories, gift ideas, or anything you'd like to remember..."
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
        />
      </div>
      
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FaBell className="text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Notification Preferences</span>
          </div>
          <button
            type="button"
            onClick={onToggleAllNotifications}
            className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors"
          >
            {allNotificationsEnabled ? 'Disable All' : 'Enable All'}
          </button>
        </div>
        
        <div className="space-y-3">
          {notificationPreferences.map(pref => (
            <label key={pref.id} className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors">
              <span className="text-sm text-gray-700">{pref.label}</span>
              <div className="relative">
                <input
                  type="checkbox"
                  name={`notificationPreferences.${pref.value}`}
                  checked={formData.notificationPreferences[pref.value]}
                  onChange={onInputChange}
                  className="sr-only"
                />
                <div className={`block w-10 h-5 rounded-full transition-colors ${
                  formData.notificationPreferences[pref.value] 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gray-300'
                }`} />
                <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${
                  formData.notificationPreferences[pref.value] ? 'transform translate-x-5' : ''
                }`} />
              </div>
            </label>
          ))}
        </div>
        
        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-blue-200">
          {allNotificationsEnabled 
            ? '✅ You will receive all birthday reminders' 
            : '📅 Select when you want to be reminded'}
        </p>
      </div>

      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onPrevStep}
          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow hover:shadow-md"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>Save Birthday</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddBirthdayPage;