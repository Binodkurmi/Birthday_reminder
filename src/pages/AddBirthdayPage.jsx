import React, { useState, useRef, useCallback, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaSave, FaUser, FaCalendarDay, FaImage, FaBell, FaNotesMedical } from 'react-icons/fa';

// Constants for better maintainability
const RELATIONSHIPS = [
  'Family', 'Friend', 'Colleague', 'Relative', 'Partner', 
  'Acquaintance', 'Other'
];

const NOTIFICATION_OPTIONS = [
  { value: 0, label: 'On the day' },
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '1 week before' },
  { value: 14, label: '2 weeks before' },
  { value: 30, label: '1 month before' }
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

// Initial form state
const INITIAL_FORM_DATA = {
  name: '',
  date: '',
  relationship: '',
  notes: '',
  image: null,
  imagePreview: null,
  notifyBefore: 7,
  allowNotifications: true
};

const AddBirthdayPage = () => {
  // State management
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Refs
  const fileInputRef = useRef(null);

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
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
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
    
    // Final validation
    if (!validateStep1()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        localStorage.removeItem('token');
        return;
      }

      // Prepare form data
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('date', formData.date);
      submitData.append('relationship', formData.relationship);
      submitData.append('notes', formData.notes);
      submitData.append('notifyBefore', formData.notifyBefore.toString());
      submitData.append('allowNotifications', formData.allowNotifications.toString());
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/birthdays`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      // Handle response
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = { message: 'Server response error' };
      }

      if (response.ok) {
        toast.success('🎉 Birthday added successfully!');
        
        // Reset form
        setFormData(INITIAL_FORM_DATA);
        setCurrentStep(1);
        setValidationErrors({});
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => window.location.reload(), 2000);
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
  }, [formData, validateStep1]);

  // Age and zodiac display
  const ageDisplay = useMemo(() => {
    const age = calculateAge();
    const zodiac = getZodiacSign(formData.date);
    
    if (!age && !zodiac) return null;
    
    return (
      <div className="mt-2 flex items-center space-x-4 text-sm">
        {age !== null && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            {age} years old
          </span>
        )}
        {zodiac && (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
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
      />
      
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent">
            Add Birthday
          </h1>
          <p className="mt-2 text-gray-600">Create a new birthday reminder</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                } font-semibold transition-all duration-300`}>
                  {step}
                </div>
                {step < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-300'
                  } transition-colors duration-300`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span className={currentStep === 1 ? 'text-purple-600' : ''}>
              Basic Details
            </span>
            <span className={currentStep === 2 ? 'text-purple-600' : ''}>
              Additional Info
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
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
                notificationOptions={NOTIFICATION_OPTIONS}
                onInputChange={handleInputChange}
                onImageChange={handleImageChange}
                onRemoveImage={removeImage}
                onPrevStep={prevStep}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

// Step 1 Component
const Step1Form = ({ 
  formData, 
  validationErrors, 
  relationships, 
  maxDate, 
  ageDisplay, 
  onInputChange, 
  onNextStep 
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
      <FaUser className="mr-2 text-purple-600" />
      Basic Information
    </h2>
    
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
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
            validationErrors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          aria-invalid={!!validationErrors.name}
          aria-describedby={validationErrors.name ? "name-error" : undefined}
        />
        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {validationErrors.name && (
        <p id="name-error" className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
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
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
            validationErrors.date ? 'border-red-300' : 'border-gray-300'
          }`}
          aria-invalid={!!validationErrors.date}
          aria-describedby={validationErrors.date ? "date-error" : undefined}
        />
        <FaCalendarDay className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      {validationErrors.date && (
        <p id="date-error" className="mt-1 text-sm text-red-600">{validationErrors.date}</p>
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
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white appearance-none"
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
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      Continue to Details
    </button>
  </div>
);

// Step 2 Component
const Step2Form = ({ 
  formData, 
  fileInputRef, 
  notificationOptions, 
  onInputChange, 
  onImageChange, 
  onRemoveImage, 
  onPrevStep, 
  onSubmit, 
  isSubmitting 
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
      <FaImage className="mr-2 text-purple-600" />
      Additional Details
    </h2>
    
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
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
            />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute -top-2 -right-2 h-7 w-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-md"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">Upload a photo (optional)</p>
          <p className="text-xs text-gray-500 mb-4">JPG, PNG up to 5MB</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        id="image"
        name="image"
        accept="image/*"
        onChange={onImageChange}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-colors"
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
        rows={4}
        placeholder="Add special memories, gift ideas, or anything you'd like to remember..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
      />
    </div>
    
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              name="allowNotifications"
              checked={formData.allowNotifications}
              onChange={onInputChange}
              className="sr-only"
            />
            <div className={`block w-12 h-6 rounded-full transition-colors ${
              formData.allowNotifications ? 'bg-purple-600' : 'bg-gray-300'
            }`} />
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              formData.allowNotifications ? 'transform translate-x-6' : ''
            }`} />
          </div>
          <span className="text-sm font-medium text-gray-700 flex items-center">
            <FaBell className="mr-2" />
            Enable Reminders
          </span>
        </label>
      </div>
      
      {formData.allowNotifications && (
        <div className="pl-4 border-l-2 border-purple-200 ml-1">
          <label htmlFor="notifyBefore" className="block text-sm font-medium text-gray-700 mb-2">
            Remind me before
          </label>
          <select
            id="notifyBefore"
            name="notifyBefore"
            value={formData.notifyBefore}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors bg-white"
          >
            {notificationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>

    <div className="flex space-x-4 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onPrevStep}
        className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        onClick={onSubmit}
        className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
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

export default AddBirthdayPage;