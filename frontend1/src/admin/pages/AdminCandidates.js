import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const AdminCandidatesPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [availableElections, setAvailableElections] = useState([]);
  const [selectedCandidateForAssignment, setSelectedCandidateForAssignment] = useState(null);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [loadingCandidateDetails, setLoadingCandidateDetails] = useState(false);
  const [viewingElectionDetails, setViewingElectionDetails] = useState(null);
  const [loadingElectionDetails, setLoadingElectionDetails] = useState(false);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        ...filters
      });
      const res = await api.get(`/api/candidates?${params}`);
      if (res.data?.success && res.data?.data?.candidates) {
        setCandidates(res.data.data.candidates);
        setPagination(res.data.data.pagination || {});
      } else {
        throw new Error('Invalid response format');
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setError('Session expired. Please login again.');
      } else {
        setError(e.response?.data?.message || 'Failed to load candidates');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    // Small delay to ensure AdminLayout auth is ready
    const timer = setTimeout(() => {
      loadCandidates();
      loadAvailableElections();
    }, 100);
    return () => clearTimeout(timer);
  }, [loadCandidates]);

  // Debounce search input updates to filters
  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!selectedCandidateForAssignment) return;
    
    const handleClickOutside = (event) => {
      const target = event.target;
      const isInsideDropdown = target.closest('[data-dropdown]');
      if (!isInsideDropdown) {
        setSelectedCandidateForAssignment(null);
        setSelectedElectionId('');
      }
    };
    
    // Use setTimeout to avoid immediate closing when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedCandidateForAssignment]);

  // Auto-hide error message after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadAvailableElections = async () => {
    try {
      const params = new URLSearchParams({
        page: 1,
        limit: 100,
        archived: 'false',
        status: 'upcoming' // Only show upcoming elections
      });
      const res = await api.get(`/api/elections?${params}`);
      // Filter to ensure only upcoming elections (in case API returns others)
      const upcomingOnly = (res.data.data.elections || []).filter(e => e.status === 'upcoming');
      setAvailableElections(upcomingOnly);
    } catch (e) {
      console.error('Failed to load elections:', e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) return;
    try {
      const response = await api.delete(`/api/candidates/${id}`);
      toast.success(response.data?.message || 'Candidate deleted successfully');
      loadCandidates();
    } catch (e) {
      const errorMessage = e.response?.data?.message || 'Failed to delete candidate';
      setError(errorMessage);
    }
  };

  const handleViewCandidate = async (candidateId) => {
    try {
      setLoadingCandidateDetails(true);
      const res = await api.get(`/api/candidates/${candidateId}`);
      const candidate = res.data.data.candidate;
      
      // If candidate has assigned elections, fetch full election details
      if (candidate.assignedElections && candidate.assignedElections.length > 0) {
        for (const assignedElection of candidate.assignedElections) {
          try {
            const electionRes = await api.get(`/api/elections/${assignedElection.electionId}`);
            assignedElection.fullDetails = electionRes.data.data.election;
          } catch (e) {
            console.error('Failed to load election details:', e);
          }
        }
      }
      
      setViewingCandidate(candidate);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load candidate details');
    } finally {
      setLoadingCandidateDetails(false);
    }
  };

  const handleRemoveElection = async (candidateId, electionId) => {
    if (!window.confirm('Are you sure you want to remove this candidate from the election?')) return;
    try {
      await api.delete(`/api/elections/${electionId}/candidates/${candidateId}`);
      toast.success('Candidate removed from election successfully');
      loadCandidates();
      if (viewingCandidate && viewingCandidate._id === candidateId) {
        handleViewCandidate(candidateId); // Refresh view
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to remove candidate from election');
    }
  };

  const handleViewElectionDetails = async (electionId) => {
    try {
      setLoadingElectionDetails(true);
      const res = await api.get(`/api/elections/${electionId}`);
      setViewingElectionDetails(res.data.data.election);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load election details');
    } finally {
      setLoadingElectionDetails(false);
    }
  };

  const handleAssignElection = async (candidateId) => {
    if (!selectedElectionId) {
      setError('Please select an election');
      return;
    }
    try {
      setAssigning(true);
      await api.post(`/api/elections/${selectedElectionId}/candidates`, {
        candidateId: candidateId
      });
      toast.success('Candidate assigned to election successfully');
      setSelectedCandidateForAssignment(null);
      setSelectedElectionId('');
      loadCandidates();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to assign candidate to election');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveElectionFromDropdown = async (candidateId, electionId) => {
    if (!window.confirm('Are you sure you want to remove this candidate from the election?')) return;
    try {
      // Verify status first to prevent removing non-upcoming elections
      const res = await api.get(`/api/elections/${electionId}`);
      const status = res?.data?.data?.election?.status;
      if (status !== 'upcoming') {
        setError('Only upcoming elections can be removed. Active or completed elections cannot be modified.');
        return;
      }
      await api.delete(`/api/elections/${electionId}/candidates/${candidateId}`);
      toast.success('Candidate removed from election successfully');
      setSelectedCandidateForAssignment(null);
      setSelectedElectionId('');
      loadCandidates();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to remove candidate from election');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center justify-between relative">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-700 hover:text-red-900 focus:outline-none flex-shrink-0"
            aria-label="Close error message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Candidates</h1>
        <button
          onClick={() => navigate('/admin/candidates/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Candidate
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, village, election card, etc..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => { setFilters({search: ''}); setSearchInput(''); }}
              className="w-50 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No candidates</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new candidate.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Party & Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assignment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {candidates.map((candidate) => (
                  <tr key={candidate._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${!candidate.isAssigned ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {candidate.candidatePhoto ? (
                          <div className="h-10 w-10 flex-shrink-0">
                            {candidate.candidatePhoto.startsWith('data:image/') ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={candidate.candidatePhoto}
                                alt={candidate.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              {candidate.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {candidate.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {candidate.contactNumber || 'No contact'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">{candidate.partyName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Election Card: {candidate.electionCardNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{candidate.village}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {[candidate.taluka, candidate.district, candidate.state].filter(Boolean).join(', ') || 'No location'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!candidate.isAssigned ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-full bg-orange-500 text-white animate-pulse shadow-lg">
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            NOT ASSIGNED
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Assigned ({candidate.assignedElectionsCount || 0})
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCandidate(candidate._id)}
                          className="px-3 py-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/candidates/edit/${candidate._id}`)}
                          className="px-3 py-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-300 dark:border-indigo-700 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                          Edit
                        </button>
                        <div className="relative" data-dropdown style={{ position: 'relative', zIndex: selectedCandidateForAssignment === candidate._id ? 1000 : 'auto' }}>
                          <button
                            onClick={() => setSelectedCandidateForAssignment(candidate._id)}
                            className="px-3 py-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 border border-green-300 dark:border-green-700 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            Assign Election
                          </button>
                          {selectedCandidateForAssignment === candidate._id && (
                            <div 
                              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700" 
                              data-dropdown
                              style={{ zIndex: 10000 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="p-4">
                                {candidate.assignedElections && candidate.assignedElections.length > 0 && (
                                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Current Assignments:</p>
                                    {candidate.assignedElections.map((ae, idx) => (
                                      <div key={idx} className="mb-2 last:mb-0">
                                        <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100">
                                          {ae.electionTitle || ae.title || ae.electionId}
                                        </p>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const electionId = ae.electionId?._id || ae.electionId || ae._id;
                                            if (electionId) {
                                              handleRemoveElectionFromDropdown(candidate._id, electionId);
                                            }
                                          }}
                                          className="mt-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        >
                                          Remove Assignment
                                        </button>
                                      </div>
                                    ))}
                                    {/* Multiple assignments are allowed */}
                                  </div>
                                )}
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Select New Election
                                </label>
                                <select
                                  value={selectedElectionId}
                                  onChange={(e) => setSelectedElectionId(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-3 text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ zIndex: 10001 }}
                                >
                                  <option value="">Choose an election...</option>
                                  {availableElections.length === 0 ? (
                                    <option value="" disabled>No upcoming elections available</option>
                                  ) : (
                                    availableElections.map((election) => (
                                      <option key={election._id} value={election._id}>
                                        {election.title}
                                      </option>
                                    ))
                                  )}
                                </select>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignElection(candidate._id);
                                    }}
                                    disabled={assigning || !selectedElectionId}
                                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                  >
                                    {assigning ? 'Assigning...' : 'Assign'}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCandidateForAssignment(null);
                                      setSelectedElectionId('');
                                    }}
                                    className="flex-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(candidate._id)}
                          className="px-3 py-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Candidate Modal */}
      {viewingCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Candidate Details</h2>
              <button
                onClick={() => setViewingCandidate(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {loadingCandidateDetails ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    {viewingCandidate.candidatePhoto ? (
                      <img
                        src={viewingCandidate.candidatePhoto}
                        alt={viewingCandidate.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-4xl text-gray-600 dark:text-gray-300 font-medium">
                          {viewingCandidate.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{viewingCandidate.name}</h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400">{viewingCandidate.partyName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                      <p className="text-gray-900 dark:text-white">{viewingCandidate.contactNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <p className="text-gray-900 dark:text-white">{viewingCandidate.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election Card Number</label>
                      <p className="text-gray-900 dark:text-white">{viewingCandidate.electionCardNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Party Name</label>
                      <p className="text-gray-900 dark:text-white">{viewingCandidate.partyName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village</label>
                      <p className="text-gray-900 dark:text-white">{viewingCandidate.village}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                      <p className="text-gray-900 dark:text-white">{viewingCandidate.state || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                      <p className="text-gray-900 dark:text-white">{viewingCandidate.district || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taluka</label>
                      <p className="text-gray-900 dark:text-white">{viewingCandidate.taluka || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <p className="text-gray-900 dark:text-white capitalize">{viewingCandidate.status || 'active'}</p>
                    </div>
                    {/* Assigned Elections Section */}
                    {viewingCandidate.assignedElections && viewingCandidate.assignedElections.length > 0 && (
                      <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Elections</h4>
                        </div>
                        <div className="space-y-3">
                          {viewingCandidate.assignedElections.map((assignedElection, idx) => {
                            const electionId = assignedElection.electionId?._id || assignedElection.electionId || assignedElection._id;
                            return (
                              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                                      {assignedElection.title || assignedElection.electionTitle}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      <span className="font-medium">Status:</span> <span className="capitalize">{assignedElection.status}</span>
                                    </p>
                                  </div>
                                  <div className="flex flex-col space-y-2 ml-4">
                                    <button
                                      onClick={() => handleViewElectionDetails(electionId)}
                                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => handleRemoveElection(viewingCandidate._id, electionId)}
                                      disabled={assignedElection.status !== 'upcoming'}
                                      className={`px-3 py-1.5 text-xs text-white rounded ${assignedElection.status !== 'upcoming' ? 'bg-gray-500 cursor-not-allowed opacity-70' : 'bg-red-600 hover:bg-red-700'}`}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {viewingCandidate.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                      <p className="text-gray-900 dark:text-white">{viewingCandidate.notes}</p>
                    </div>
                  )}

                  {/* Documents Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 md:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {viewingCandidate.candidatePhoto && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Candidate Photo</label>
                          {viewingCandidate.candidatePhoto.startsWith('data:image/') ? (
                            <div className="border rounded overflow-hidden">
                              <img 
                                src={viewingCandidate.candidatePhoto} 
                                alt={viewingCandidate.name || "Candidate"} 
                                className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  const newWindow = window.open();
                                  newWindow.document.write(`<img src="${viewingCandidate.candidatePhoto}" style="max-width:100%; height:auto;" />`);
                                }}
                              />
                            </div>
                          ) : (
                            <a 
                              href={viewingCandidate.candidatePhoto} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              View PDF
                            </a>
                          )}
                        </div>
                      )}
                      {viewingCandidate.electionCardPhoto && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Election Card Photo</label>
                          {viewingCandidate.electionCardPhoto.startsWith('data:image/') ? (
                            <div className="border rounded overflow-hidden">
                              <img 
                                src={viewingCandidate.electionCardPhoto} 
                                alt="Election Card" 
                                className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  const newWindow = window.open();
                                  newWindow.document.write(`<img src="${viewingCandidate.electionCardPhoto}" style="max-width:100%; height:auto;" />`);
                                }}
                              />
                            </div>
                          ) : (
                            <a 
                              href={viewingCandidate.electionCardPhoto} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              View PDF
                            </a>
                          )}
                        </div>
                      )}
                      {viewingCandidate.partySymbol && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Party Symbol</label>
                          {viewingCandidate.partySymbol.startsWith('data:image/') ? (
                            <div className="border rounded overflow-hidden">
                              <img 
                                src={viewingCandidate.partySymbol} 
                                alt="Party Symbol" 
                                className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  const newWindow = window.open();
                                  newWindow.document.write(`<img src="${viewingCandidate.partySymbol}" style="max-width:100%; height:auto;" />`);
                                }}
                              />
                            </div>
                          ) : (
                            <a 
                              href={viewingCandidate.partySymbol} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              View PDF
                            </a>
                          )}
                        </div>
                      )}
                      {!viewingCandidate.candidatePhoto && !viewingCandidate.electionCardPhoto && !viewingCandidate.partySymbol && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 md:col-span-3">No documents uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Election Details Modal */}
      {viewingElectionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Election Details</h2>
              <button
                onClick={() => setViewingElectionDetails(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {loadingElectionDetails ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewingElectionDetails.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{viewingElectionDetails.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                      <p className="text-gray-900 dark:text-white">{viewingElectionDetails.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                      <p className="text-gray-900 dark:text-white">{viewingElectionDetails.level}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                      <p className="text-gray-900 dark:text-white capitalize">{viewingElectionDetails.status}</p>
                    </div>
                    {viewingElectionDetails.villageCity && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                        <p className="text-gray-900 dark:text-white">{viewingElectionDetails.villageCity}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voting Start</label>
                      <p className="text-gray-900 dark:text-white">{new Date(viewingElectionDetails.votingStartDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voting End</label>
                      <p className="text-gray-900 dark:text-white">{new Date(viewingElectionDetails.votingEndDate).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidatesPage;
