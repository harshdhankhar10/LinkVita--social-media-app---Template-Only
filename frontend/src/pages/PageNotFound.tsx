import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiCompass, FiMail } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white shadow px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">LinkVita</span>
          </Link>
          <Link 
            to="/login" 
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur opacity-75"></div>
            <div className="relative bg-white rounded-full p-8 inline-flex items-center justify-center">
              <svg 
                className="h-24 w-24 text-purple-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link 
              to="/"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <FiHome className="h-6 w-6 text-purple-500 mb-2" />
              <span className="font-medium text-gray-700">Home</span>
              <span className="text-sm text-gray-500">Return to homepage</span>
            </Link>
            
            <Link 
              to="/explore"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <FiCompass className="h-6 w-6 text-pink-500 mb-2" />
              <span className="font-medium text-gray-700">Explore</span>
              <span className="text-sm text-gray-500">Discover new content</span>
            </Link>
            
            <Link 
              to="/contact"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <FiMail className="h-6 w-6 text-blue-500 mb-2" />
              <span className="font-medium text-gray-700">Contact</span>
              <span className="text-sm text-gray-500">Get in touch with us</span>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-medium text-gray-700 mb-3">Still need help?</h3>
            <p className="text-gray-600 mb-4">
              If you believe this is an error, please contact our support team.
            </p>
            <Link 
              to="/contact"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <FiMail className="mr-2" />
              Contact Support
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="bg-white py-4 mt-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} LinkVita. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;