import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaUser, FaFlag } from 'react-icons/fa';

const VoteSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { election, candidate } = location.state || {};

  if (!election || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">No vote information found</p>
          <button
            onClick={() => navigate('/vote-now')}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-6">
            <FaCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your Vote Has Been Cast Successfully!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you for participating in the democratic process.
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Election: {election.title}
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-500">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">You voted for:</p>
              <div className="flex items-center justify-center space-x-3">
                {candidate.candidatePhoto && (
                  <img
                    src={candidate.candidatePhoto}
                    alt={candidate.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {candidate.partyName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/vote-now')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Return to Elections
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteSuccess;

