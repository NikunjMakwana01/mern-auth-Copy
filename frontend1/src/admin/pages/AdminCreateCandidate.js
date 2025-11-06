import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { getStates, getDistricts, getTalukas, getPlaces } from '../../utils/indiaLocations';
import { toast } from 'react-hot-toast';

const AdminCreateCandidate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    village: '',
    electionCardNumber: '',
    electionCardPhoto: '',
    candidatePhoto: '',
    partyName: '',
    partySymbol: '',
    contactNumber: '',
    email: '',
    state: '',
    district: '',
    taluka: '',
    notes: ''
  });
  const [states] = useState(getStates());
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields on frontend first
      if (!formData.name || !formData.name.trim()) {
        setError('Candidate name is required');
        setLoading(false);
        return;
      }
      if (!formData.village || !formData.village.trim()) {
        setError('Village is required');
        setLoading(false);
        return;
      }
      if (!formData.electionCardNumber || !formData.electionCardNumber.trim()) {
        setError('Election card number is required');
        setLoading(false);
        return;
      }
      if (!formData.partyName || !formData.partyName.trim()) {
        setError('Party name is required');
        setLoading(false);
        return;
      }

      // Prepare candidate data - ensure all required fields are strings
      const candidateData = {
        name: String(formData.name || '').trim(),
        village: String(formData.village || '').trim(),
        electionCardNumber: String(formData.electionCardNumber || '').trim().toUpperCase(),
        partyName: String(formData.partyName || '').trim(),
        candidatePhoto: formData.candidatePhoto || undefined,
        partySymbol: formData.partySymbol || undefined,
        contactNumber: formData.contactNumber ? formData.contactNumber.trim() : undefined,
        email: formData.email ? formData.email.trim() : undefined,
        state: formData.state ? formData.state.trim() : undefined,
        district: formData.district ? formData.district.trim() : undefined,
        taluka: formData.taluka ? formData.taluka.trim() : undefined,
        notes: formData.notes ? formData.notes.trim() : undefined,
        status: 'active' // Default status
      };
      
      // Only include electionCardPhoto if provided (backend might not expect this field)
      if (formData.electionCardPhoto) {
        candidateData.electionCardPhoto = formData.electionCardPhoto;
      }
      
      console.log('Submitting candidate data:', candidateData);
      console.log('Form data before submission:', formData);
      const response = await api.post('/api/candidates', candidateData);
      console.log('Response:', response.data);
      toast.success('Candidate created successfully');
      navigate('/admin/candidates');
    } catch (e) {
      console.error('Error response:', e.response);
      console.error('Error data:', e.response?.data);
      const errorMessage = e.response?.data?.message || e.message || 'Failed to create candidate';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format Election card number (uppercase, specific format)
    if (name === 'electionCardNumber') {
      const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Update form data - keep dropdown values as-is, trim text inputs
    if (name === 'village' || name === 'state' || name === 'district' || name === 'taluka') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value.trim() }));
    }

    // Handle location cascading
    if (name === 'state') {
      const newDistricts = getDistricts(value);
      setDistricts(newDistricts);
      setFormData(prev => ({ ...prev, district: '', taluka: '', village: '' }));
      setTalukas([]);
      setVillages([]);
    }
    if (name === 'district') {
      const newTalukas = getTalukas(formData.state, value);
      setTalukas(newTalukas);
      setFormData(prev => ({ ...prev, taluka: '', village: '' }));
      setVillages([]);
    }
    if (name === 'taluka') {
      const newVillages = getPlaces(formData.state, formData.district, value);
      setVillages(newVillages);
      setFormData(prev => ({ ...prev, village: '' }));
    }
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size should be less than 2MB');
      return;
    }

    // Allow only image or PDF
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      toast.error('Only image (JPG, PNG) or PDF files are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/candidates')}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Candidates
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Candidate</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    maxLength="10"
                    pattern="[6-9]\d{9}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="10-digit mobile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Election Card Number * (e.g., NNI1234567)
                  </label>
                  <input
                    type="text"
                    name="electionCardNumber"
                    value={formData.electionCardNumber}
                    onChange={handleChange}
                    required
                    maxLength="10"
                    pattern="[A-Z]{3}\d{7}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
                    placeholder="NNI1234567"
                  />
                  {formData.electionCardNumber && !/^[A-Z]{3}\d{7}$/.test(formData.electionCardNumber) && (
                    <p className="text-xs text-red-500 mt-1">Format: 3 letters + 7 digits</p>
                  )}
                </div>
              </div>
            </div>

            {/* Election Card Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Election Card Photo (Image/PDF, max 2MB)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e, 'electionCardPhoto')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {formData.electionCardPhoto && (
                <div className="mt-2">
                  {formData.electionCardPhoto.startsWith('data:image/') ? (
                    <img src={formData.electionCardPhoto} alt="Election Card Preview" className="h-20 w-32 object-cover rounded border" />
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400">PDF uploaded</span>
                  )}
                </div>
              )}
            </div>

            {/* Location Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Location Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    District *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    disabled={!formData.state}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Taluka *
                  </label>
                  <select
                    name="taluka"
                    value={formData.taluka}
                    onChange={handleChange}
                    required
                    disabled={!formData.district}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select Taluka</option>
                    {talukas.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Village *
                  </label>
                  <select
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                    disabled={!formData.taluka}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select Village</option>
                    {villages.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Party Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Party Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Party Name *
                  </label>
                  <input
                    type="text"
                    name="partyName"
                    value={formData.partyName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Party Symbol (Image/PDF, max 2MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'partySymbol')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {formData.partySymbol && (
                    <div className="mt-2">
                      {formData.partySymbol.startsWith('data:image/') ? (
                        <img src={formData.partySymbol} alt="Party Symbol Preview" className="h-16 w-16 object-contain rounded border" />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">PDF uploaded</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Right Column - Candidate Photo Upload */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 max-h-[calc(100vh-8rem)]">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                  Candidate Photo *
                </label>
                <div className="flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'candidatePhoto')}
                    className="hidden"
                    id="candidatePhotoInput"
                    required
                  />
                  <label
                    htmlFor="candidatePhotoInput"
                    className="cursor-pointer w-full flex justify-center"
                  >
                    {formData.candidatePhoto ? (
                      <div className="text-center">
                        <img
                          src={formData.candidatePhoto}
                          alt="Candidate Preview"
                          className="mx-auto h-40 w-40 object-cover rounded-full border-4 border-gray-300 dark:border-gray-600 shadow-lg"
                        />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Click to change</p>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-full p-6 text-center hover:border-blue-500 transition-colors w-40 h-40 flex flex-col items-center justify-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Upload Photo</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Max 2MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/admin/candidates')}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Candidate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateCandidate;

