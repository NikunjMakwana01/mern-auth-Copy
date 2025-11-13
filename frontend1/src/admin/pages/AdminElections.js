import React, { useCallback, useEffect, useState } from 'react';
import api from '../../utils/api';
import { getStates, getDistricts, getTalukas, getPlaces } from '../../utils/indiaLocations';

const AdminElectionsPage = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [filters, setFilters] = useState({
		type: '',
		status: '',
		search: ''
	});
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const loadElections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        archived: 'false',
        ...filters
      });
      const res = await api.get(`/api/elections?${params}`);
      if (res.data?.success && res.data?.data?.elections) {
        setElections(res.data.data.elections);
        setPagination(res.data.data.pagination || {});
      } else {
        throw new Error('Invalid response format');
      }
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        setError('Session expired. Please login again.');
      } else {
        setError(e.response?.data?.message || 'Failed to load elections');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    // Small delay to ensure AdminLayout auth is ready
    const timer = setTimeout(() => {
      loadElections();
    }, 100);
    return () => clearTimeout(timer);
  }, [loadElections]);

  // Auto-refresh elections every 30 seconds to update status when dates arrive
  useEffect(() => {
    const interval = setInterval(() => {
      loadElections();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loadElections]);

  // Debounce search input updates to filters for smoother typing
  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      // Reset to first page when search changes
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  

  const handleArchive = async (id) => {
    if (!window.confirm('Remove from manage list? You can restore it from history later.')) return;
    try {
      await api.post(`/api/elections/${id}/archive`);
      loadElections();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to remove election');
    }
  };

  // start/end actions removed

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('This will permanently delete the election. Continue?')) return;
    try {
      await api.delete(`/api/elections/${id}/permanent`);
      loadElections();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete election');
    }
  };

  // Results feature removed

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'postponed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Do not early-return on loading to avoid losing input focus during search

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Elections</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Election
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        {loading && (
          <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">Loading…</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Election Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="Panchayat">Panchayat</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search by Title or City</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => { setFilters({type: '', status: '', search: ''}); setSearchInput(''); }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Elections List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {elections.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No elections</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new election.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Election
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type & Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Votes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {elections.map((election) => (
                  <tr key={election._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {election.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {election.constituency && `${election.constituency}, `}
                          {election.state && `${election.state}, `}
                          {election.district && election.district},
                          {election.taluka && election.taluka},
                          {election.villageCity && election.villageCity}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{election.type}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{election.level}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>Start: {formatDate(election.votingStartDate)}</div>
                      <div>End: {formatDate(election.votingEndDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(election.status)}`}>
                        {election.status}
                      </span>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {typeof election.totalVotesCast === 'number' ? election.totalVotesCast : 0}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedElection(election);
                            setShowView(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                        {(election.status === 'draft' || election.status === 'upcoming') && (
                          <button
                            onClick={() => {
                              setSelectedElection(election);
                              setShowEditForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Edit
                          </button>
                          
                        )}
                        {/* Start/End actions removed as requested */}
                        {/* Results feature removed */}
                        {election.status === 'completed' && (
                          <button
                            onClick={() => handleArchive(election._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                        {(election.status === 'upcoming' || election.status === 'draft') && (
                          <button
                            onClick={() => handlePermanentDelete(election._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
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

      {/* Create Election Modal */}
      {showCreateForm && (
        <CreateElectionModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadElections();
          }}
        />
      )}

      {/* Edit Election Modal */}
      {showEditForm && selectedElection && (
        <EditElectionModal
          election={selectedElection}
          onClose={() => {
            setShowEditForm(false);
            setSelectedElection(null);
          }}
          onSuccess={() => {
            setShowEditForm(false);
            setSelectedElection(null);
            loadElections();
          }}
        />
      )}

      {/* View Election Modal */}
      {showView && selectedElection && (
        <ViewElectionModal
          election={selectedElection}
          onClose={() => {
            setShowView(false);
            setSelectedElection(null);
          }}
        />
      )}
    </div>
  );
};

// Create Election Modal Component (Panchayat Sarpanch)
const CreateElectionModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    panchayatName: '',
    description: '',
    type: 'Panchayat',
    level: 'Village',
    state: '',
    district: '',
    taluka: '',
    villageCity: '',
    votingStartDate: '',
    votingEndDate: '',
    resultDeclarationDate: '',
    status: ''
  });
  const [states] = useState(getStates());
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/elections', formData);
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    if (name === 'state') {
      setDistricts(getDistricts(value));
      setFormData(prev => ({ ...prev, district: '', taluka: '', villageCity: '' }));
      setTalukas([]);
      setCities([]);
    }
    if (name === 'district') {
      setTalukas(getTalukas(formData.state, value));
      setFormData(prev => ({ ...prev, taluka: '', villageCity: '' }));
      setCities([]);
    }
    if (name === 'taluka') {
      setCities(getPlaces(formData.state, formData.district, value));
      setFormData(prev => ({ ...prev, villageCity: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Election</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Election Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Lok Sabha">Lok Sabha</option>
                  <option value="Rajya Sabha">Rajya Sabha</option>
                  <option value="State Assembly">State Assembly</option>
                  <option value="Municipal Corporation">Municipal Corporation</option>
                  <option value="Panchayat">Panchayat</option>
                  <option value="Zila Parishad">Zila Parishad</option>
                  <option value="Block Development">Block Development</option>
                  <option value="Mayor">Mayor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election Level *</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="National">National</option>
                  <option value="State">State</option>
                  <option value="District">District</option>
                  <option value="Municipal">Municipal</option>
                  <option value="Village">Village</option>
                  <option value="Block">Block</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Panchayat Name *</label>
                <input
                  type="text"
                  name="panchayatName"
                  value={formData.panchayatName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select State</option>
                  {states.map((s)=> (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District *</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  disabled={!formData.state}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select District</option>
                  {districts.map((d)=> (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taluka *</label>
                <select
                  name="taluka"
                  value={formData.taluka}
                  onChange={handleChange}
                  required
                  disabled={!formData.district}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Taluka</option>
                  {talukas.map((t)=> (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village / City *</label>
                <select
                  name="villageCity"
                  value={formData.villageCity}
                  onChange={handleChange}
                  required
                  disabled={!formData.taluka}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Village / City</option>
                  {cities.map((c)=> (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Election Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election Start Date *</label>
                <input
                  type="datetime-local"
                  name="votingStartDate"
                  value={formData.votingStartDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election End Date *</label>
                <input
                  type="datetime-local"
                  name="votingEndDate"
                  value={formData.votingEndDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Result Declaration Date *</label>
                <input
                  type="datetime-local"
                  name="resultDeclarationDate"
                  value={formData.resultDeclarationDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Election'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Election Modal Component (Panchayat Sarpanch)
const EditElectionModal = ({ election, onClose, onSuccess }) => {
  const toLocalInputValue = (value) => {
    if (!value) return '';
    const d = new Date(value);
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  };
  const [formData, setFormData] = useState({
    title: election.title || '',
    panchayatName: election.panchayatName || '',
    description: election.description || '',
    type: election.type || 'Panchayat',
    level: election.level || 'Village',
    state: election.state || '',
    district: election.district || '',
    taluka: election.taluka || '',
    villageCity: election.villageCity || '',
    votingStartDate: toLocalInputValue(election.votingStartDate),
    votingEndDate: toLocalInputValue(election.votingEndDate),
    resultDeclarationDate: toLocalInputValue(election.resultDeclarationDate),
    status: election.status || 'draft' || 'upcoming'
  });
  const [states] = useState(getStates());
  
  // Initialize dropdowns with existing values included
  const initialDistricts = (() => {
    const state = election.state || '';
    if (!state) return [];
    const computed = getDistricts(state);
    const district = election.district || '';
    if (district && !computed.includes(district)) {
      return [district, ...computed];
    }
    return computed;
  })();
  
  const initialTalukas = (() => {
    const state = election.state || '';
    const district = election.district || '';
    if (!state || !district) return [];
    const computed = getTalukas(state, district);
    const taluka = election.taluka || '';
    if (taluka && !computed.includes(taluka)) {
      return [taluka, ...computed];
    }
    return computed;
  })();
  
  const initialCities = (() => {
    const state = election.state || '';
    const district = election.district || '';
    const taluka = election.taluka || '';
    if (!state || !district || !taluka) return [];
    const computed = getPlaces(state, district, taluka);
    const villageCity = election.villageCity || '';
    if (villageCity && !computed.includes(villageCity)) {
      return [villageCity, ...computed];
    }
    return computed;
  })();
  
  const [districts, setDistricts] = useState(initialDistricts);
  const [talukas, setTalukas] = useState(initialTalukas);
  const [cities, setCities] = useState(initialCities);
  
  // Ensure dropdowns include current values even if not present in helper data
  React.useEffect(() => {
    if (formData.state) {
      const computedDistricts = getDistricts(formData.state);
      if (formData.district && !computedDistricts.includes(formData.district)) {
        setDistricts([formData.district, ...computedDistricts]);
      } else {
        setDistricts(computedDistricts);
      }
    } else {
      setDistricts([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.state]);

  React.useEffect(() => {
    if (formData.state && formData.district) {
      const computedTalukas = getTalukas(formData.state, formData.district);
      if (formData.taluka && !computedTalukas.includes(formData.taluka)) {
        setTalukas([formData.taluka, ...computedTalukas]);
      } else {
        setTalukas(computedTalukas);
      }
    } else {
      setTalukas([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.state, formData.district]);

  React.useEffect(() => {
    if (formData.state && formData.district && formData.taluka) {
      const computedCities = getPlaces(formData.state, formData.district, formData.taluka);
      if (formData.villageCity && !computedCities.includes(formData.villageCity)) {
        setCities([formData.villageCity, ...computedCities]);
      } else {
        setCities(computedCities);
      }
    } else {
      setCities([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.state, formData.district, formData.taluka]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Only send changed fields to avoid triggering date validation when not edited
      const payload = {};
      const original = {
        title: election.title || '',
        panchayatName: election.panchayatName || '',
        description: election.description || '',
        type: election.type || 'Panchayat',
        level: election.level || 'Village',
        state: election.state || '',
        district: election.district || '',
        taluka: election.taluka || '',
        villageCity: election.villageCity || '',
        votingStartDate: toLocalInputValue(election.votingStartDate),
        votingEndDate: toLocalInputValue(election.votingEndDate),
        resultDeclarationDate: toLocalInputValue(election.resultDeclarationDate),
        status: election.status || 'draft'
      };

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== original[key] && formData[key] !== undefined) {
          payload[key] = formData[key];
        }
      });
      // If status is being set to active, confirm the irreversible edit policy
      if (payload.status === 'active') {
        const ok = window.confirm('After changing status to Active, you can only change status to Completed. All other fields will be locked. Continue?');
        if (!ok) {
          setLoading(false);
          return;
        }
      }
      await api.put(`/api/elections/${election._id}`, payload);
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update election');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isActiveNow = formData.status === 'active' || election.status === 'active';
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Election</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Election Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isActiveNow}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={isActiveNow}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Lok Sabha">Lok Sabha</option>
                  <option value="Rajya Sabha">Rajya Sabha</option>
                  <option value="State Assembly">State Assembly</option>
                  <option value="Municipal Corporation">Municipal Corporation</option>
                  <option value="Panchayat">Panchayat</option>
                  <option value="Zila Parishad">Zila Parishad</option>
                  <option value="Block Development">Block Development</option>
                  <option value="Mayor">Mayor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Panchayat Name *</label>
                <input
                  type="text"
                  name="panchayatName"
                  value={formData.panchayatName}
                  onChange={handleChange}
                  required
                  disabled={isActiveNow}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election Level *</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  disabled={isActiveNow}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="National">National</option>
                  <option value="State">State</option>
                  <option value="District">District</option>
                  <option value="Municipal">Municipal</option>
                  <option value="Village">Village</option>
                  <option value="Block">Block</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={(e)=>{ handleChange(e); setDistricts(getDistricts(e.target.value)); setTalukas([]); setCities([]); }}
                  required
                  disabled={isActiveNow}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select State</option>
                  {states.map((s)=> (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District *</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={(e)=>{ handleChange(e); setTalukas(getTalukas(formData.state, e.target.value)); setCities([]); }}
                  required
                  disabled={isActiveNow || !formData.state}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select District</option>
                  {districts.map((d)=> (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taluka *</label>
                <select
                  name="taluka"
                  value={formData.taluka}
                  onChange={(e)=>{ handleChange(e); setCities(getPlaces(formData.state, formData.district, e.target.value)); }}
                  required
                  disabled={isActiveNow || !formData.district}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Taluka</option>
                  {talukas.map((t)=> (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Village / City *</label>
                <select
                  name="villageCity"
                  value={formData.villageCity}
                  onChange={handleChange}
                  required
                  disabled={isActiveNow || !formData.taluka}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select Village / City</option>
                  {cities.map((c)=> (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {isActiveNow ? (
                    <>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </>
                  ) : (
                    <>
                      <option value="draft">Draft</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={isActiveNow}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election Start Date *</label>
                <input
                  type="datetime-local"
                  name="votingStartDate"
                  value={formData.votingStartDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election End Date *</label>
                <input
                  type="datetime-local"
                  name="votingEndDate"
                  value={formData.votingEndDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Result Declaration Date *</label>
                <input
                  type="datetime-local"
                  name="resultDeclarationDate"
                  value={formData.resultDeclarationDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                disabled={isActiveNow}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Election'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminElectionsPage;



// View Election Modal Component
const ViewElectionModal = ({ election, onClose }) => {
  const formatDate = (date) => new Date(date).toLocaleString('en-IN');
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Election Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
            <div><span className="font-semibold">Title:</span> {election.title}</div>
            <div><span className="font-semibold">Panchayat:</span> {election.panchayatName || '-'}</div>
            <div><span className="font-semibold">State:</span> {election.state || '-'}</div>
            <div><span className="font-semibold">District:</span> {election.district || '-'}</div>
            <div><span className="font-semibold">Taluka:</span> {election.taluka || '-'}</div>
            <div><span className="font-semibold">Village/City:</span> {election.villageCity || '-'}</div>
            <div><span className="font-semibold">Description:</span> {election.description}</div>
            <div><span className="font-semibold">Start:</span> {formatDate(election.votingStartDate)}</div>
            <div><span className="font-semibold">End:</span> {formatDate(election.votingEndDate)}</div>
            <div><span className="font-semibold">Status:</span> {election.status}</div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};