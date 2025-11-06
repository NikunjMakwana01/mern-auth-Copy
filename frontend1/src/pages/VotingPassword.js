import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaKey } from 'react-icons/fa';

const VotingPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const election = location.state?.election;
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    electionCardNumber: '',
    votingPassword: ''
  });
  const [loading, setLoading] = useState(false);

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">No election selected</p>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = user?.email;
      const response = await api.post('/api/voting/verify-credentials', {
        email,
        electionCardNumber: formData.electionCardNumber.toUpperCase(),
        votingPassword: formData.votingPassword,
        electionId: election._id
      });

      if (response.data.success) {
        toast.success('Credentials verified successfully');
        navigate('/voting-page', {
          state: {
            election: response.data.data.election,
            candidates: response.data.data.candidates
          }
        });
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Verification failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center mb-4">
              <FaKey className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Voting Password</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Use your election card number and emailed password</p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Election:</strong> {election.title}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {election.type} • {election.level}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Election Card Number
              </label>
              <input
                type="text"
                value={formData.electionCardNumber}
                onChange={(e) => setFormData({ ...formData, electionCardNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                required
                maxLength={10}
                pattern="[A-Z]{3}[0-9]{7}"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white uppercase"
                placeholder="NNI1234567"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format: 3 letters (A-Z) + 7 digits (0-9)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voting Password
              </label>
              <input
                type="password"
                value={formData.votingPassword}
                onChange={(e) => setFormData({ ...formData, votingPassword: e.target.value })}
                required
                maxLength={8}
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter 8-character password"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/vote-now')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VotingPassword;


