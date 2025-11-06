import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { getStates, getDistricts, getTalukas, getPlaces } from '../../utils/indiaLocations';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    currentAddress: '',
    state: '',
    district: '',
    taluka: '',
    city: '',
    voterId: '',
    photo: '',
    role: 'voter',
    isActive: true
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      const res = await api.get(`/api/admin/users?${params.toString()}`);
      if (res.data?.success && res.data?.data?.users) {
        setUsers(res.data.data.users);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setError('Session expired. Please login again.');
        setUsers([]);
      } else {
        // Network error - don't show error immediately, will retry on next action
        const errorMsg = e.response?.data?.message || e.message || 'Failed to load users';
        setError(errorMsg);
        setUsers([]); // Clear users on error
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load on component mount - wait a bit for AdminLayout auth
  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto search: when query changes, refetch (debounced). Empty query shows all.
  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const updateUser = async (id, payload) => {
    try {
      await api.put(`/api/admin/users/${id}`, payload);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    }
  };

  const startEdit = (user) => {
    setIsEditing(true);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      mobile: user.mobile || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user.gender || '',
      address: user.address || '',
      currentAddress: user.currentAddress || '',
      state: user.state || '',
      district: user.district || '',
      taluka: user.taluka || '',
      city: user.city || '',
      voterId: user.voterId || '',
      photo: user.photo || '',
      role: user.role || 'voter',
      isActive: user.isActive !== undefined ? user.isActive : true
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      fullName: '',
      email: '',
      mobile: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      currentAddress: '',
      state: '',
      district: '',
      taluka: '',
      city: '',
      voterId: '',
      photo: '',
      role: 'voter',
      isActive: true
    });
  };

  const saveEdit = async () => {
    try {
      console.log('Saving user edit:', selected._id, editForm);
      const response = await api.put(`/api/admin/users/${selected._id}`, editForm);
      console.log('Update response:', response.data);
      setIsEditing(false);
      await load();
      alert('User updated successfully!');
    } catch (e) {
      console.error('Update error:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      alert(e.response?.data?.message || e.message || 'Update failed');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      await load();
      alert('User deleted successfully!');
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const LoadingBadge = () => (
    <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">Loading...</span>
  );
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'application/pdf'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      alert('Only JPG or PDF under 2MB allowed');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setEditForm(prev => ({ ...prev, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-4 sm:mb-6">Manage Users</h1>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input 
            autoFocus 
            className="input-field flex-1 min-w-0 text-sm sm:text-base md:text-lg lg:text-lg px-3 py-2 sm:py-3" 
            placeholder="Search by name, city, or voter ID" 
            value={query} 
            onChange={e=>setQuery(e.target.value)} 
          />
          <div className="flex gap-2 sm:gap-3 items-center">
            <button 
              onClick={()=>setQuery('')} 
              className="px-4 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 text-sm sm:text-base md:text-lg lg:text-lg whitespace-nowrap font-medium"
            >
              Clear
            </button>
            {loading && <LoadingBadge />}
          </div>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">Voter ID</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm lg:text-base font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(u => (
              <tr key={u._id} className={selected?._id === u._id ? 'bg-slate-50 dark:bg-slate-700' : ''}>
                <td className="px-4 py-3 text-sm sm:text-base lg:text-lg lg:text-lg text-gray-900 dark:text-white">{u.fullName}</td>
                <td className="px-4 py-3 text-sm sm:text-base lg:text-lg lg:text-lg text-gray-900 dark:text-white">{u.city || '-'}</td>
                <td className="px-4 py-3 text-sm sm:text-base lg:text-lg lg:text-lg text-gray-900 dark:text-white">{u.voterId || '-'}</td>
                <td className="px-4 py-3 text-sm sm:text-base lg:text-lg lg:text-lg text-gray-900 dark:text-white">{u.email}</td>
                <td className="px-4 py-3 text-sm sm:text-base lg:text-lg lg:text-lg space-x-2">
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm lg:text-base"
                    onClick={() => setSelected(u)}
                  >
                    View
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm lg:text-base"
                    onClick={() => deleteUser(u._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile and Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {users.map(u => (
          <div key={u._id} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 ${selected?._id === u._id ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{u.fullName}</h3>
              <div className="flex gap-3 sm:gap-2">
                <button
                  className="px-4 py-2 sm:px-3 sm:py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-sm md:text-base font-medium"
                  onClick={() => setSelected(u)}
                >
                  View
                </button>
                <button
                  className="px-4 py-2 sm:px-3 sm:py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm sm:text-sm md:text-base font-medium"
                  onClick={() => deleteUser(u._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="space-y-3 text-sm sm:text-base md:text-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Email:</span>
                <span className="text-gray-900 dark:text-white break-all">{u.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">City:</span>
                <span className="text-gray-900 dark:text-white">{u.city || '-'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Voter ID:</span>
                <span className="text-gray-900 dark:text-white">{u.voterId || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold">
                  {isEditing ? 'Edit User Details' : 'User Details'}
                </h2>
                <button 
                  onClick={() => {
                    setSelected(null);
                    setIsEditing(false);
                    cancelEdit();
                  }} 
                  className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-3 sm:p-6">
              {isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Basic Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 dark:text-white border-b pb-2">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full px-3 py-2 text-sm sm:text-base lg:text-lg lg:text-lg border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile *</label>
                      <input
                        type="tel"
                        value={editForm.mobile}
                        onChange={e => setEditForm({...editForm, mobile: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="9876543210"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={e => setEditForm({...editForm, dateOfBirth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                      <select
                        value={editForm.gender}
                        onChange={e => setEditForm({...editForm, gender: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Address Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                      <textarea
                        value={editForm.address}
                        onChange={e => setEditForm({...editForm, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Address</label>
                      <textarea
                        value={editForm.currentAddress}
                        onChange={e => setEditForm({...editForm, currentAddress: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                      <select
                        value={editForm.state}
                        onChange={e => setEditForm({...editForm, state: e.target.value, district: '', taluka: '', city: ''})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select State</option>
                        {getStates().map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                      <select
                        value={editForm.district}
                        onChange={e => setEditForm({...editForm, district: e.target.value, taluka: '', city: ''})}
                        disabled={!editForm.state}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select District</option>
                        {getDistricts(editForm.state).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taluka</label>
                      <select
                        value={editForm.taluka}
                        onChange={e => setEditForm({...editForm, taluka: e.target.value, city: ''})}
                        disabled={!editForm.state || !editForm.district}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Taluka</option>
                        {getTalukas(editForm.state, editForm.district).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City/Village</label>
                      <select
                        value={editForm.city}
                        onChange={e => setEditForm({...editForm, city: e.target.value })}
                        disabled={!editForm.state || !editForm.district || !editForm.taluka}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select City/Village</option>
                        {getPlaces(editForm.state, editForm.district, editForm.taluka).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voter ID</label>
                      <input
                        type="text"
                        value={editForm.voterId}
                        onChange={e => setEditForm({...editForm, voterId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="NNI1234567"
                      />
                    </div>
                  </div>

                  {/* Account Settings */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Account Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select
                          value={editForm.role}
                          onChange={e => setEditForm({...editForm, role: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="voter">Voter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={editForm.isActive}
                          onChange={e => setEditForm({...editForm, isActive: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Account Active
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Photo</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo</label>
                      {editForm.photo ? (
                        <div className="mb-2">
                          {/pdf/gi.test(editForm.photo) ? (
                            <a href={editForm.photo} target="_blank" rel="noreferrer" className="text-blue-700 underline">View PDF</a>
                          ) : (
                            <img src={editForm.photo} alt="User" className="w-28 h-28 object-cover rounded border mb-1" />
                          )}
                          <button type="button" className="ml-2 text-xs text-red-600 underline" onClick={()=>setEditForm(prev=>({...prev,photo:''}))}>Remove</button>
                        </div>
                      ) : null}
                      <input type="file" accept=".jpg,.jpeg,.pdf" onChange={handlePhotoUpload} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Basic Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 dark:text-white border-b pb-2">Basic Information</h3>
                    
                    <div>
                      <span className="text-slate-500 font-medium">Full Name:</span>
                      <p className="text-gray-900 dark:text-white">{selected.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Email:</span>
                      <p className="text-gray-900 dark:text-white">{selected.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Mobile:</span>
                      <p className="text-gray-900 dark:text-white">{selected.mobile || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Date of Birth:</span>
                      <p className="text-gray-900 dark:text-white">
                        {selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Gender:</span>
                      <p className="text-gray-900 dark:text-white capitalize">{selected.gender || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Address Information</h3>
                    
                    <div>
                      <span className="text-slate-500 font-medium">Address:</span>
                      <p className="text-gray-900 dark:text-white">{selected.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Current Address:</span>
                      <p className="text-gray-900 dark:text-white">{selected.currentAddress || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">State:</span>
                      <p className="text-gray-900 dark:text-white">{selected.state || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">District:</span>
                      <p className="text-gray-900 dark:text-white">{selected.district || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Taluka:</span>
                      <p className="text-gray-900 dark:text-white">{selected.taluka || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">City/Village:</span>
                      <p className="text-gray-900 dark:text-white">{selected.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Voter ID:</span>
                      <p className="text-gray-900 dark:text-white">{selected.voterId || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Account Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-slate-500 font-medium">Role:</span>
                        <p className="text-gray-900 dark:text-white capitalize">{selected.role}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Status:</span>
                        <p className={`font-medium ${selected.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {selected.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Email Verified:</span>
                        <p className={`font-medium ${selected.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                          {selected.isEmailVerified ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-500 font-medium">Member Since:</span>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(selected.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Last Login:</span>
                        <p className="text-gray-900 dark:text-white">
                          {selected.lastLogin ? new Date(selected.lastLogin).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Photo Display */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Photo</h3>
                    <div>
                      <span className="text-slate-500 font-medium">Photo:</span>
                      {selected.photo ? (/pdf/gi.test(selected.photo) ? (
                        <a href={selected.photo} target="_blank" rel="noreferrer" className="text-blue-700 underline">View PDF</a>
                      ) : (
                        <img src={selected.photo} alt="User" className="w-28 h-28 object-cover rounded" />
                      )) : <span className="text-gray-500">Not Provided</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-3 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm sm:text-base lg:text-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm sm:text-base lg:text-lg"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(selected)}
                      className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 text-sm sm:text-base lg:text-lg"
                    >
                      Edit User
                    </button>
                    <button
                      onClick={() => {
                        setSelected(null);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm sm:text-base lg:text-lg"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;


