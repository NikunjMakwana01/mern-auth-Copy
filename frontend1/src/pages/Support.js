import React, { useState } from 'react';
import { FaHeadset, FaBook, FaVideo, FaComments, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Support = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const supportCategories = [
    {
      id: 'registration',
      name: 'Voter Registration',
      icon: <FaBook />,
      color: 'from-blue-500 to-blue-600',
      articles: [
        'How to register as a new voter',
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
        'Vote verification process',
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
        'Updating profile information'
      ]
    },
  ];

  const faqs = [
    {
      question: 'How do I know if my vote was counted?',
      answer: 'After casting your vote,you can check your voting history in your account dashboard.'
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
      question: 'How long does registration take?',
      answer: 'The registration process typically takes 5-10 minutes to complete. However, verification and approval may take 24-48 hours. You will receive an email notification once your account is activated.'
    }
  ];

  const contactMethods = [
    {
      icon: <FaPhone />,
      title: '24/7 Helpline',
      details: ['+91 1800-180-1800'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <FaEnvelope />,
      title: 'Email Support',
      details: ['support@votingapp.ac.in', 'Response within 4 hours'],
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
