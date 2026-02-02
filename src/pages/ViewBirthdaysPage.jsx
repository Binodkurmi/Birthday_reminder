import React, { useState, useMemo, useEffect } from 'react';
import { FaLightbulb, FaBirthdayCake } from "react-icons/fa";
import { toast } from 'react-toastify';
import BirthdayCard from '../components/BirthdayCard';

function ViewBirthdaysPage({ birthdays, onBirthdayDeleted, isLoading, onBirthdayEdit }) {
  // Ensure birthdays is always an array
  const safeBirthdays = Array.isArray(birthdays) ? birthdays : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedRelationships, setSelectedRelationships] = useState(new Set());
  const [deletingId, setDeletingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [imageBaseUrl, setImageBaseUrl] = useState('');

  // Set the base URL for images
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED
    setImageBaseUrl(API_BASE);
  }, []);

  // Process birthdays to ensure proper image URLs
  const processedBirthdays = useMemo(() => {
    return safeBirthdays.map(birthday => {
      if (!birthday.image) {
        return { ...birthday, imageUrl: null };
      }

      // Already a full URL
      if (birthday.image.startsWith("http")) {
        return { ...birthday, imageUrl: birthday.image };
      }

      // API base (backend, not frontend)
      const API_BASE = import.meta.env.VITE_API_BASE || "https://birthdarreminder.onrender.com/api"; // ✅ UPDATED

      // Always prepend base URL
      const cleanPath = birthday.image.startsWith("/")
        ? birthday.image
        : `/${birthday.image}`;

      return { ...birthday, imageUrl: `${API_BASE}${cleanPath}` };
    });
  }, [safeBirthdays]);

  // Extract unique relationships for filtering
  const relationships = useMemo(() => {
    const rels = new Set();
    processedBirthdays.forEach(birthday => {
      if (birthday.relationship) {
        rels.add(birthday.relationship);
      }
    });
    return Array.from(rels).sort();
  }, [processedBirthdays]);

  // Filter and sort birthdays
  const filteredBirthdays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let filtered = processedBirthdays.filter(birthday => {
      // Search filter
      const matchesSearch = birthday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (birthday.notes && birthday.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Relationship filter
      const matchesRelationship = selectedRelationships.size === 0 ||
        (birthday.relationship && selectedRelationships.has(birthday.relationship));

      // Date filter
      const birthDate = new Date(birthday.date);
      birthDate.setFullYear(currentYear);

      switch (filterBy) {
        case 'upcoming':
          const diffTime = birthDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return matchesSearch && matchesRelationship && diffDays >= 0;
        case 'past':
          const pastDiffTime = today - birthDate;
          const pastDiffDays = Math.ceil(pastDiffTime / (1000 * 60 * 60 * 24));
          return matchesSearch && matchesRelationship && pastDiffDays > 0;
        case 'thisMonth':
          return matchesSearch && matchesRelationship && birthDate.getMonth() === currentMonth;
        default:
          return matchesSearch && matchesRelationship;
      }
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      switch (sortBy) {
        case 'date':
          return dateA - dateB;
        case 'upcoming':
          dateA.setFullYear(currentYear);
          dateB.setFullYear(currentYear);
          const diffA = dateA - today;
          const diffB = dateB - today;
          // Handle dates that have passed this year
          if (diffA < 0 && diffB >= 0) return 1;
          if (diffB < 0 && diffA >= 0) return -1;
          return Math.abs(diffA) - Math.abs(diffB);
        case 'recent':
          return dateB - dateA;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [processedBirthdays, searchTerm, sortBy, filterBy, selectedRelationships]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this birthday? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);

    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://birthdarreminder.onrender.com/api'; // ✅ UPDATED

      const response = await fetch(`${API_BASE}/birthdays/${id}`, { // ✅ REMOVED duplicate /api
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Birthday deleted successfully ');
        onBirthdayDeleted();
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete birthday');
      }
    } catch (error) {
      console.error('Error deleting birthday:', error);
      toast.error(error.message || 'Failed to delete birthday');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRelationshipFilter = (relationship) => {
    setSelectedRelationships(prev => {
      const newSet = new Set(prev);
      if (newSet.has(relationship)) {
        newSet.delete(relationship);
      } else {
        newSet.add(relationship);
      }
      return newSet;
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSortBy('name');
    setFilterBy('all');
    setSelectedRelationships(new Set());
  };

  const getStats = () => {
    return {
      total: processedBirthdays.length,
      filtered: filteredBirthdays.length,
      upcoming: processedBirthdays.filter(b => {
        const birthDate = new Date(b.date);
        birthDate.setFullYear(new Date().getFullYear());
        return birthDate >= new Date();
      }).length,
      thisMonth: processedBirthdays.filter(b => new Date(b.date).getMonth() === new Date().getMonth()).length
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-600">Loading birthdays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">All Birthdays</h1>
            <p className="text-purple-100">
              {stats.total} birthday{stats.total !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              title="Toggle filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
          <div className="text-sm text-gray-600">This Month</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-orange-600">{stats.filtered}</div>
          <div className="text-sm text-gray-600">Filtered</div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search names or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="name">Name (A-Z)</option>
                <option value="date">Date (Chronological)</option>
                <option value="upcoming">Upcoming First</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>

            {/* Filter By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming Only</option>
                <option value="past">Past Birthdays</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>
          </div>

          {/* Relationship Filters */}
          {relationships.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
              <div className="flex flex-wrap gap-2">
                {relationships.map(rel => (
                  <button
                    key={rel}
                    onClick={() => handleRelationshipFilter(rel)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedRelationships.has(rel)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearAllFilters}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {filteredBirthdays.length} {filteredBirthdays.length === 1 ? 'Birthday' : 'Birthdays'}
        </h2>
        <span className="text-sm text-gray-500">
          {searchTerm && `Search: "${searchTerm}"`}
          {selectedRelationships.size > 0 && ` • ${selectedRelationships.size} relationship filter${selectedRelationships.size !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Birthdays Grid */}
      {filteredBirthdays.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <span className="text-xl sm:text-2xl md:text-3xl">
            <FaBirthdayCake />
          </span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchTerm || selectedRelationships.size > 0 ? 'No birthdays found' : 'No birthdays yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedRelationships.size > 0
              ? 'Try adjusting your search or filter criteria.'
              : 'Start adding birthdays to keep track of special moments!'
            }
          </p>
          {(searchTerm || selectedRelationships.size > 0) && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBirthdays.map(birthday => (
            <div key={birthday._id || birthday.id} className="relative group">
              <BirthdayCard
                birthday={birthday}
                showActions={true}
                onDelete={() => handleDelete(birthday._id)}
                onEdit={() => onBirthdayEdit(birthday)}
                imageBaseUrl="https://birthdarreminder.onrender.com" // ✅ UPDATED: Removed /api for image URLs
              />
              {deletingId === birthday._id && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-8 bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
          <span className="mr-2 text-yellow-500">
            <FaLightbulb />
          </span>
          Pro Tips
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use the search to find birthdays by name or notes</li>
          <li>• Filter by relationship type to see specific groups</li>
          <li>• Sort by "Upcoming First" to see birthdays coming soon</li>
          <li>• Click on any birthday card to view detailed information</li>
        </ul>
      </div>
    </div>
  );
}

export default ViewBirthdaysPage;