import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FaUser, FaEnvelope, FaMobileAlt, FaVoteYea, FaUsers, FaUserTie, FaClipboardList, FaCheckCircle, FaClock, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminHome = () => {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    elections: { total: 0, active: 0, upcoming: 0, completed: 0 },
    candidates: { total: 0, active: 0 },
    users: { total: 0, active: 0, voters: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load admin info
      const adminRes = await api.get('/api/admin-auth/me');
      if (adminRes.data?.success && adminRes.data?.data?.admin) {
        setAdmin(adminRes.data.data.admin);
      }

      // Load elections stats
      try {
        const electionsRes = await api.get('/api/admin/elections?limit=1');
        if (electionsRes.data?.success && electionsRes.data?.data?.stats) {
          setStats(prev => ({
            ...prev,
            elections: electionsRes.data.data.stats
          }));
        }
      } catch (e) {
        console.warn('Failed to load election stats:', e);
      }

      // Load users stats
      try {
        const usersRes = await api.get('/api/admin/users');
        if (usersRes.data?.success && usersRes.data?.data?.users) {
          const users = usersRes.data.data.users;
          const activeUsers = users.filter(u => u.isActive);
          const voters = users.filter(u => u.role === 'voter');
          setStats(prev => ({
            ...prev,
            users: {
              total: users.length,
              active: activeUsers.length,
              voters: voters.length
            }
          }));
        }
      } catch (e) {
        console.warn('Failed to load user stats:', e);
      }

      // Load candidates stats
      try {
        const candidatesRes = await api.get('/api/candidates?limit=1');
        if (candidatesRes.data?.success && candidatesRes.data?.data?.candidates) {
          const candidates = candidatesRes.data.data.candidates;
          const activeCandidates = candidates.filter(c => c.status === 'active' && c.isActive);
          setStats(prev => ({
            ...prev,
            candidates: {
              total: candidatesRes.data.data.pagination?.totalCandidates || candidates.length,
              active: activeCandidates.length
            }
          }));
        }
      } catch (e) {
        console.warn('Failed to load candidate stats:', e);
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load data. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, link }) => {
    const content = (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow ${link ? 'cursor-pointer' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')} dark:${color.replace('text-', 'bg-').replace('-600', '-900/40')} flex items-center justify-center`}>
            <Icon className={`${color} text-xl`} />
          </div>
        </div>
      </div>
    );

    if (link) {
      return <Link to={link}>{content}</Link>;
    }
    return content;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Overview of your voting system</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Elections"
          value={stats.elections.total}
          icon={FaVoteYea}
          color="text-blue-600"
          link="/admin/elections"
        />
        <StatCard
          title="Active Elections"
          value={stats.elections.active}
          icon={FaCheckCircle}
          color="text-green-600"
          link="/admin/elections"
        />
        <StatCard
          title="Upcoming Elections"
          value={stats.elections.upcoming}
          icon={FaClock}
          color="text-yellow-600"
          link="/admin/elections"
        />
        <StatCard
          title="Completed Elections"
          value={stats.elections.completed}
          icon={FaClipboardList}
          color="text-gray-600"
          link="/admin/election-history"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Total Candidates"
          value={stats.candidates.total}
          icon={FaUserTie}
          color="text-purple-600"
          link="/admin/candidates"
        />
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={FaUsers}
          color="text-indigo-600"
          link="/admin/users"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Active Users"
          value={stats.users.active}
          icon={FaCheckCircle}
          color="text-green-600"
          link="/admin/users"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/elections"
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <FaVoteYea className="text-blue-600 dark:text-blue-400 text-2xl mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Manage Elections</p>
          </Link>
          <Link
            to="/admin/candidates"
            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <FaUserTie className="text-purple-600 dark:text-purple-400 text-2xl mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Manage Candidates</p>
          </Link>
          <Link
            to="/admin/users"
            className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <FaUsers className="text-indigo-600 dark:text-indigo-400 text-2xl mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Manage Users</p>
          </Link>
          <Link
            to="/admin/notifications"
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <FaEnvelope className="text-green-600 dark:text-green-400 text-2xl mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Send Notifications</p>
          </Link>
        </div>
      </div>

      {/* Admin Profile Card */}
      {admin && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <FaUser className="text-orange-600 dark:text-orange-400 text-2xl" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {admin.fullName || 'Admin'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Administrator</div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FaEnvelope />
                  <span>{admin.email || '-'}</span>
                </div>
                {admin.mobile && (
                  <div className="flex items-center gap-2">
                    <FaMobileAlt />
                    <span>{admin.mobile}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;


