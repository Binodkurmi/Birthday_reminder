import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-3xl font-bold mt-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 space-x-4">
          <Link
            to="/home"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/birthdays"
            className="inline-block px-6 py-3 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
          >
            View Birthdays
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;