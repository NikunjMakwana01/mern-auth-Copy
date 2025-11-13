import React, { useEffect, useRef, useState } from 'react';
import api from '../../utils/api';

const AdminElectionHistory = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selected, setSelected] = useState(null);
  const successTimerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // show all completed elections (archived or not) for history
        const params = new URLSearchParams({ status: 'completed', sortBy: 'resultDeclarationDate', sortOrder: 'desc', page: 1, limit: 50 });
        const res = await api.get(`/api/elections?${params}`);
        if (res.data?.success && res.data?.data?.elections) {
          setElections(res.data.data.elections);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          setError('Session expired. Please login again.');
        } else {
          setError(e.response?.data?.message || 'Failed to load history');
        }
      } finally {
        setLoading(false);
      }
    };
    // Small delay to ensure AdminLayout auth is ready
    const timer = setTimeout(load, 100);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (date) => new Date(date).toLocaleString('en-IN');

  const handleRestore = async (id) => {
    try {
      const res = await api.post(`/api/elections/${id}/restore`);
      setSuccess(res.data?.message || 'Election restored');
      // refresh
      const params = new URLSearchParams({ status: 'completed', sortBy: 'resultDeclarationDate', sortOrder: 'desc', page: 1, limit: 50 });
      const listRes = await api.get(`/api/elections?${params}`);
      setElections(listRes.data?.data?.elections || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to restore election');
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('This will permanently delete this election from the database. Continue?')) return;
    try {
      await api.delete(`/api/elections/${id}/permanent`);
      const params = new URLSearchParams({ status: 'completed', sortBy: 'resultDeclarationDate', sortOrder: 'desc', page: 1, limit: 50 });
      const res = await api.get(`/api/elections?${params}`);
      setElections(res.data?.data?.elections || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete election');
    }
  };

  // Auto-hide success banner after a short delay
  useEffect(() => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    if (!success) return;
    successTimerRef.current = setTimeout(() => {
      setSuccess(null);
      successTimerRef.current = null;
    }, 1500);
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
    };
  }, [success]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Election History</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {success && (
          <div className="m-6 p-3 bg-green-100 border border-green-400 text-green-800 rounded relative">
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="absolute right-2 top-2 text-green-700 hover:text-green-900"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
        {elections.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-300">No completed elections yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Election</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Voting Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Result Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {elections.map(e => (
                  <tr key={e._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{e.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{e.type} • {e.level}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {e.villageCity ? e.villageCity + ', ' : ''}
                      {e.taluka ? e.taluka + ', ' : ''}
                      {e.district || ''}{e.state ? (e.district ? ', ' : '') + e.state : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div>Start: {formatDate(e.votingStartDate)}</div>
                      <div>End: {formatDate(e.votingEndDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDate(e.resultDeclarationDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{e.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-4">
                        <button onClick={()=>setSelected(e)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">View</button>
                            <button onClick={()=>handleRestore(e._id)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Restore</button>
                            <button onClick={()=>handlePermanentDelete(e._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected && (
        <ViewElectionModal election={selected} onClose={()=>setSelected(null)} />
      )}
    </div>
  );
};

export default AdminElectionHistory;



// View Election Modal (read-only detailed view)
const ViewElectionModal = ({ election, onClose }) => {
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const formatDate = (date) => new Date(date).toLocaleString('en-IN');

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const res = await api.get(`/api/elections/${election._id}/results`);
        if (res.data?.success && res.data?.data?.candidates) {
          setCandidates(res.data.data.candidates);
        }
      } catch (e) {
        console.error('Failed to load candidates:', e);
      } finally {
        setLoadingCandidates(false);
      }
    };
    loadCandidates();
  }, [election._id]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Election Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200 mb-6">
            <div><span className="font-semibold">Title:</span> {election.title}</div>
            <div><span className="font-semibold">Type/Level:</span> {election.type} • {election.level}</div>
            <div><span className="font-semibold">Panchayat:</span> {election.panchayatName || '-'}</div>
            <div><span className="font-semibold">State:</span> {election.state || '-'}</div>
            <div><span className="font-semibold">District:</span> {election.district || '-'}</div>
            <div><span className="font-semibold">Taluka:</span> {election.taluka || '-'}</div>
            <div><span className="font-semibold">Village/City:</span> {election.villageCity || '-'}</div>
            <div><span className="font-semibold">Description:</span> {election.description}</div>
            <div><span className="font-semibold">Start:</span> {formatDate(election.votingStartDate)}</div>
            <div><span className="font-semibold">End:</span> {formatDate(election.votingEndDate)}</div>
            <div><span className="font-semibold">Status:</span> {election.status} {election.archived ? '(Archived)' : ''}</div>
            <div><span className="font-semibold">Total Votes:</span> {election.totalVotesCast || 0}</div>
          </div>

          {/* Candidates Section */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Candidates ({candidates.length})</h4>
            {loadingCandidates ? (
              <div className="text-center py-4 text-gray-500">Loading candidates...</div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No candidates found for this election.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidates.map((candidate, idx) => (
                  <div key={candidate.candidateId || idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">{candidate.name || 'N/A'}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <div>Party: {candidate.partyName || '-'}</div>
                          {candidate.votes !== undefined && (
                            <div className="mt-1">
                              <span className="font-medium">Votes: {candidate.votes}</span>
                              {candidate.votePercentage !== undefined && (
                                <span className="ml-2">({candidate.votePercentage}%)</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};