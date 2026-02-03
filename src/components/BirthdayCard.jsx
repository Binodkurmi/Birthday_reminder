import React, { useState, useEffect, useMemo } from 'react';
import { FaBirthdayCake, FaComment, FaPhone, FaGift } from "react-icons/fa";

const BirthdayCard = ({
  birthday,
  onEdit,
  onDelete,
  showActions = false,
  onRemind,
  imageBaseUrl = 'https://birthdarreminder.onrender.com'
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [timeUntil, setTimeUntil] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [retryImage, setRetryImage] = useState(false); // Add retry state

  // FIXED: Calculate image URL - ONLY use /api/uploads/ pattern
  const imageUrl = useMemo(() => {
    console.log(`🎯 Calculating image URL for: ${birthday.name}`);
    console.log(`📸 Image field in DB: "${birthday.image}"`);
    
    // If no image at all, return null
    if (!birthday.image) {
      console.log(`❌ ${birthday.name}: No image in database`);
      return null;
    }

    // If image is "null" or "undefined" string, return null
    if (typeof birthday.image === 'string' && 
        (birthday.image.toLowerCase() === 'null' || 
         birthday.image.toLowerCase() === 'undefined')) {
      console.log(`❌ ${birthday.name}: Image field is "${birthday.image}"`);
      return null;
    }

    // Extract just the filename (remove any path)
    const filename = birthday.image.split('/').pop();
    
    // FIXED: ALWAYS use /api/uploads/ pattern - this is what works
    const finalUrl = `${imageBaseUrl}/api/uploads/${filename}`;
    
    console.log(`✅ Final image URL: ${finalUrl}`);
    return finalUrl;
  }, [birthday, imageBaseUrl, retryImage]); // Include retryImage to trigger recalculation

  // Reset image error when imageUrl changes
  useEffect(() => {
    setIsImageError(false);
  }, [imageUrl]);

  // Calculate days until birthday
  const birthDate = useMemo(() => new Date(birthday.date), [birthday.date]);
  const today = useMemo(() => new Date(), []);

  const diffDays = useMemo(() => {
    const currentYear = today.getFullYear();
    const nextBirthday = new Date(birthDate);
    nextBirthday.setFullYear(currentYear);

    // If birthday already passed this year, use next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(currentYear + 1);
    }

    const diffTime = nextBirthday - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [birthDate, today]);

  // Calculate age for the next birthday
  const birthYear = new Date(birthday.date).getFullYear();
  const currentYear = today.getFullYear();
  const nextAge = currentYear - birthYear;
  const willTurnAge = diffDays >= 0 ? nextAge : nextAge + 1;

  // Calculate zodiac sign
  const getZodiacSign = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;

    const signs = [
      { sign: "♑ Capricorn (मकर)", start: [1, 1], end: [1, 19] },
      { sign: "♒ Aquarius (कुम्भ)", start: [1, 20], end: [2, 18] },
      { sign: "♓ Pisces (मीन)", start: [2, 19], end: [3, 20] },
      { sign: "♈ Aries (मेष)", start: [3, 21], end: [4, 19] },
      { sign: "♉ Taurus (वृषभ)", start: [4, 20], end: [5, 20] },
      { sign: "♊ Gemini (मिथुन)", start: [5, 21], end: [6, 20] },
      { sign: "♋ Cancer (कर्क)", start: [6, 21], end: [7, 22] },
      { sign: "♌ Leo (सिंह)", start: [7, 23], end: [8, 22] },
      { sign: "♍ Virgo (कन्या)", start: [8, 23], end: [9, 22] },
      { sign: "♎ Libra (तुला)", start: [9, 23], end: [10, 22] },
      { sign: "♏ Scorpio (वृश्चिक)", start: [10, 23], end: [11, 21] },
      { sign: "♐ Sagittarius (धनु)", start: [11, 22], end: [12, 21] },
      { sign: "♑ Capricorn (मकर)", start: [12, 22], end: [12, 31] }
    ];

    return signs.find(sign =>
      (month === sign.start[0] && day >= sign.start[1]) ||
      (month === sign.end[0] && day <= sign.end[1])
    )?.sign || "Unknown";
  };

  useEffect(() => {
    // Update time until countdown for birthdays today
    if (diffDays === 0) {
      const timer = setInterval(() => {
        const now = new Date();
        const hoursLeft = 23 - now.getHours();
        const minutesLeft = 59 - now.getMinutes();
        setTimeUntil(`${hoursLeft}h ${minutesLeft}m left`);
      }, 60000);

      // Initial calculation
      const now = new Date();
      const hoursLeft = 23 - now.getHours();
      const minutesLeft = 59 - now.getMinutes();
      setTimeUntil(`${hoursLeft}h ${minutesLeft}m left`);

      return () => clearInterval(timer);
    }
  }, [diffDays]);

  // FIXED: Improved image error handler
  const handleImageError = (e) => {
    console.error(`❌ Image failed to load for ${birthday.name}:`, {
      attemptedUrl: e.target.src,
      imageField: birthday.image,
      timestamp: new Date().toISOString()
    });
    
    setIsImageError(true);

    // If there's an error, retry with the correct URL pattern
    if (birthday.image) {
      const filename = birthday.image.split('/').pop();
      const correctUrl = `${imageBaseUrl}/api/uploads/${filename}`;
      
      console.log(`🔄 Retrying with correct URL: ${correctUrl}`);
      
      // If current URL is wrong, update it
      if (e.target.src !== correctUrl) {
        console.log(`🔁 Updating image source from ${e.target.src} to ${correctUrl}`);
        e.target.src = correctUrl;
        setRetryImage(prev => !prev); // Trigger re-render
      }
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully for ${birthday.name}: ${imageUrl}`);
    setIsImageError(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${birthday.name}'s birthday?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(birthday._id);
      }
    } catch (error) {
      console.error('Error deleting birthday:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(birthday);
    }
  };

  const handleRemind = () => {
    if (onRemind) {
      onRemind(birthday);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'message':
        console.log(`Would message ${birthday.name}`);
        break;
      case 'call':
        console.log(`Would call ${birthday.name}`);
        break;
      case 'gift':
        console.log(`Gift ideas for ${birthday.name}`);
        break;
      default:
        break;
    }
    setShowQuickActions(false);
  };

  const getDaysText = () => {
    if (diffDays === 0) return "Today! ";
    if (diffDays === 1) return "Tomorrow! ";
    if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} to go`;
  };

  const getStatusColor = () => {
    if (diffDays === 0) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (diffDays === 1) return 'bg-gradient-to-r from-orange-500 to-pink-500';
    if (diffDays < 7) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    return 'bg-gradient-to-r from-gray-500 to-gray-700';
  };

  const formatBirthdayDate = () => {
    return birthDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getAgeSuffix = () => {
    const age = willTurnAge;
    if (age % 10 === 1 && age % 100 !== 11) return 'st';
    if (age % 10 === 2 && age % 100 !== 12) return 'nd';
    if (age % 10 === 3 && age % 100 !== 13) return 'rd';
    return 'th';
  };

  return (
    <div
      className={`relative rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-100 ${isHovered ? 'ring-2 ring-purple-200' : ''
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${getStatusColor()}`}></div>

      {/* Header with image and basic info */}
      <div className="flex items-start mb-4">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
            {imageUrl && !isImageError ? (
              <img
                key={`${birthday._id}-${retryImage}`} // Force re-render on retry
                src={imageUrl}
                alt={birthday.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <FaBirthdayCake className="text-2xl text-purple-400" />
                <span className="text-[8px] text-gray-500 mt-1">
                  {isImageError ? 'Load failed' : 'No photo'}
                </span>
                {/* Retry button */}
                {isImageError && (
                  <button
                    onClick={() => {
                      console.log(`🔄 Manual retry for ${birthday.name}`);
                      setRetryImage(prev => !prev);
                    }}
                    className="text-[6px] mt-1 text-blue-500 hover:underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
          {diffDays <= 7 && (
            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${getStatusColor()}`}>
              {diffDays <= 0 ? '!' : diffDays}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg truncate">{birthday.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {formatBirthdayDate()}
            </span>
            {birthday.relationship && (
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {birthday.relationship}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Age and Zodiac info */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center bg-blue-50 rounded-lg p-2">
          <div className="text-xs text-blue-600 font-medium">Turning</div>
          <div className="text-sm font-bold text-blue-800">
            {willTurnAge}<sup>{getAgeSuffix()}</sup>
          </div>
        </div>
        <div className="text-center bg-purple-50 rounded-lg p-2">
          <div className="text-xs text-purple-600 font-medium">Zodiac</div>
          <div className="text-sm font-bold text-purple-800">
            {getZodiacSign(new Date(birthday.date))}
          </div>
        </div>
      </div>

      {/* Countdown section */}
      <div className={`text-center py-2 rounded-xl font-semibold text-white mb-3 ${getStatusColor()}`}>
        <div className="text-sm">{getDaysText()}</div>
        {diffDays === 0 && timeUntil && (
          <div className="text-xs opacity-90">{timeUntil}</div>
        )}
      </div>

      {/* Progress bar for upcoming birthdays */}
      {diffDays > 0 && diffDays < 60 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Coming up</span>
            <span>{diffDays}d left</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, 100 - (diffDays / 60) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-md"
              title="Edit birthday"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md"
                title="Quick actions"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>

              {showQuickActions && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleQuickAction('message')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md flex items-center"
                    >
                      <span className="mr-2">
                        <FaComment />
                      </span>
                      Send Message
                    </button>
                    <button
                      onClick={() => handleQuickAction('call')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-md flex items-center"
                    >
                      <span className="mr-2">
                        <FaPhone />
                      </span>
                      Make a Call
                    </button>
                    <button
                      onClick={() => handleQuickAction('gift')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-md flex items-center"
                    >
                      <span className="mr-2">
                        <FaGift />
                      </span>
                      Gift Ideas
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRemind}
              className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-md"
              title="Set reminder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
              title="Delete birthday"
            >
              {isDeleting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Social share button */}
        {diffDays <= 7 && (
          <button
            onClick={() => console.log(`Share ${birthday.name}'s birthday!`)}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            title="Share birthday"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}
      </div>

      {/* Notes preview */}
      {birthday.notes && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 line-clamp-2">
            {birthday.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default BirthdayCard;