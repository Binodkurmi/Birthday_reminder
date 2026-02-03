// src/pages/AnalyticsPage.jsx
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Cake, 
  TrendingUp, 
  Filter,
  Download,
  Clock,
  Star,
  Gift,
  ChevronDown
} from 'lucide-react';
import { FaSync } from 'react-icons/fa'; // Import FaSync from react-icons

const AnalyticsPage = ({ birthdays, isLoading, onRefresh }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [activeSection, setActiveSection] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get gradient color based on days until next birthday
  const getGradientColor = (daysUntil) => {
    if (daysUntil === 0) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (daysUntil === 1) return 'bg-gradient-to-r from-orange-500 to-pink-500';
    if (daysUntil < 7) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    return 'bg-gradient-to-r from-gray-500 to-gray-700';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Section with Nav Menu Color Scheme */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Analytics</h1>
              <p className="text-yellow-100">Loading your birthday insights...</p>
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
        
        <div className="flex flex-col justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate comprehensive stats
  const calculateStats = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    let filteredBirthdays = birthdays || [];
    
    // Apply time range filter
    if (timeRange === 'year') {
      filteredBirthdays = filteredBirthdays.filter(b => {
        const birthDate = new Date(b.date);
        return birthDate.getFullYear() === currentYear;
      });
    } else if (timeRange === 'month') {
      filteredBirthdays = filteredBirthdays.filter(b => {
        const birthDate = new Date(b.date);
        return birthDate.getMonth() === currentMonth && 
               birthDate.getFullYear() === currentYear;
      });
    }

    const totalBirthdays = filteredBirthdays.length;
    
    // Upcoming birthdays (next 30 days)
    const upcomingBirthdays = filteredBirthdays.filter(b => {
      const birthDate = new Date(b.date);
      const nextBirthday = new Date(
        today.getFullYear(), 
        birthDate.getMonth(), 
        birthDate.getDate()
      );
      if (nextBirthday < today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil >= 0;
    });

    // Today's birthdays
    const todaysBirthdays = filteredBirthdays.filter(b => {
      const birthDate = new Date(b.date);
      const nextBirthday = new Date(
        today.getFullYear(), 
        birthDate.getMonth(), 
        birthDate.getDate()
      );
      if (nextBirthday < today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
      return daysUntil === 0;
    });

    // Recent birthdays (past 30 days)
    const recentBirthdays = filteredBirthdays.filter(b => {
      const birthDate = new Date(b.date);
      const lastBirthday = new Date(
        today.getFullYear(), 
        birthDate.getMonth(), 
        birthDate.getDate()
      );
      if (lastBirthday > today) {
        lastBirthday.setFullYear(lastBirthday.getFullYear() - 1);
      }
      const daysSince = Math.ceil((today - lastBirthday) / (1000 * 60 * 60 * 24));
      return daysSince <= 30 && daysSince > 0;
    });

    // Calculate ages
    const ages = filteredBirthdays.map(b => {
      const birthDate = new Date(b.date);
      return today.getFullYear() - birthDate.getFullYear();
    }).filter(age => age > 0);
    
    const averageAge = ages.length > 0 
      ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
      : 0;
    
    const maxAge = ages.length > 0 ? Math.max(...ages) : 0;
    const minAge = ages.length > 0 ? Math.min(...ages) : 0;

    // Birthdays by month
    const birthdaysByMonth = filteredBirthdays.reduce((acc, birthday) => {
      const month = new Date(birthday.date).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Next 7 days birthdays
    const nextWeekBirthdays = upcomingBirthdays.filter(b => {
      const birthDate = new Date(b.date);
      const nextBirthday = new Date(
        today.getFullYear(), 
        birthDate.getMonth(), 
        birthDate.getDate()
      );
      if (nextBirthday < today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7;
    });

    // Get the most urgent upcoming birthday
    let mostUrgentBirthday = null;
    let minDaysUntil = Infinity;
    
    upcomingBirthdays.forEach(b => {
      const birthDate = new Date(b.date);
      const nextBirthday = new Date(
        today.getFullYear(), 
        birthDate.getMonth(), 
        birthDate.getDate()
      );
      if (nextBirthday < today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < minDaysUntil) {
        minDaysUntil = daysUntil;
        mostUrgentBirthday = { ...b, daysUntil };
      }
    });

    // Peak birthday month
    const peakMonth = Object.entries(birthdaysByMonth).length > 0
      ? Object.entries(birthdaysByMonth).reduce((a, b) => a[1] > b[1] ? a : b)
      : null;

    return {
      totalBirthdays,
      upcomingBirthdays: upcomingBirthdays.length,
      todaysBirthdays: todaysBirthdays.length,
      recentBirthdays: recentBirthdays.length,
      averageAge,
      maxAge,
      minAge,
      birthdaysByMonth,
      nextWeekBirthdays,
      mostUrgentBirthday,
      minDaysUntil,
      peakMonth,
      filteredBirthdays
    };
  }, [birthdays, timeRange]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const stats = calculateStats;

  // Determine header gradient based on most urgent birthday
  const getHeaderGradient = () => {
    if (stats.todaysBirthdays > 0) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (stats.mostUrgentBirthday && stats.minDaysUntil === 1) return 'bg-gradient-to-r from-orange-500 to-pink-500';
    if (stats.mostUrgentBirthday && stats.minDaysUntil < 7) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    return 'bg-gradient-to-r from-gray-500 to-gray-700';
  };

  const exportData = () => {
    const dataStr = JSON.stringify(stats.filteredBirthdays, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `birthday-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Section with Dynamic Nav Menu Colors */}
      <div className={`${getHeaderGradient()} rounded-2xl shadow-xl p-6 mb-6 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="opacity-90">
              {stats.totalBirthdays > 0 
                ? stats.todaysBirthdays > 0 
                  ? `🎉 ${stats.todaysBirthdays} birthday${stats.todaysBirthdays !== 1 ? 's' : ''} today!`
                  : stats.mostUrgentBirthday 
                    ? `Next birthday in ${stats.minDaysUntil} day${stats.minDaysUntil !== 1 ? 's' : ''}`
                    : `Insights from ${stats.totalBirthdays} birthday${stats.totalBirthdays !== 1 ? 's' : ''}`
                : 'No birthday data available yet.'
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

      {stats.totalBirthdays === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <BarChart3 className="text-6xl text-gray-400 mx-auto mb-6" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add birthdays to see analytics and insights.
          </p>
          <button 
            onClick={() => window.location.hash = '#/add'}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add Birthday
          </button>
        </div>
      ) : (
        <>
          {/* Quick Stats Row with Gradient Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`${stats.todaysBirthdays > 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-gray-500 to-gray-700'} rounded-xl p-4 text-white shadow-md`}>
              <div className="text-2xl font-bold">{stats.totalBirthdays}</div>
              <div className="text-sm opacity-90">Total Birthdays</div>
            </div>
            <div className={`${stats.todaysBirthdays > 0 ? 'bg-gradient-to-r from-orange-500 to-pink-500' : stats.nextWeekBirthdays.length > 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-gray-500 to-gray-700'} rounded-xl p-4 text-white shadow-md`}>
              <div className="text-2xl font-bold">{stats.upcomingBirthdays}</div>
              <div className="text-sm opacity-90">Next 30 Days</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white shadow-md">
              <div className="text-2xl font-bold">{stats.recentBirthdays}</div>
              <div className="text-sm opacity-90">Past 30 Days</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-md">
              <div className="text-2xl font-bold">{stats.averageAge}</div>
              <div className="text-sm opacity-90">Avg Age</div>
            </div>
          </div>

          {/* Filter and Export Controls */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-sm p-4 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="year">This Year</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>

          {/* Mobile Navigation Tabs with Gradient */}
          <div className="flex overflow-x-auto mb-6 pb-2 -mx-4 px-4">
            <button
              onClick={() => setActiveSection('overview')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg mr-2 ${activeSection === 'overview' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('upcoming')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg mr-2 ${activeSection === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveSection('months')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg ${activeSection === 'months' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'}`}
            >
              Months
            </button>
          </div>

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards with Gradient */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-4 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-5 h-5 opacity-90" />
                    <TrendingUp className="w-4 h-4 opacity-90" />
                  </div>
                  <h3 className="text-xs font-medium opacity-90 mb-1">Total Today</h3>
                  <p className="text-xl font-bold">{stats.todaysBirthdays}</p>
                </div>
                
                <div className={`${stats.nextWeekBirthdays.length > 0 ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gradient-to-r from-gray-500 to-gray-700'} text-white p-4 rounded-xl shadow-md`}>
                  <div className="flex items-center justify-between mb-3">
                    <Calendar className="w-5 h-5 opacity-90" />
                    <Clock className="w-4 h-4 opacity-90" />
                  </div>
                  <h3 className="text-xs font-medium opacity-90 mb-1">Next Week</h3>
                  <p className="text-xl font-bold">{stats.nextWeekBirthdays.length}</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-4 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <Cake className="w-5 h-5 opacity-90" />
                    <Star className="w-4 h-4 opacity-90" />
                  </div>
                  <h3 className="text-xs font-medium opacity-90 mb-1">Avg Age</h3>
                  <p className="text-xl font-bold">{stats.averageAge}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <Gift className="w-5 h-5 opacity-90" />
                    <Calendar className="w-4 h-4 opacity-90" />
                  </div>
                  <h3 className="text-xs font-medium opacity-90 mb-1">Recent</h3>
                  <p className="text-xl font-bold">{stats.recentBirthdays}</p>
                </div>
              </div>

              {/* Age Distribution with Gradient */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Age Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{stats.minAge}</div>
                    <div className="text-sm text-blue-800 mt-1 font-medium">Youngest</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{stats.averageAge}</div>
                    <div className="text-sm text-orange-800 mt-1 font-medium">Average</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{stats.maxAge}</div>
                    <div className="text-sm text-purple-800 mt-1 font-medium">Oldest</div>
                  </div>
                </div>
              </div>

              {/* Quick Facts with Status-based Colors */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Facts</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <span className="text-gray-700 font-medium">Most birthdays in</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${stats.peakMonth && stats.peakMonth[1] > 0 ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                      {stats.peakMonth ? monthNames[stats.peakMonth[0]] : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <span className="text-gray-700 font-medium">Recent celebrations</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${stats.recentBirthdays > 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                      {stats.recentBirthdays}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <span className="text-gray-700 font-medium">Months covered</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${Object.keys(stats.birthdaysByMonth).length > 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                      {Object.keys(stats.birthdaysByMonth).length}/12
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {activeSection === 'upcoming' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Birthdays</h3>
              
              {stats.nextWeekBirthdays.length > 0 ? (
                stats.nextWeekBirthdays.map((birthday, index) => {
                  const birthDate = new Date(birthday.date);
                  const today = new Date();
                  const nextBirthday = new Date(
                    today.getFullYear(), 
                    birthDate.getMonth(), 
                    birthDate.getDate()
                  );
                  if (nextBirthday < today) {
                    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
                  }
                  const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
                  
                  const gradientClass = getGradientColor(daysUntil);
                  
                  return (
                    <div 
                      key={index} 
                      className={`${gradientClass} flex items-center justify-between p-4 rounded-xl text-white shadow-md`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <Cake className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold">{birthday.name}</h4>
                          <p className="text-sm opacity-90">
                            {birthDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {daysUntil === 0 ? '🎉 TODAY!' : `${daysUntil}d`}
                        </div>
                        <div className="text-xs opacity-90">
                          {daysUntil === 0 ? 'Celebrate!' : 'to go'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl border border-gray-300">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    No birthdays in the next 7 days
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Months Section */}
          {activeSection === 'months' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Birthdays by Month</h3>
              
              <div className="space-y-3">
                {Object.entries(stats.birthdaysByMonth).map(([month, count]) => {
                  const percentage = (count / Math.max(...Object.values(stats.birthdaysByMonth))) * 100;
                  const isCurrentMonth = parseInt(month) === new Date().getMonth();
                  const monthName = monthNames[month];
                  
                  // Determine gradient based on count
                  let gradientClass = 'bg-gradient-to-r from-gray-400 to-gray-500';
                  if (count >= 5) gradientClass = 'bg-gradient-to-r from-orange-500 to-pink-500';
                  else if (count >= 3) gradientClass = 'bg-gradient-to-r from-blue-500 to-purple-500';
                  else if (count >= 1) gradientClass = 'bg-gradient-to-r from-gray-500 to-gray-700';
                  
                  return (
                    <div key={month} className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className={`w-16 text-sm font-bold ${isCurrentMonth ? 'text-orange-600' : 'text-gray-700'}`}>
                        {monthName}
                        {isCurrentMonth && <span className="text-orange-500 ml-1">●</span>}
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`absolute top-0 left-0 h-full rounded-full ${gradientClass}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${count > 0 ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;