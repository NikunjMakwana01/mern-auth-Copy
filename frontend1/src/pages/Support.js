import React, { useState } from 'react';
import { FaHeadset, FaBook, FaVideo, FaComments, FaTicketAlt, FaSearch, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const supportCategories = [
    {
      id: 'registration',
      name: 'Voter Registration',
      icon: <FaBook />,
      color: 'from-blue-500 to-blue-600',
      articles: [
        'How to register as a new voter',
        'Updating voter information',
        'Document requirements for registration',
        'Registration verification process',
        'Common registration issues'
      ]
    },
    {
      id: 'voting',
      name: 'Digital Voting',
      icon: <FaVideo />,
      color: 'from-green-500 to-green-600',
      articles: [
        'How to cast your vote online',
        'Voting security measures',
        'Vote verification process',
        'Troubleshooting voting issues',
        'Voting from different devices'
      ]
    },
    {
      id: 'account',
      name: 'Account Management',
      icon: <FaComments />,
      color: 'from-purple-500 to-purple-600',
      articles: [
        'Resetting your password',
        'Updating profile information',
        'Account security settings',
        'Two-factor authentication',
        'Account recovery process'
      ]
    },
    {
      id: 'technical',
      name: 'Technical Support',
      icon: <FaHeadset />,
      color: 'from-orange-500 to-orange-600',
      articles: [
        'Browser compatibility issues',
        'Mobile app troubleshooting',
        'Network connectivity problems',
        'Performance optimization',
        'Error message explanations'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I know if my vote was counted?',
      answer: 'After casting your vote, you will receive a unique confirmation number. You can use this number to verify your vote was recorded in our secure system. Additionally, you can check your voting history in your account dashboard.'
    },
    {
      question: 'What if I forget my password?',
      answer: 'You can reset your password using the "Forgot Password" link on the login page. A reset link will be sent to your registered email address. Make sure to use a strong password and enable two-factor authentication for added security.'
    },
    {
      question: 'Is online voting really secure?',
      answer: 'Yes, our platform uses state-of-the-art encryption and security measures. We implement 256-bit SSL encryption, multi-factor authentication, and comprehensive audit trails. All data is stored securely and access is strictly controlled.'
    },
    {
      question: 'Can I vote from my mobile device?',
      answer: 'Absolutely! Our platform is fully responsive and works on all devices including smartphones and tablets. We also have a dedicated mobile app available for download from the App Store and Google Play Store.'
    },
    {
      question: 'What documents do I need for registration?',
      answer: 'You will need a valid government-issued ID (Aadhaar, PAN, Voter ID, or Passport), proof of address, and a recent photograph. All documents must be current and valid at the time of registration.'
    },
    {
      question: 'How long does registration take?',
      answer: 'The registration process typically takes 5-10 minutes to complete. However, verification and approval may take 24-48 hours. You will receive an email notification once your account is activated.'
    }
  ];

  const contactMethods = [
    {
      icon: <FaPhone />,
      title: '24/7 Helpline',
      details: ['+91 1800-XXX-XXXX', 'Available round the clock'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <FaEnvelope />,
      title: 'Email Support',
      details: ['support@votingapp.gov.in', 'Response within 4 hours'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <FaClock />,
      title: 'Live Chat',
      details: ['Available 9 AM - 6 PM', 'Instant responses'],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const filteredCategories = selectedCategory === 'all' 
    ? supportCategories 
    : supportCategories.filter(cat => cat.id === selectedCategory);

  const filteredArticles = filteredCategories.flatMap(cat => 
    cat.articles.map(article => ({ ...cat, article }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaHeadset className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Help & <span className="text-orange-600">Support</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Need help with our digital voting platform? Find answers to common questions, 
            browse helpful articles, or get in touch with our support team.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
              How can we help you today?
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white text-lg"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700'
              }`}
            >
              All Categories
            </button>
            {supportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Help Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredArticles.map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center text-white text-xl mb-4`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {item.article}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Learn how to {item.article.toLowerCase()} with step-by-step instructions.
              </p>
              <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                Read Article →
              </button>
            </div>
          ))}
        </div>

        {/* Contact Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white text-2xl">{method.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{method.title}</h3>
                <div className="space-y-2">
                  {method.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 dark:text-gray-400">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Ticket */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTicketAlt className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-orange-100 text-lg mb-6">
              Can't find what you're looking for? Create a support ticket and our team will get back to you within 4 hours.
            </p>
            <button className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors duration-200">
              Create Support Ticket
            </button>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 bg-gray-50 dark:bg-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Additional Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaBook className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Manual</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Comprehensive guide to all features</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaVideo className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Video Tutorials</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Step-by-step video guides</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaComments className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community Forum</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Connect with other users</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FaHeadset className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Training</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Attend online training sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
