import React, { useState } from 'react';
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
  FaDatabase,
  FaChevronDown,
  FaChevronUp,
  FaHome,
  FaCalendarAlt,
  FaPlusCircle,
  FaBell,
  FaChartBar
} from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const quickLinks = [
    { to: "/home", label: "Home", icon: <FaHome className="w-3 h-3" /> },
    { to: "/birthdays", label: "All Birthdays", icon: <FaCalendarAlt className="w-3 h-3" /> },
    { to: "/add-birthday", label: "Add Birthday", icon: <FaPlusCircle className="w-3 h-3" /> },
    { to: "/notifications", label: "Notifications", icon: <FaBell className="w-3 h-3" /> },
    { to: "/analytics", label: "Analytics", icon: <FaChartBar className="w-3 h-3" /> }
  ];

  const legalLinks = [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/cookies", label: "Cookie Policy" },
   
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      {/* Mobile Compact Footer */}
      <div className="lg:hidden">
        {/* Mobile Social & Quick Actions */}
        <div className="bg-white px-3 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                aria-label="GitHub"
              >
                <FaGithub className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors p-2"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a 
                href="mailto:support@birthdayreminder.com" 
                className="text-gray-400 hover:text-red-400 transition-colors p-2"
                aria-label="Email"
              >
                <FaEnvelope className="w-4 h-4" />
              </a>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md flex items-center justify-center">
                <FaShieldAlt className="text-white text-xs" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Secure</span>
            </div>
          </div>
        </div>

        {/* Expandable Sections for Mobile */}
        <div className="divide-y divide-gray-100">
          {/* Quick Links - Collapsible */}
          <div className="px-3 py-2">
            <button 
              onClick={() => toggleSection('quickLinks')}
              className="w-full flex justify-between items-center py-2"
            >
              <div className="flex items-center space-x-2">
                <FaLock className="text-blue-500 text-sm" />
                <span className="text-sm font-medium text-gray-700">Quick Links</span>
              </div>
              {expandedSections.quickLinks ? 
                <FaChevronUp className="text-gray-400 text-xs" /> : 
                <FaChevronDown className="text-gray-400 text-xs" />
              }
            </button>
            
            {expandedSections.quickLinks && (
              <div className="mt-2 pl-6">
                <ul className="space-y-1">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.to} 
                        className="flex items-center space-x-2 text-xs text-gray-600 hover:text-purple-600 py-1"
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Legal Links - Collapsible */}
          <div className="px-3 py-2">
            <button 
              onClick={() => toggleSection('legal')}
              className="w-full flex justify-between items-center py-2"
            >
              <span className="text-sm font-medium text-gray-700">Legal</span>
              {expandedSections.legal ? 
                <FaChevronUp className="text-gray-400 text-xs" /> : 
                <FaChevronDown className="text-gray-400 text-xs" />
              }
            </button>
            
            {expandedSections.legal && (
              <div className="mt-2">
                <ul className="space-y-1">
                  {legalLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.to} 
                        className="text-xs text-gray-600 hover:text-purple-600 py-1 block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Data Protection Badge - Always Visible */}
          <div className="px-3 py-3 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaShieldAlt className="text-white text-sm" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-800">Data Protected</h5>
                <p className="text-[10px] text-gray-600">Industry standard security</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-0.5 bg-white border border-green-200 text-green-700 text-[10px] font-medium rounded-full">
                🔒 Encrypted
              </span>
              <span className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 text-[10px] font-medium rounded-full">
                🌐 Secure
              </span>
              <span className="px-2 py-0.5 bg-white border border-purple-200 text-purple-700 text-[10px] font-medium rounded-full">
                📜 Compliant
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Copyright */}
        <div className="px-3 py-3 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-600">
              © {currentYear} Birthday Reminder
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Made with <FaHeart className="inline text-red-400 w-2 h-2" /> worldwide
            </p>
            <div className="flex justify-center items-center space-x-2 mt-1 text-[10px] text-gray-500">
              <span>v1.0.0</span>
              <span>•</span>
              <span>Updated: {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Footer (Original Design) */}
      <div className="hidden lg:block container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Birthday Reminder</h3>
            </div>
            <p className="text-sm text-gray-600">
              Never miss an important celebration.
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
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaLock className="mr-2 text-blue-500" />
              Quick Links
            </h4>
            <ul className="space-y-1">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.to} className="text-gray-600 hover:text-purple-600 text-sm transition-colors flex items-center space-x-2 py-1">
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy & Security */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaShieldAlt className="mr-2 text-green-500" />
              Privacy & Security
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FaDatabase className="text-blue-500 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                <span className="text-xs text-gray-600">
                  <strong>Encrypted:</strong> Data secured in transit and at rest.
                </span>
              </li>
              <li className="flex items-start">
                <FaUserShield className="text-green-500 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                <span className="text-xs text-gray-600">
                  <strong>No Sharing:</strong> We never sell your data.
                </span>
              </li>
              <li className="flex items-start">
                <FaCookie className="text-amber-500 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                <span className="text-xs text-gray-600">
                  <strong>Minimal Cookies:</strong> Essential only.
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Legal</h4>
            <ul className="space-y-1 text-sm">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.to} className="text-gray-600 hover:text-purple-600 transition-colors block py-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data Protection Badge */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-3 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white text-lg" />
              </div>
              <div>
                <h5 className="font-bold text-gray-800">Your Data is Safe With Us</h5>
                <p className="text-xs text-gray-600">
                  Industry best practices for data protection
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white border border-green-200 text-green-700 text-xs font-medium rounded-full">
                🔒 End-to-End Encrypted
              </span>
              <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-medium rounded-full">
                🌐 HTTPS Secure
              </span>
              <span className="px-3 py-1 bg-white border border-purple-200 text-purple-700 text-xs font-medium rounded-full">
                📜 GDPR Compliant
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-3 md:mb-0">
              <p className="text-sm text-gray-600">
                © {currentYear} Birthday Reminder. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Made with <FaHeart className="inline text-red-400" /> for birthday celebrations worldwide
              </p>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;