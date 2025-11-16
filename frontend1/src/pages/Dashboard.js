import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaMobile, FaCalendar, FaCheckCircle, FaVoteYea } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  
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
            <Link
              to="/results"
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm font-medium"
            >
              View Results
            </Link>
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

    </div>
  );
};

export default Dashboard;
