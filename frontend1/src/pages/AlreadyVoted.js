import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaUser, FaEye, FaLock, FaFlag } from 'react-icons/fa';

const AlreadyVoted = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const election = location.state?.election;
  const [voteInfo, setVoteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    if (election) {
      checkVoteStatus();
    }
  }, [election]);

  const checkVoteStatus = async () => {
    if (!election) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/voting/check-status/${election._id}`);
      if (response.data.success && response.data.data.hasVoted) {
        const meta = response.data.data.vote;
        // Only store view metadata here; do NOT reveal candidate details until user clicks view
        setVoteInfo({ viewCount: meta.viewCount });
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVote = async () => {
    if (!election) return;
    
    setViewLoading(true);
    try {
      const response = await api.post(`/api/voting/view-vote/${election._id}`);
      if (response.data.success) {
        setVoteInfo(response.data.data);
        toast.success('Vote information retrieved');
      } else {
        throw new Error(response.data.message || 'Failed to view vote');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to view vote';
      toast.error(message);
    } finally {
      setViewLoading(false);
    }
  };

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">No election found</p>
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

  const canViewVote = voteInfo && voteInfo.viewCount < 2;
  const remainingViews = voteInfo ? (2 - voteInfo.viewCount) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
              <FaCheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              You Have Already Voted
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {election.title} • {election.type}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You have already cast your vote in this election. Thank you for participating!
            </p>
          </div>

          {(!voteInfo || (voteInfo.viewCount !== undefined && voteInfo.viewCount < 2)) && (
            <div className="text-center mb-6">
              <button
                onClick={handleViewVote}
                disabled={viewLoading || loading || (voteInfo && voteInfo.viewCount >= 2)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                <FaEye className="w-5 h-5" />
                <span>{viewLoading ? 'Loading...' : 'View Your Vote'}</span>
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You can view your vote up to 2 times
              </p>
            </div>
          )}

          {voteInfo && (voteInfo.candidate || voteInfo.candidateName) && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Vote
                </h2>
                {voteInfo.viewCount !== undefined && voteInfo.viewCount < 2 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Views remaining: {remainingViews}
                  </span>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-500">
                <div className="flex items-center space-x-4">
                  {(voteInfo.candidate?.candidatePhoto || voteInfo.candidatePhoto) && (
                    <img
                      src={voteInfo.candidate?.candidatePhoto || voteInfo.candidatePhoto}
                      alt={voteInfo.candidate?.name || voteInfo.candidateName}
                      className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <FaUser className="text-gray-500 dark:text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {voteInfo.candidate?.name || voteInfo.candidateName}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaFlag className="text-gray-500 dark:text-gray-400 text-sm" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {voteInfo.candidate?.partyName || voteInfo.partyName}
                      </p>
                    </div>
                    {(voteInfo.candidate?.village || voteInfo.village) && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {voteInfo.candidate?.village || voteInfo.village}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {voteInfo.viewCount !== undefined && voteInfo.viewCount >= 2 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaLock className="text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You have reached the maximum number of views (2). This button is now disabled.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate('/vote-now')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Return to Elections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlreadyVoted;

