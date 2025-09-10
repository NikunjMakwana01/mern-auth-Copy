import React from 'react';
import { FaShieldAlt, FaLock, FaEye, FaDatabase, FaUserCheck, FaFileContract } from 'react-icons/fa';

const Privacy = () => {
  const privacySections = [
    {
      icon: <FaShieldAlt />,
      title: 'Data Collection',
      content: 'We collect only the information necessary for voter verification and authentication, including name, email, phone number, and government-issued ID details. This information is used solely for electoral purposes and is protected under strict security protocols.'
    },
    {
      icon: <FaLock />,
      title: 'Data Security',
      content: 'Your personal information is encrypted using industry-standard 256-bit encryption. We implement multiple layers of security including firewalls, intrusion detection systems, and regular security audits to protect your data from unauthorized access.'
    },
    {
      icon: <FaEye />,
      title: 'Data Usage',
      content: 'Your data is used exclusively for voter verification, authentication, and maintaining electoral records. We do not share, sell, or use your information for any commercial purposes. Access to your data is strictly limited to authorized election officials.'
    },
    {
      icon: <FaDatabase />,
      title: 'Data Storage',
      content: 'All data is stored on secure servers located within India, complying with local data protection laws. We maintain comprehensive audit logs of all data access and modifications to ensure transparency and accountability.'
    },
    {
      icon: <FaUserCheck />,
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. You can also request information about how your data is being used. All requests are processed within 30 days as per government regulations.'
    },
    {
      icon: <FaFileContract />,
      title: 'Legal Compliance',
      content: 'This platform operates under the guidelines of the Election Commission of India and complies with all applicable data protection laws, including the Information Technology Act, 2000 and related regulations.'
    }
  ];

  const dataTypes = [
    {
      category: 'Personal Information',
      examples: ['Full Name', 'Date of Birth', 'Address', 'Phone Number', 'Email Address'],
      purpose: 'Voter identification and verification'
    },
    {
      category: 'Identity Documents',
      examples: ['Voter ID'],
      purpose: 'Identity verification and authentication'
    },
    {
      category: 'Voting Records',
      examples: ['Voting History', 'Polling Station', 'Vote Timestamp', 'Confirmation Numbers'],
      purpose: 'Maintaining electoral records and audit trails'
    },
    {
      category: 'Technical Data',
      examples: ['IP Address', 'Device Information', 'Login Timestamps', 'Session Data'],
      purpose: 'Security monitoring and fraud prevention'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShieldAlt className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Privacy <span className="text-orange-600">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your privacy and data security are our top priorities. This policy explains how we collect, 
            use, and protect your personal information on our digital voting platform.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Privacy Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Our Commitment to Privacy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {privacySections.map((section, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl mb-4">
                  {section.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {section.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Collection Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            What Data We Collect
          </h2>
          <div className="space-y-8">
            {dataTypes.map((dataType, index) => (
              <div key={index} className="border-l-4 border-orange-500 pl-6 py-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {dataType.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Examples:</h4>
                    <ul className="space-y-1">
                      {dataType.examples.map((example, idx) => (
                        <li key={idx} className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Purpose:</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{dataType.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Data Retention and Deletion
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Retention Periods</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Voter Registration Data</span>
                  <span className="text-orange-600 font-medium">10 Years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Voting Records</span>
                  <span className="text-orange-600 font-medium">Permanent</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Technical Logs</span>
                  <span className="text-orange-600 font-medium">2 Years</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 dark:text-gray-300">Session Data</span>
                  <span className="text-orange-600 font-medium">30 Days</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Request access to your personal data</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Correct inaccurate information</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Request deletion of your data</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Object to data processing</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Questions About Your Privacy?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have any questions about this privacy policy or how we handle your data, 
            please contact our Data Protection Officer:
          </p>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> privacy@votingapp.ac.in</p>
            <p><strong>Phone:</strong> +91 1800-180-1800</p>
            <p><strong>Address:</strong> Ganpat University - U.V Patel College of Engineering, Mehsana - 384012, Gujarat</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
