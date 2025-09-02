import React, { useState } from 'react';
import { Link } from 'react-router-dom';  //, useNavigate
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaSun, 
  FaMoon, 
  FaBars, 
  FaTimes, 
  FaUser, 
  FaSignOutAlt,
  FaHome,
  FaClipboardList,
  FaUserEdit
} from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  // const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <FaHome /> },
    { name: 'Register', path: '/register', icon: <FaUserEdit />, showWhen: !isAuthenticated },
    { name: 'Login', path: '/login', icon: <FaClipboardList />, showWhen: !isAuthenticated },
  ];

  const authenticatedLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaClipboardList /> },
    { name: 'Profile', path: '/profile', icon: <FaUser /> },
  ];



  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🏛️</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                DigiVote
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => 
              link.showWhen !== false && (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              )
            )}
            
            {isAuthenticated && authenticatedLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            )}

          </div>

          {/* Right side - Theme toggle and user menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {isAuthenticated && (
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => 
              link.showWhen !== false && (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              )
            )}
            
            {isAuthenticated && authenticatedLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMobileMenu}
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            


            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-3"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
