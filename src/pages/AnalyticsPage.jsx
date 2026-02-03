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
  Gift
} from 'lucide-react';

const AnalyticsPage = ({ birthdays, isLoading }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [timeRange, setTimeRange] = useState('all');

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
      </div>
    );
  }

  // Calculate comprehensive stats
  const calculateStats = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    let filteredBirthdays = birthdays;
    
    // Apply time range filter
    if (timeRange === 'year') {
      filteredBirthdays = birthdays.filter(b => {
        const birthDate = new Date(b.date);
        return birthDate.getFullYear() === currentYear;
      });
    } else if (timeRange === 'month') {
      filteredBirthdays = birthdays.filter(b => {
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
      return daysUntil <= 30;
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
    const ages = filteredBirthdays.map(b => b.age || 0).filter(age => age > 0);
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

    // Birthdays by zodiac sign
    const zodiacSigns = {
      'Aquarius': [1, 20, 2, 18],
      'Pisces': [2, 19, 3, 20],
      'Aries': [3, 21, 4, 19],
      'Taurus': [4, 20, 5, 20],
      'Gemini': [5, 21, 6, 20],
      'Cancer': [6, 21, 7, 22],
      'Leo': [7, 23, 8, 22],
      'Virgo': [8, 23, 9, 22],
      'Libra': [9, 23, 10, 22],
      'Scorpio': [10, 23, 11, 21],
      'Sagittarius': [11, 22, 12, 21],
      'Capricorn': [12, 22, 1, 19]
    };

    const birthdaysByZodiac = filteredBirthdays.reduce((acc, birthday) => {
      const date = new Date(birthday.date);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      for (const [sign, [startMonth, startDay, endMonth, endDay]] of Object.entries(zodiacSigns)) {
        if (
          (month === startMonth && day >= startDay) ||
          (month === endMonth && day <= endDay)
        ) {
          acc[sign] = (acc[sign] || 0) + 1;
          break;
        }
      }
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

    // Peak birthday month
    const peakMonth = Object.entries(birthdaysByMonth).length > 0
      ? Object.entries(birthdaysByMonth).reduce((a, b) => a[1] > b[1] ? a : b)
      : null;

    return {
      totalBirthdays,
      upcomingBirthdays: upcomingBirthdays.length,
      recentBirthdays: recentBirthdays.length,
      averageAge,
      maxAge,
      minAge,
      birthdaysByMonth,
      birthdaysByZodiac,
      nextWeekBirthdays,
      peakMonth,
      filteredBirthdays
    };
  }, [birthdays, timeRange]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];

  const stats = calculateStats;

  const exportData = () => {
    const dataStr = JSON.stringify(stats.filteredBirthdays, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `birthday-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (stats.totalBirthdays === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <BarChart3 className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
            No Analytics Data Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Add some birthdays to unlock detailed analytics, insights, and visualizations.
          </p>
          <button 
            onClick={() => window.location.hash = '#/add'}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Add Your First Birthday
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Birthday Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Insights and statistics from your birthday collection
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border dark:border-gray-700">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="all">All Time</option>
              <option value="year">This Year</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Birthdays</h3>
          <p className="text-3xl font-bold">{stats.totalBirthdays}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 opacity-80" />
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Upcoming (30 days)</h3>
          <p className="text-3xl font-bold">{stats.upcomingBirthdays}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Cake className="w-8 h-8 opacity-80" />
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Average Age</h3>
          <p className="text-3xl font-bold">{stats.averageAge}</p>
          <p className="text-sm opacity-80 mt-2">
            Range: {stats.minAge} - {stats.maxAge}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Gift className="w-8 h-8 opacity-80" />
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Next Week</h3>
          <p className="text-3xl font-bold">{stats.nextWeekBirthdays.length}</p>
          <p className="text-sm opacity-80 mt-2">Birthdays to celebrate</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Birthdays by Month */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Birthdays by Month
            </h3>
            {stats.peakMonth && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                Peak: {monthNames[stats.peakMonth[0]]}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {Object.entries(stats.birthdaysByMonth).map(([month, count]) => {
              const percentage = (count / Math.max(...Object.values(stats.birthdaysByMonth))) * 100;
              const isCurrentMonth = parseInt(month) === new Date().getMonth();
              
              return (
                <div key={month} className="flex items-center">
                  <div className={`w-32 font-medium ${isCurrentMonth ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {monthNames[month]}
                    {isCurrentMonth && <span className="ml-2 text-xs">(current)</span>}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                          isCurrentMonth 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({Math.round((count / stats.totalBirthdays) * 100)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zodiac Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Zodiac Sign Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(stats.birthdaysByZodiac)
              .sort(([,a], [,b]) => b - a)
              .map(([sign, count]) => (
                <div 
                  key={sign} 
                  className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{sign}</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                      style={{ width: `${(count / Math.max(...Object.values(stats.birthdaysByZodiac))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent & Upcoming Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Birthdays */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Upcoming Birthdays (Next 7 days)
          </h3>
          <div className="space-y-4">
            {stats.nextWeekBirthdays.length > 0 ? (
              stats.nextWeekBirthdays.slice(0, 5).map((birthday, index) => {
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
                
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                        <Cake className="w-6 h-6 text-green-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{birthday.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        until birthday
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No birthdays in the next 7 days
              </p>
            )}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Age Distribution Summary
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.minAge}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Youngest</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.averageAge}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Average Age</div>
              </div>
              <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.maxAge}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Oldest</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Age Range Distribution</span>
                <span className="font-medium">{stats.filteredBirthdays.length} people</span>
              </div>
              
              {/* Simplified age distribution visualization */}
              {(() => {
                const ageGroups = {
                  '0-18': stats.filteredBirthdays.filter(b => b.age <= 18).length,
                  '19-30': stats.filteredBirthdays.filter(b => b.age > 18 && b.age <= 30).length,
                  '31-50': stats.filteredBirthdays.filter(b => b.age > 30 && b.age <= 50).length,
                  '51+': stats.filteredBirthdays.filter(b => b.age > 50).length,
                };
                
                return (
                  <div className="space-y-2">
                    {Object.entries(ageGroups).map(([range, count]) => {
                      const percentage = stats.totalBirthdays > 0 
                        ? (count / stats.totalBirthdays) * 100 
                        : 0;
                      
                      return (
                        <div key={range} className="flex items-center">
                          <span className="w-16 text-sm text-gray-600 dark:text-gray-300">{range}</span>
                          <div className="flex-1 mx-2">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="w-12 text-right text-sm font-medium">
                            {count} ({Math.round(percentage)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Fun Facts Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-100 dark:border-purple-900/30">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Fun Facts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Most Common Month</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.peakMonth ? monthNames[stats.peakMonth[0]] : 'N/A'} 
              {stats.peakMonth && ` (${stats.peakMonth[1]} birthdays)`}
            </div>
          </div>
          
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Recent Celebrations</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.recentBirthdays} in last 30 days
            </div>
          </div>
          
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Data Coverage</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Object.keys(stats.birthdaysByMonth).length}/12 months
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;