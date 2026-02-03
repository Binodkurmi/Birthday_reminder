// RegisterPage.js - Updated version
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Add useNavigate
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaUser,
  FaCheckCircle,
  FaShieldAlt
} from 'react-icons/fa';

function RegisterPage({ onRegister }) {
  const navigate = useNavigate(); // Initialize navigate
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirm: '', 
    terms: false 
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) err.email = 'Valid email required';
    if (!form.password || form.password.length < 8) err.password = 'Password must be 8+ characters';
    if (form.password !== form.confirm) err.confirm = 'Passwords do not match';
    if (!form.terms) err.terms = 'Accept terms & conditions';
    setErrors(err);
    
    if (Object.keys(err).length > 0) {
      toast.error(Object.values(err)[0]);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';
      
      console.log('Registering with API:', API);
      console.log('Sending data:', {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
      });
      
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.toLowerCase().trim(),
          password: form.password,
        }),
      });

      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.ok) {
        toast.success("Account created successfully!");
        
        // Call onRegister if provided
        if (onRegister && data.user && data.token) {
          onRegister(data.user, data.token);
        } else {
          // If no onRegister callback, navigate to login
          toast.info("Please login with your new account");
          navigate('/login');
        }
      } else {
        toast.error(data.error || `Registration failed (${res.status})`);
        console.error('Registration error:', data);
      }
    } catch (err) {
      console.error('Network error:', err);
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <FaUser className="text-white text-xl" />
            </div>
            <h1 className="text-lg font-bold text-white">Create Account</h1>
            <p className="text-blue-100 text-xs mt-1">Join our secure community</p>
          </div>

          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your name"
                  />
                  <FaUser className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                  <FaEnvelope className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <FaLock className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) => setForm({...form, confirm: e.target.value})}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                      errors.confirm ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <FaLock className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm({...form, terms: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-600">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-700">Terms</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 rounded-lg font-medium text-sm shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={navigateToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Sign in to existing account
              </button>
            </div>
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Secure registration</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="mr-1 text-blue-500" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;