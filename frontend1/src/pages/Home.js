import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaVoteYea, 
  FaShieldAlt, 
  FaMobileAlt, 
  FaClock, 
  FaUsers, 
  FaChartLine,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: 'Secure & Encrypted',
      description: 'Military-grade encryption ensures your vote remains confidential and tamper-proof.'
    },
    {
      icon: <FaMobileAlt className="w-8 h-8" />,
      title: 'Mobile Friendly',
      description: 'Vote from anywhere using any device with our responsive design.'
    },
    {
      icon: <FaClock className="w-8 h-8" />,
      title: '24/7 Access',
      description: 'Round-the-clock availability for voter registration and information.'
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: 'User Friendly',
      description: 'Simple and intuitive interface designed for all age groups.'
    }
  ];

  const stats = [
    { number: '10M+', label: 'Registered Users' },
    { number: '99.9%', label: 'Uptime' },
    { number: '256-bit', label: 'Encryption' },
    { number: '24/7', label: 'Support' }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Register',
      description: 'Create your account with valid government ID and email verification.'
    },
    {
      step: '02',
      title: 'Verify',
      description: 'Complete email OTP verification to activate your account.'
    },
    {
      step: '03',
      title: 'Access',
      description: 'Securely access your account and manage your profile from anywhere in the world.'
    },
    {
      step: '04',
      title: 'Manage',
      description: 'Monitor your account activity and manage your security settings.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaVoteYea className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Secure Authentication Platform
              </h1>
              <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto">
                Experience the future of secure authentication with our robust, transparent, and accessible platform.
                Built with cutting-edge technology to ensure your data is protected.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Get Started</span>
                    <FaArrowRight />
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-orange-600 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <FaArrowRight />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform combines security, accessibility, and transparency to revolutionize the authentication experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-all duration-200"
              >
                <div className="text-orange-500 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-orange-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Millions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our platform has successfully provided secure authentication services to users worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Getting started with our platform is simple and straightforward. Follow these easy steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join millions of users who have already embraced the future of secure authentication. 
            Your security matters, and we're here to protect it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Register Now</span>
                  <FaArrowRight />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-orange-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-50 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <FaArrowRight />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Security & Compliance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We take security seriously. Our platform meets the highest standards of data protection and privacy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-green-500 mb-4 flex justify-center">
                <FaCheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                ISO 27001 Certified
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                International standard for information security management systems.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-blue-500 mb-4 flex justify-center">
                <FaShieldAlt className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                End-to-End Encryption
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is encrypted at rest and in transit using industry-standard protocols.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-purple-500 mb-4 flex justify-center">
                <FaChartLine className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Real-Time Monitoring
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Continuous monitoring and auditing to ensure system integrity and performance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
