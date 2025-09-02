import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaLock,
  FaUserCheck
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
  ];

  const services = [
    { name: 'Voter Registration', path: '/register' },
    { name: 'Digital Voting', path: '/dashboard' },
    { name: 'Help & Support', path: '/support' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: <FaFacebook />, url: '#' },
    { name: 'Twitter', icon: <FaTwitter />, url: '#' },
    { name: 'YouTube', icon: <FaYoutube />, url: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">🏛️</span>
              </div>
              <span className="text-xl font-bold">Voting App</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Secure Digital Voting Platform built with cutting-edge technology to ensure transparent, 
              secure, and accessible voting for all citizens.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.path}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaPhone className="text-orange-400 w-4 h-4" />
                <span className="text-gray-300 text-sm">+91 1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-orange-400 w-4 h-4" />
                <span className="text-gray-300 text-sm">support@votingapp.gov.in</span>
              </div>
              <div className="flex items-center space-x-4">
                <FaMapMarkerAlt className="text-orange-400 w-4 h-4" />
                <span className="text-gray-300 text-sm">New Delhi, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <FaShieldAlt className="text-green-400 w-4 h-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <FaLock className="text-blue-400 w-4 h-4" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <FaUserCheck className="text-purple-400 w-4 h-4" />
                <span>Identity Verified</span>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              © {currentYear} DigiVote. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Government Notice */}
      <div className="bg-orange-600 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white text-sm font-medium">
            🏛️ Official Government Digital Voting Platform | Secure • Transparent • Accessible
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
