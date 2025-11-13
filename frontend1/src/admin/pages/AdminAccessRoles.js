import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminAccessRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/admin/users');
      if (res.data?.success && res.data?.data?.users) {
        setUsers(res.data.data.users);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load users');
      toast.error(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async (userIds) => {
    if (!userIds || userIds.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (!window.confirm(`Assign admin role to ${userIds.length} selected user(s)?`)) {
      return;
    }

    try {
      const res = await api.post('/api/admin/users/assign-admin', { userIds });
      if (res.data?.success) {
        toast.success(res.data.message || 'Admin role assigned successfully');
        setSelectedUserIds([]);
        await loadUsers();
      } else {
        throw new Error(res.data?.message || 'Failed to assign admin role');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to assign admin role');
    }
  };

  const handleRemoveAdmin = async (userIds) => {
    if (!userIds || userIds.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (!window.confirm(`Remove admin role from ${userIds.length} selected user(s)?`)) {
      return;
    }

    try {
      const res = await api.post('/api/admin/users/remove-admin', { userIds });
      if (res.data?.success) {
        toast.success(res.data.message || 'Admin role removed successfully');
        setSelectedUserIds([]);
        await loadUsers();
      } else {
        throw new Error(res.data?.message || 'Failed to remove admin role');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to remove admin role');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const filtered = filteredUsers.map(u => u._id);
      setSelectedUserIds(filtered);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.city?.toLowerCase().includes(query)
    );
  });

  const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u._id));
  const selectedAdmins = filteredUsers.filter(u => selectedUserIds.includes(u._id) && u.role === 'admin');
  const selectedVoters = filteredUsers.filter(u => selectedUserIds.includes(u._id) && u.role === 'voter');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Access and Roles Management
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Bulk Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search users by name, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {selectedUserIds.length > 0 && (
            <div className="flex gap-2">
              {selectedVoters.length > 0 && (
                <button
                  onClick={() => handleAssignAdmin(selectedUserIds)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Assign Admin ({selectedVoters.length})
                </button>
              )}
              {selectedAdmins.length > 0 && (
                <button
                  onClick={() => handleRemoveAdmin(selectedUserIds)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Remove Admin ({selectedAdmins.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.fullName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.mobile || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.city || user.district || user.state || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Voter'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role === 'admin' ? (
                      <button
                        onClick={() => handleRemoveAdmin([user._id])}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignAdmin([user._id])}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Make Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccessRoles;

