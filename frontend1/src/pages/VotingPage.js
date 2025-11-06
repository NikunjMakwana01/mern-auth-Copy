import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaUser, FaFlag } from 'react-icons/fa';

const VotingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { election, candidates } = location.state || {};
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!election || !candidates || candidates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">No election or candidates found</p>
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

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate to vote');
      return;
    }

    setConfirming(true);
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to vote for ${selectedCandidate.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      setConfirming(false);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/voting/cast-vote', {
        electionId: election._id,
        candidateId: selectedCandidate._id
      });

      if (response.data.success) {
        toast.success('Your vote has been cast successfully!', { id: 'cast-vote-success' });
        navigate('/vote-success', {
          state: {
            election: election,
            candidate: selectedCandidate
          }
        });
      } else {
        throw new Error(response.data.message || 'Failed to cast vote');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to cast vote';
      toast.error(message, { id: 'cast-vote-error' });
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cast Your Vote</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {election.title} • {election.type} • {election.level}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select a Candidate
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Please carefully review each candidate before making your selection. You can only vote once.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate._id}
                onClick={() => setSelectedCandidate(candidate)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCandidate?._id === candidate._id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-700'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {selectedCandidate?._id === candidate._id ? (
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-gray-500 dark:text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {candidate.name}
                      </h3>
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <FaFlag className="text-gray-500 dark:text-gray-400 text-sm" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {candidate.partyName}
                      </p>
                    </div>
                    {candidate.village && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {candidate.village}
                      </p>
                    )}
                    {candidate.candidatePhoto && (
                      <div className="mt-3">
                        <img
                          src={candidate.candidatePhoto}
                          alt={candidate.name}
                          className="w-20 h-20 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Important:</strong> Once you submit your vote, it cannot be changed. Please review your selection carefully before confirming.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/vote-now')}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleVote}
            disabled={!selectedCandidate || loading || confirming}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Casting Vote...' : confirming ? 'Please Confirm...' : 'Cast Vote'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;

