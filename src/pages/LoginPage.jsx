import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) setForm(p => ({ ...p, email: saved }));
  }, []);

  const validate = () => {
    const err = {};
    if (!form.email.trim()) err.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Invalid email';
    if (!form.password) err.password = 'Password required';
    if (showCode && !code.trim()) err.code = 'Code required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (remember) localStorage.setItem('rememberedEmail', form.email);
    else localStorage.removeItem('rememberedEmail');

    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api';
      
      console.log('🔐 Attempting login...');
      
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: form.email.toLowerCase().trim(),
          password: form.password,
          rememberMe: remember 
        })
      });

      const data = await res.json();
      console.log('📊 Login response:', data);
      
      if (!res.ok) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 2) {
          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
          sessionStorage.setItem('securityCode', newCode);
          setShowCode(true);
          toast.info(`🔐 Security code sent: ${newCode}`);
        }
        
        // User-friendly error messages
        if (data.error?.includes('not found') || data.error?.includes('Invalid')) {
          toast.error('❌ Account not found. Please check your email or register.');
        } else if (data.error?.includes('password')) {
          toast.error('❌ Incorrect password. Please try again.');
        } else {
          toast.error(data.error || `Login failed (${res.status})`);
        }
        
        throw new Error(data.error || `Login failed (${res.status})`);
      }

      console.log('✅ Login successful!');
      
      // Reset attempts
      setAttempts(0);
      setShowCode(false);
      sessionStorage.removeItem('securityCode');
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Call onLogin callback
      if (onLogin && typeof onLogin === 'function') {
        console.log('🔄 Calling onLogin callback...');
        onLogin(data.user, data.token);
        toast.success(`👋 Welcome back, ${data.user?.name || 'User'}!`);
      } else {
        // Fallback if callback not provided
        console.log('⚠️ No onLogin callback, redirecting manually...');
        toast.success(`👋 Welcome back, ${data.user?.name || 'User'}!`);
        window.location.href = '/home'; // Full page reload to refresh auth state
      }
    } catch (err) {
      console.error('💥 Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigate('/register');
  };

  const forgotPassword = () => {
    if (!form.email) {
      toast.error('Please enter your email first');
      return;
    }
    toast.info(`Password reset link sent to ${form.email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-center">
            <h1 className="text-lg font-bold text-white">Welcome Back</h1>
            <p className="text-blue-100 text-xs">Sign in to your birthday reminder</p>
          </div>

          <div className="p-5">
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="you@example.com"
                  />
                  <FaEnvelope className="absolute left-3 top-2.5 text-gray-400 text-sm" />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    className="w-full pl-9 pr-9 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {showCode && (
                <div>
                  <label className="block text-sm text-red-600 mb-1">Security Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-sm"
                    placeholder="6-digit code"
                  />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={forgotPassword} 
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

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
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={navigateToRegister}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <FaUserPlus className="mr-2" />
                Create new account
              </button>
            </div>

            {/* Help text for users */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs text-green-700">
                <strong>Tip:</strong> New users will be automatically signed in after registration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;