import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState({
    state: '',
    district: '',
    taluka: '',
    city: ''
  });
  const [filterMode, setFilterMode] = useState('individual'); // 'individual' or 'location'

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/users');
      if (res.data?.success && res.data?.data?.users) {
        setUsers(res.data.data.users);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
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

  const handleSelectByLocation = () => {
    const filtered = users.filter(user => {
      if (locationFilter.state && user.state !== locationFilter.state) return false;
      if (locationFilter.district && user.district !== locationFilter.district) return false;
      if (locationFilter.taluka && user.taluka !== locationFilter.taluka) return false;
      if (locationFilter.city && user.city !== locationFilter.city) return false;
      return true;
    });
    setSelectedUserIds(filtered.map(u => u._id));
    toast.success(`Selected ${filtered.length} users from the specified location`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (filterMode === 'location') {
      // Check if at least one location filter is set
      if (!locationFilter.state && !locationFilter.district && !locationFilter.taluka && !locationFilter.city) {
        toast.error('Please select at least one location filter');
        return;
      }
    } else {
      if (selectedUserIds.length === 0) {
        toast.error('Please select at least one user');
        return;
      }
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    setSending(true);
    try {
      const payload = {
        subject: formData.subject,
        message: formData.message
      };

      if (filterMode === 'location') {
        payload.locationFilter = locationFilter;
      } else {
        payload.userIds = selectedUserIds;
      }

      const res = await api.post('/api/admin/notifications/send', payload);

      if (res.data?.success) {
        toast.success(res.data.message || 'Notifications sent successfully');
        setFormData({ subject: '', message: '' });
        setSelectedUserIds([]);
        setLocationFilter({ state: '', district: '', taluka: '', city: '' });
      } else {
        throw new Error(res.data?.message || 'Failed to send notifications');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  // Get unique values for dropdowns
  const uniqueStates = [...new Set(users.map(u => u.state).filter(Boolean))].sort();
  const uniqueDistricts = [...new Set(users.filter(u => 
    !locationFilter.state || u.state === locationFilter.state
  ).map(u => u.district).filter(Boolean))].sort();
  const uniqueTalukas = [...new Set(users.filter(u => 
    (!locationFilter.state || u.state === locationFilter.state) &&
    (!locationFilter.district || u.district === locationFilter.district)
  ).map(u => u.taluka).filter(Boolean))].sort();
  const uniqueCities = [...new Set(users.filter(u => 
    (!locationFilter.state || u.state === locationFilter.state) &&
    (!locationFilter.district || u.district === locationFilter.district) &&
    (!locationFilter.taluka || u.taluka === locationFilter.taluka)
  ).map(u => u.city).filter(Boolean))].sort();

  const filteredUsers = users.filter(user => {
    if (filterMode === 'location') {
      if (locationFilter.state && user.state !== locationFilter.state) return false;
      if (locationFilter.district && user.district !== locationFilter.district) return false;
      if (locationFilter.taluka && user.taluka !== locationFilter.taluka) return false;
      if (locationFilter.city && user.city !== locationFilter.city) return false;
    }
    
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.city?.toLowerCase().includes(query) ||
      user.state?.toLowerCase().includes(query) ||
      user.district?.toLowerCase().includes(query) ||
      user.taluka?.toLowerCase().includes(query)
    );
  });

  const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u._id));
  const locationFilteredCount = users.filter(user => {
    if (locationFilter.state && user.state !== locationFilter.state) return false;
    if (locationFilter.district && user.district !== locationFilter.district) return false;
    if (locationFilter.taluka && user.taluka !== locationFilter.taluka) return false;
    if (locationFilter.city && user.city !== locationFilter.city) return false;
    return true;
  }).length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Send Notifications & Announcements
      </h1>

      {/* Filter Mode Toggle */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Mode:</span>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="filterMode"
              value="individual"
              checked={filterMode === 'individual'}
              onChange={(e) => {
                setFilterMode(e.target.value);
                setSelectedUserIds([]);
                setLocationFilter({ state: '', district: '', taluka: '', city: '' });
              }}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Individual Selection</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="filterMode"
              value="location"
              checked={filterMode === 'location'}
              onChange={(e) => {
                setFilterMode(e.target.value);
                setSelectedUserIds([]);
              }}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Location-Based (Bulk)</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selection Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {filterMode === 'location' ? 'Filter by Location' : `Select Users (${selectedUserIds.length} selected)`}
          </h2>

          {filterMode === 'location' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </label>
                <select
                  value={locationFilter.state}
                  onChange={(e) => setLocationFilter({ ...locationFilter, state: e.target.value, district: '', taluka: '', city: '' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  District
                </label>
                <select
                  value={locationFilter.district}
                  onChange={(e) => setLocationFilter({ ...locationFilter, district: e.target.value, taluka: '', city: '' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={!locationFilter.state}
                >
                  <option value="">All Districts</option>
                  {uniqueDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taluka
                </label>
                <select
                  value={locationFilter.taluka}
                  onChange={(e) => setLocationFilter({ ...locationFilter, taluka: e.target.value, city: '' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={!locationFilter.district}
                >
                  <option value="">All Talukas</option>
                  {uniqueTalukas.map(taluka => (
                    <option key={taluka} value={taluka}>{taluka}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City/Village
                </label>
                <select
                  value={locationFilter.city}
                  onChange={(e) => setLocationFilter({ ...locationFilter, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={!locationFilter.taluka}
                >
                  <option value="">All Cities/Villages</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {locationFilteredCount} user{locationFilteredCount !== 1 ? 's' : ''} match this location
                </div>
                <button
                  onClick={handleSelectByLocation}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Select All from Location
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name, email, city, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Select All */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select All ({filteredUsers.length})
                  </span>
                </label>
              </div>

              {/* User List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center py-4 text-gray-500">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No users found</div>
                ) : (
                  filteredUsers.map(user => (
                    <label
                      key={user._id}
                      className="flex items-start p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="ml-2 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        {user.city && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {[user.city, user.district, user.state].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Message Form Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Compose Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter message subject"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                required
                rows={12}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter your message or announcement..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filterMode === 'location' 
                  ? `${locationFilteredCount} user${locationFilteredCount !== 1 ? 's' : ''} will receive this notification`
                  : `${selectedUserIds.length} user${selectedUserIds.length !== 1 ? 's' : ''} selected`
                }
              </div>
              <button
                type="submit"
                disabled={sending || (filterMode === 'individual' && selectedUserIds.length === 0) || (filterMode === 'location' && locationFilteredCount === 0)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send Notifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
