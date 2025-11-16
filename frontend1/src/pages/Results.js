import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { FaVoteYea, FaCalendarAlt, FaUsers, FaTrophy, FaSpinner } from 'react-icons/fa';

const Results = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [electionDetails, setElectionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  const loadPublishedElections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use public endpoint filtered by user's location
      const qs = new URLSearchParams({
        state: user?.state || '',
        district: user?.district || '',
        taluka: user?.taluka || '',
        city: user?.city || ''
      });
      
      const res = await api.get(`/api/elections/published-list?${qs.toString()}`);
      const list = res.data?.data?.elections || [];
      
      // Sort: Published results first (by declared date, most recent first), then completed (by result declaration date), then upcoming (by result declaration date, earliest first)
      list.sort((a, b) => {
        const aPublished = a.results?.isDeclared;
        const bPublished = b.results?.isDeclared;
        const aCompleted = a.status === 'completed' && !aPublished;
        const bCompleted = b.status === 'completed' && !bPublished;
        
        // Published results come first
        if (aPublished && !bPublished) return -1;
        if (!aPublished && bPublished) return 1;
        
        // Both published - sort by declared date (most recent first)
        if (aPublished && bPublished) {
          const dateA = a.results?.declaredAt ? new Date(a.results.declaredAt) : new Date(0);
          const dateB = b.results?.declaredAt ? new Date(b.results.declaredAt) : new Date(0);
          return dateB - dateA;
        }
        
        // Completed (not published) come after published
        if (aCompleted && !bCompleted) return -1;
        if (!aCompleted && bCompleted) return 1;
        
        // Both completed or both upcoming - sort by result declaration date (earliest first)
        const dateA = a.resultDeclarationDate ? new Date(a.resultDeclarationDate) : new Date(0);
        const dateB = b.resultDeclarationDate ? new Date(b.resultDeclarationDate) : new Date(0);
        return dateA - dateB;
      });
      
      setElections(list);
    } catch (e) {
      console.error('Error loading results:', e);
      setError(e.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPublishedElections();
  }, [loadPublishedElections]);

  const loadElectionDetails = async (electionId) => {
    try {
      setLoadingDetails(true);
      // Find the election from the list to check if it's published
      const election = elections.find(e => e._id === electionId);
      
      if (election && election.results?.isDeclared) {
        // Election has published results
        const detail = await api.get(`/api/elections/${electionId}/results-public`);
        setElectionDetails(detail.data.data);
      } else {
        // Upcoming election - show placeholder with result declaration date
        setElectionDetails({
          election: election,
          candidates: [],
          isUpcoming: true
        });
      }
      setSelectedElection(electionId);
    } catch (e) {
      console.error('Error loading election details:', e);
      // If it's a 400 error (results not published), show upcoming message
      if (e.response?.status === 400) {
        const election = elections.find(e => e._id === electionId);
        setElectionDetails({
          election: election,
          candidates: [],
          isUpcoming: true
        });
        setSelectedElection(electionId);
      } else {
        alert(e.response?.data?.message || 'Failed to load election details');
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FaVoteYea className="text-orange-600 dark:text-orange-400" />
                Election Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View published election results for your area
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {elections.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <FaVoteYea className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Published Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              There are no published election results for your area yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Elections List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Published Elections ({elections.length})
                  </h2>
                </div>
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {elections.map((election) => (
                    <button
                      key={election._id}
                      onClick={() => loadElectionDetails(election._id)}
                      className={`w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedElection === election._id
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-l-orange-600'
                          : ''
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {election.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {election.type} • {election.level}
                      </div>
                      {election.results?.declaredAt ? (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                            Published
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                            <FaCalendarAlt />
                            <span>{formatDate(election.results.declaredAt)}</span>
                          </div>
                        </div>
                      ) : election.status === 'completed' && election.resultDeclarationDate ? (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded">
                            Completed
                          </span>
                          <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <FaCalendarAlt />
                            <span>Results on: {formatDate(election.resultDeclarationDate)}</span>
                          </div>
                        </div>
                      ) : election.resultDeclarationDate ? (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                            Upcoming
                          </span>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                            <FaCalendarAlt />
                            <span>Results on: {formatDate(election.resultDeclarationDate)}</span>
                          </div>
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Election Details */}
            <div className="lg:col-span-2">
              {loadingDetails ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <FaSpinner className="animate-spin text-4xl text-orange-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading election details...</p>
                </div>
              ) : electionDetails ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  {/* Election Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {electionDetails.election.title}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {electionDetails.election.villageStats && (
                        <>
                          <span className="flex items-center gap-1">
                            <FaUsers />
                            {electionDetails.election.villageStats.totalVoters} voters
                          </span>
                        </>
                      )}
                    </div>
                    {electionDetails.election.results?.declaredAt && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <FaCalendarAlt />
                        <span>Results Published: {formatDate(electionDetails.election.results.declaredAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Votes</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {electionDetails.election.totalVotesCast || 0}
                        </div>
                      </div>
                      {/* <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Turnout</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {electionDetails.election.turnoutPercentage || 0}%
                        </div>
                      </div> */}
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Candidates</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {electionDetails.candidates?.length || 0}
                        </div>
                      </div>
                      {electionDetails.election.villageStats && (
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Voted</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {electionDetails.election.villageStats.totalVoted || 0}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Candidates Results or Upcoming Message */}
                  <div className="p-6">
                    {electionDetails.isUpcoming ? (
                      <div className="text-center py-12">
                        <FaCalendarAlt className="text-6xl text-orange-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Results Coming Soon
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          The results for this election will be published on:
                        </p>
                        {electionDetails.election?.resultDeclarationDate && (
                          <div className="inline-block px-6 py-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {formatDate(electionDetails.election.resultDeclarationDate)}
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                          Please check back after the result declaration date.
                        </p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Candidate Results
                        </h3>
                        <div className="space-y-4">
                          {electionDetails.candidates && electionDetails.candidates.length > 0 ? (
                            electionDetails.candidates.map((candidate, idx) => (
                              <div
                                key={candidate.candidateId}
                                className={`p-4 rounded-lg border-2 ${
                                  idx === 0
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      {idx === 0 && (
                                        <FaTrophy className="text-yellow-500 text-xl" />
                                      )}
                                      <div>
                                        <div className="font-semibold text-lg text-gray-900 dark:text-white">
                                          {candidate.name}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                          {candidate.partyName || 'Independent'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {candidate.votes || 0}
                                    </div>
                                  </div>
                                </div>
                                {/* Vote Percentage Bar */}
                                <div className="mt-3">
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        idx === 0
                                          ? 'bg-green-500'
                                          : 'bg-orange-500'
                                      }`}
                                      style={{
                                        width: `${Math.min(candidate.votePercentage || 0, 100)}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                              No candidates found for this election.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <FaVoteYea className="text-6xl text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Select an Election
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose an election from the list to view detailed results.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;

