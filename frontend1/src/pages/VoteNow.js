import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchAvailableElections } from '../utils/api';
import api from '../utils/api';
import { FaInfoCircle } from 'react-icons/fa';

const VoteNow = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const isProfileComplete = !!user?.profileCompleted;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeElections, setActiveElections] = useState([]);
  const [upcomingElections, setUpcomingElections] = useState([]);

  // Wait for auth to complete before loading data
  useEffect(() => {
    const load = async () => {
      // Wait for auth to complete and user to be loaded
      if (authLoading || !user) {
        return;
      }
      
      if (!isProfileComplete) {
        console.log('VoteNow: Profile not complete', { profileCompleted: user?.profileCompleted });
        return;
      }
      try {
        setLoading(true);
        setError(null);
        console.log('VoteNow: Fetching available elections for user:', {
          userId: user?._id,
          state: user?.state,
          district: user?.district,
          city: user?.city
        });
        const res = await fetchAvailableElections();
        console.log('VoteNow: API Response:', res);
        const list = res.data?.elections || [];
        console.log('VoteNow: Total elections received:', list.length);
        console.log('VoteNow: Elections by status:', {
          active: list.filter(e => e.status === 'active').length,
          upcoming: list.filter(e => e.status === 'upcoming').length,
          all: list.map(e => ({ id: e._id, title: e.title, status: e.status, state: e.state, district: e.district, level: e.level }))
        });
        setActiveElections(list.filter(e => e.status === 'active'));
        setUpcomingElections(list.filter(e => e.status === 'upcoming'));
      } catch (e) {
        console.error('VoteNow: Error loading elections:', e);
        setError(e.response?.data?.message || 'Failed to load elections');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, isProfileComplete, user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vote Now</h1> 
        </div>

        {!isProfileComplete ? (
          <div className="p-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-start space-x-3 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
            <FaInfoCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">Complete your profile to access voting.</p>
              <p className="text-sm mt-1">Go to your profile page and fill in the required details.</p>
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">Loading…</div>
            )}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
            )}

            {!loading && !error && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Active Elections</h2>
                  {activeElections.length === 0 ? (
                    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded dark:text-white">No active elections right now.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeElections.map(e => (
                        <div key={e._id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                          <p className="font-medium text-gray-900 dark:text-white">{e.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{e.type} • {e.level}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{[e.villageCity, e.district, e.state].filter(Boolean).join(', ')}</p>
                          <div className="mt-3">
                            <button 
                              onClick={async () => {
                                try {
                                  // Check if user already voted
                                  const statusRes = await api.get(`/api/voting/check-status/${e._id}`);
                                  if (statusRes.data.success && statusRes.data.data.hasVoted) {
                                    // Redirect to already voted page
                                    navigate('/already-voted', { state: { election: e } });
                                  } else {
                                    // Redirect to credentials page
                                    navigate('/voting-credentials', { state: { election: e } });
                                  }
                                } catch (error) {
                                  console.error('Error checking vote status:', error);
                                  // If error, still redirect to credentials page
                                  navigate('/voting-credentials', { state: { election: e } });
                                }
                              }}
                              className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                            >
                              Vote
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Upcoming Elections</h2>
                  {upcomingElections.length === 0 ? (
                    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded dark:text-white">No upcoming elections.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingElections.map(e => (
                        <div key={e._id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                          <p className="font-medium text-gray-900 dark:text-white">{e.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{e.type} • {e.level}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{[e.villageCity, e.district, e.state].filter(Boolean).join(', ')}</p>
                          <div className="mt-3">
                            <button disabled className="px-3 py-1.5 rounded bg-gray-500 text-white text-sm opacity-70 cursor-not-allowed">Starts Soon</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VoteNow;


