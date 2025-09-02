import React from 'react';
import { FaFileContract, FaGavel, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaUserTie } from 'react-icons/fa';

const Terms = () => {
  const termsSections = [
    {
      icon: <FaFileContract />,
      title: 'Acceptance of Terms',
      content: 'By accessing and using this digital voting platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
      icon: <FaGavel />,
      title: 'Legal Compliance',
      content: 'Users must comply with all applicable laws and regulations while using this platform. Any illegal activities, including voter fraud, identity theft, or manipulation of voting results, will result in immediate account termination and legal action.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Security Requirements',
      content: 'Users are responsible for maintaining the security of their account credentials. Sharing passwords, allowing unauthorized access, or attempting to breach platform security will result in account suspension and potential legal consequences.'
    },
    {
      icon: <FaExclamationTriangle />,
      title: 'Prohibited Activities',
      content: 'Users are prohibited from attempting to manipulate voting results, creating fake accounts, spreading misinformation, or engaging in any activities that could compromise the integrity of the electoral process.'
    },
    {
      icon: <FaCheckCircle />,
      title: 'User Responsibilities',
      content: 'Users must provide accurate information during registration, maintain the confidentiality of their account, report any suspicious activities, and ensure their voting activities comply with electoral laws and regulations.'
    },
    {
      icon: <FaUserTie />,
      title: 'Government Authority',
      content: 'This platform operates under the authority of the Election Commission of India. All decisions regarding user accounts, voting processes, and platform operations are subject to government oversight and electoral laws.'
    }
  ];

  const userRights = [
    'Access to secure digital voting facilities',
    'Protection of personal information under privacy laws',
    'Transparent and auditable voting process',
    'Right to report technical issues or concerns',
    'Access to voting history and confirmation records',
    'Support for accessibility needs and accommodations'
  ];

  const userObligations = [
    'Provide accurate and truthful information during registration',
    'Maintain the security and confidentiality of account credentials',
    'Comply with all applicable electoral laws and regulations',
    'Report any suspicious activities or security concerns',
    'Use the platform only for legitimate voting purposes',
    'Respect the integrity of the electoral process'
  ];

  const prohibitedActions = [
    'Creating multiple accounts or fake identities',
    'Attempting to manipulate or influence voting results',
    'Sharing account credentials with others',
    'Using automated tools or bots to access the platform',
    'Spreading misinformation about candidates or elections',
    'Attempting to breach platform security measures',
    'Engaging in any form of voter intimidation or coercion',
    'Using the platform for commercial or political campaigning'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaFileContract className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Terms of <span className="text-orange-600">Service</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            These terms govern your use of our digital voting platform. By using this service, 
            you agree to comply with these terms and all applicable laws and regulations.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-xl p-8 mb-16 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <FaExclamationTriangle className="text-2xl" />
            <h2 className="text-2xl font-bold">Important Notice</h2>
          </div>
          <p className="text-lg text-red-100">
            This digital voting platform is an official government service operated under the authority of the 
            Election Commission of India. Any violation of these terms may result in legal consequences, 
            including criminal charges for electoral fraud or identity theft.
          </p>
        </div>

        {/* Terms Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Key Terms and Conditions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {termsSections.map((section, index) => (
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

        {/* User Rights and Obligations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* User Rights */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaCheckCircle className="text-green-500 mr-3" />
              Your Rights
            </h2>
            <div className="space-y-3">
              {userRights.map((right, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{right}</p>
                </div>
              ))}
            </div>
          </div>

          {/* User Obligations */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaUserTie className="text-blue-500 mr-3" />
              Your Obligations
            </h2>
            <div className="space-y-3">
              {userObligations.map((obligation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{obligation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prohibited Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Strictly Prohibited Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prohibitedActions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✗</span>
                </div>
                <p className="text-red-700 dark:text-red-200 font-medium">{action}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-red-100 dark:bg-red-800 rounded-lg border border-red-300 dark:border-red-600">
            <p className="text-red-800 dark:text-red-200 text-center font-semibold">
              ⚠️ Violation of any of these prohibitions will result in immediate account termination, 
              potential legal action, and reporting to relevant authorities.
            </p>
          </div>
        </div>

        {/* Legal Information */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 mb-16 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Legal Framework</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Governing Laws</h3>
              <ul className="space-y-2 text-blue-100">
                <li>• Representation of the People Act, 1951</li>
                <li>• Information Technology Act, 2000</li>
                <li>• Election Commission Guidelines</li>
                <li>• Data Protection Regulations</li>
                <li>• Cyber Security Framework</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Jurisdiction</h3>
              <ul className="space-y-2 text-blue-100">
                <li>• Courts in New Delhi, India</li>
                <li>• Election Commission of India</li>
                <li>• Cyber Crime Units</li>
                <li>• Data Protection Authority</li>
                <li>• Law Enforcement Agencies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Account Termination */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Account Termination and Consequences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Grounds for Termination</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Violation of terms of service</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Suspicious or fraudulent activity</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Multiple account violations</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Legal requirements or court orders</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Consequences</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Immediate account suspension</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Permanent ban from platform</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Legal action and prosecution</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Reporting to authorities</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Questions About These Terms?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you have any questions about these terms of service or need clarification on any provision, 
            please contact our legal department:
          </p>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Email:</strong> legal@votingapp.gov.in</p>
            <p><strong>Phone:</strong> +91 1800-XXX-XXXX</p>
            <p><strong>Address:</strong> Legal Department, Election Commission of India, New Delhi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
