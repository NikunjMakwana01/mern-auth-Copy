import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminResults = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const loadElections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: 1,
        limit: 50,
        archived: 'false',
        // show completed and active (post-end) as list; admin can publish once ended
        status: ''
      });
      const res = await api.get(`/api/elections?${params}`);
      if (res.data?.success) {
        const all = res.data.data.elections || [];
        setElections(all);
      } else {
        throw new Error('Failed to load elections');
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadElections(); }, [loadElections]);

  const handleView = async (election) => {
    try {
      setViewing(election);
      setViewData(null);
      const res = await api.get(`/api/elections/${election._id}/results`);
      setViewData(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load results');
    }
  };

  const handlePublish = async (electionId) => {
    try {
      setPublishing(true);
      const res = await api.post(`/api/elections/${electionId}/publish-results`);
      toast.success(res.data?.message || 'Results published');
      await loadElections();
      if (viewing && viewing._id === electionId) {
        await handleView(viewing);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to publish results');
    } finally {
      setPublishing(false);
    }
  };

  const canPublish = (e) => {
    if (!e) return false;
    const ended = new Date(e.votingEndDate) <= new Date();
    const declared = e.results?.isDeclared;
    return ended && !declared;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Manage Results</h1>
      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>
      )}

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Election</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Votes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td className="px-6 py-4" colSpan={4}>Loading…</td></tr>
            ) : elections.length === 0 ? (
              <tr><td className="px-6 py-4" colSpan={4}>No elections found.</td></tr>
            ) : (
              elections.map(e => (
                <tr key={e._id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{e.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{e.type} • {e.level}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm text-gray-900 dark:text-white">{e.status}</span>
                    {e.results?.isDeclared && (
                      <div className="text-xs text-green-600 dark:text-green-400">Published</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{e.totalVotesCast || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(e)}
                        className="px-3 py-1.5 rounded border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        View Results
                      </button>
                      <button
                        onClick={() => handlePublish(e._id)}
                        disabled={!canPublish(e) || publishing}
                        className={`px-3 py-1.5 rounded text-white ${canPublish(e) ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed opacity-70'}`}
                      >
                        {publishing ? 'Publishing…' : 'Publish Results'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewing && viewData && (
        <ResultsModal data={viewData} onClose={() => { setViewing(null); setViewData(null); }} />
      )}
    </div>
  );
};

const ResultsModal = ({ data, onClose }) => {
  const { election, candidates } = data;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{election.title} — Results</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">Total Votes: <span className="font-semibold">{election.totalVotesCast}</span> • Turnout: <span className="font-semibold">{election.turnoutPercentage}%</span></div>
          {election.results?.isDeclared && (
            <div className="mb-4 p-3 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              Results published on {new Date(election.results.declaredAt).toLocaleString()}
            </div>
          )}
          <div className="space-y-3">
            {candidates.map((c, idx) => (
              <div key={c.candidateId} className={`p-4 rounded border ${idx === 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{c.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{c.partyName || '-'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{c.votes}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{c.votePercentage}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;


