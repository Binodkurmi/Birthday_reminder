import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShieldAlt, 
  FaLock, 
  FaHeart, 
  FaGithub, 
  FaTwitter, 
  FaEnvelope,
  FaCookie,
  FaUserShield,
  FaDatabase
} from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Birthday Reminder</h3>
            </div>
            <p className="text-sm text-gray-600">
              Never miss an important celebration. Your trusted companion for remembering birthdays with privacy and care.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a 
                href="mailto:support@birthdayreminder.com" 
                className="text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Email"
              >
                <FaEnvelope className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <FaLock className="mr-2 text-blue-500" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/birthdays" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  All Birthdays
                </Link>
              </li>
              <li>
                <Link to="/add-birthday" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Add Birthday
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Notifications
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-gray-600 hover:text-purple-600 text-sm transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Security */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              <FaShieldAlt className="mr-2 text-green-500" />
              Privacy & Security
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaDatabase className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">
                  <strong>End-to-End Encryption:</strong> All your data is encrypted both in transit and at rest.
                </span>
              </li>
              <li className="flex items-start">
                <FaUserShield className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">
                  <strong>Zero Data Sharing:</strong> We never sell or share your personal information with third parties.
                </span>
              </li>
              <li className="flex items-start">
                <FaCookie className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">
                  <strong>Minimal Cookies:</strong> We use only essential cookies for authentication and functionality.
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-gray-600 hover:text-purple-600 transition-colors">
                  GDPR Compliance
                </Link>
              </li>
              <li>
                <Link to="/data-deletion" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Data Deletion Request
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Data Protection Badge */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white text-lg" />
              </div>
              <div>
                <h5 className="font-bold text-gray-800">Your Data is Safe With Us</h5>
                <p className="text-xs text-gray-600">
                  We follow industry best practices for data protection and security
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-white border border-green-200 text-green-700 text-xs font-medium rounded-full">
                🔒 End-to-End Encrypted
              </span>
              <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-medium rounded-full">
                🌐 HTTPS Secure
              </span>
              <span className="px-3 py-1 bg-white border border-purple-200 text-purple-700 text-xs font-medium rounded-full">
                📜 GDPR Compliant
              </span>
              <span className="px-3 py-1 bg-white border border-amber-200 text-amber-700 text-xs font-medium rounded-full">
                🚫 No Third-Party Sharing
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                © {currentYear} Birthday Reminder. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Made with <FaHeart className="inline text-red-400" /> for birthday celebrations worldwide
              </p>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Version 1.0.0</span>
              <span className="hidden md:inline">•</span>
              <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;