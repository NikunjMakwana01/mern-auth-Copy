import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaMobile, FaCalendar, FaCheckCircle, FaVoteYea } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const [resultsModal, setResultsModal] = useState(null);
  
  // Wait for auth to complete before rendering
  // Only show loading if actually loading, not if user is temporarily unavailable
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // If user is not loaded but we're not loading, show error
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Unable to load user data</p>
          <p className="text-gray-600 dark:text-gray-400">Please refresh the page or try again later</p>
        </div>
      </div>
    );
  }

  // Check if profile is complete by verifying all required fields
  const isProfileComplete = () => {
    if (!user) return false;
    
    return (
      user.fullName && user.fullName.trim() !== '' &&
      user.mobile && user.mobile.trim() !== '' &&
      user.gender && user.gender !== 'prefer-not-to-say' &&
      user.address && user.address.trim() !== '' &&
      user.currentAddress && user.currentAddress.trim() !== '' &&
      user.state && user.state.trim() !== '' &&
      user.city && user.city.trim() !== '' &&
      user.voterId && user.voterId.trim() !== '' &&
      user.photo && user.photo.trim() !== ''
    );
  };

  const profileComplete = isProfileComplete();

  const handleViewResults = async () => {
    try {
      // Use public endpoint filtered by user's location to avoid auth issues
      const qs = new URLSearchParams({
        state: user?.state || '',
        district: user?.district || '',
        taluka: user?.taluka || '',
        city: user?.city || ''
      });
      
      // Make sure no token is sent for public endpoints
      const res = await api.get(`/api/elections/published-list?${qs.toString()}`);
      const list = res.data?.data?.elections || [];
      if (list.length === 0) {
        alert('No published results for your area yet.');
        return;
      }
      // Load details for the most recent published election
      const election = list[0];
      const detail = await api.get(`/api/elections/${election._id}/results-public`);
      setResultsModal(detail.data.data);
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.message || 'Failed to load results';
      if (errorMsg.includes('token')) {
        alert('Please refresh the page and try again.');
      } else {
        alert(errorMsg);
      }
    }
  };

  // Debug profile completion
  console.log('Dashboard - User profile data:', {
    profileCompleted: user?.profileCompleted,
    calculatedComplete: profileComplete,
    fullName: user?.fullName,
    mobile: user?.mobile,
    gender: user?.gender,
    address: user?.address,
    currentAddress: user?.currentAddress,
    state: user?.state,
    city: user?.city,
    voterId: user?.voterId,
    photo: user?.photo ? 'Photo present' : 'No photo'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's your digital voting dashboard
          </p>
        </div>



        {/* Vote Now CTA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-md flex items-center justify-center">
                  <FaVoteYea className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Vote Now</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">See active and upcoming elections available for you</p>
              </div>
            </div>
            <Link
              to="/vote-now"
              className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 text-sm font-medium"
            >
              Go to Vote Now
            </Link>
          </div>
        </div>

        {/* Results CTA */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Results</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View published results for your area</p>
            </div>
            <button
              onClick={handleViewResults}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
            >
              View Results
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <FaUser className="text-orange-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-orange-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaMobile className="text-orange-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.mobile}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendar className="text-orange-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Verification Status */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FaCheckCircle className="text-green-500 w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email Verification</p>
                <p className="font-medium text-green-600 dark:text-green-400">
                  {user?.isEmailVerified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  profileComplete 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-red-100 dark:bg-red-900'
                }`}>
                  <FaCheckCircle className={`w-5 h-5 ${
                    profileComplete 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Status</p>
                <p className={`text-2xl font-semibold ${
                  profileComplete 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {profileComplete ? 'Complete' : 'Incomplete'}
                </p>
                {!profileComplete && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <p>Missing fields:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {!user?.fullName && <li>Full Name</li>}
                      {!user?.mobile && <li>Mobile Number</li>}
                      {(!user?.gender || user?.gender === 'prefer-not-to-say') && <li>Gender</li>}
                      {!user?.address && <li>Address</li>}
                      {!user?.currentAddress && <li>Current Address</li>}
                      {!user?.state && <li>State</li>}
                      {!user?.city && <li>City</li>}
                      {!user?.voterId && <li>Voter ID</li>}
                      {!user?.photo && <li>Photo</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center">
                  <FaUser className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">
                  {user?.role || 'Voter'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
                  <FaCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal (public) */}
      {resultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{resultsModal.election.title} — Results</h2>
              <button onClick={() => setResultsModal(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">Total Votes: <span className="font-semibold">{resultsModal.election.totalVotesCast}</span> • Turnout: <span className="font-semibold">{resultsModal.election.turnoutPercentage}%</span></div>
              <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">Village Voters: <span className="font-semibold">{resultsModal.election.villageStats?.totalVoters || 0}</span> • Voted: <span className="font-semibold">{resultsModal.election.villageStats?.totalVoted || 0}</span></div>
              <div className="space-y-3">
                {resultsModal.candidates.map((c, idx) => (
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
      )}
    </div>
  );
};

export default Dashboard;
