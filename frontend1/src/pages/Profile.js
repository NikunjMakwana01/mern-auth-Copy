import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../utils/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaMobile, 
  FaCalendar, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaMapMarkerAlt, 
  FaVenusMars,
  FaHome,
  FaBuilding,
  FaIdCard,
  FaCamera
} from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    gender: '',
    address: '',
    currentAddress: '',
    state: '',
    city: '',
    voterId: '',
    photo: ''
  });

  

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        mobile: user.mobile || '',
        gender: user.gender || 'prefer-not-to-say',
        address: user.address || '',
        currentAddress: user.currentAddress || '',
        state: user.state || '',
        city: user.city || '',
        voterId: user.voterId || '',
        photo: user.photo || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for voter ID
    if (name === 'voterId') {
      // Convert to uppercase and only allow letters and digits
      const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Check if any changes were made
    const hasChanges = 
      formData.fullName !== (user?.fullName || '') ||
      formData.mobile !== (user?.mobile || '') ||
      formData.gender !== (user?.gender || 'prefer-not-to-say') ||
      formData.address !== (user?.address || '') ||
      formData.currentAddress !== (user?.currentAddress || '') ||
      formData.state !== (user?.state || '') ||
      formData.city !== (user?.city || '') ||
      formData.voterId !== (user?.voterId || '') ||
      formData.photo !== (user?.photo || '');

    console.log('Change detection:', {
      formData,
      userData: {
        fullName: user?.fullName || '',
        mobile: user?.mobile || '',
        gender: user?.gender || 'prefer-not-to-say',
        address: user?.address || '',
        currentAddress: user?.currentAddress || '',
        state: user?.state || '',
        city: user?.city || '',
        voterId: user?.voterId || '',
        photo: user?.photo || ''
      },
      hasChanges
    });

    if (!hasChanges) {
      setMessage({ 
        type: 'error', 
        text: 'No changes were made to save.' 
      });
      setIsLoading(false);
      return;
    }

    console.log('Submitting profile data:', formData);

    try {
      const response = await updateProfile(formData);
      console.log('Profile update response:', response);
      
      if (response.success) {
        updateUser(response.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ 
          type: 'error', 
          text: response.message || 'Failed to update profile' 
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      mobile: user.mobile || '',
      gender: user.gender || 'prefer-not-to-say',
      address: user.address || '',
      currentAddress: user.currentAddress || '',
      state: user.state || '',
      city: user.city || '',
      voterId: user.voterId || '',
      photo: user.photo || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  // Validation function for voter ID
  const validateVoterId = (voterId) => {
    if (!voterId) return true; // Allow empty string for cancellation
    const voterIdRegex = /^[A-Z]{3}\d{7}$/;
    return voterIdRegex.test(voterId);
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }

      // Allow only JPG or PDF
      const isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg';
      const isPdf = file.type === 'application/pdf';
      if (!isJpg && !isPdf) {
        alert('Only JPG or PDF files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      if (isPdf) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  };

  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account information and preferences
          </p>
          {isEditing && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Edit Mode:</strong> You can now edit your profile information. Make your changes and click "Save" when done, or "Cancel" to discard changes.
              </p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Personal Details
              </h2>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 rounded-lg transition-colors duration-200"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors duration-200"
                    >
                      <FaSave className="w-4 h-4" />
                      <span>{isLoading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                    >
                      <FaTimes className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaUser className="inline w-4 h-4 mr-2 text-orange-500" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.fullName || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaMobile className="inline w-4 h-4 mr-2 text-orange-500" />
                  Mobile Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter mobile number"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.mobile || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaVenusMars className="inline w-4 h-4 mr-2 text-orange-500" />
                  Gender
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="prefer-not-to-say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium capitalize">
                    {user?.gender === 'prefer-not-to-say' ? 'Prefer not to say' : user?.gender || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaCalendar className="inline w-4 h-4 mr-2 text-orange-500" />
                  Date of Birth
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Date of birth cannot be changed after registration
                </p>
              </div>
            </div>
          </div>

{/* Voter ID and Photo Section */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Voter ID and Photo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Voter ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaIdCard className="inline w-4 h-4 mr-2 text-orange-500" />
                  Voter ID Number
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="voterId"
                      value={formData.voterId}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        formData.voterId && !validateVoterId(formData.voterId)
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., NNI1234567"
                      maxLength="10"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Format: 3 letters (A-Z) + 7 digits (0-9)
                    </p>
                    {formData.voterId && !validateVoterId(formData.voterId) && (
                      <p className="text-xs text-red-500 mt-1">
                        Invalid format. Use format like NNI1234567
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.voterId || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Photo/PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaCamera className="inline w-4 h-4 mr-2 text-orange-500" />
                  Document (JPG/PDF, max 2MB)
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.pdf"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                    {formData.photo && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>File selected</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                            className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                          >
                            Remove
                          </button>
                        </div>
                        {(/^data:image\//.test(formData.photo)) ? (
                          <div className="flex items-center space-x-3">
                            <img 
                              src={formData.photo} 
                              alt="Uploaded preview" 
                              className="w-32 h-32 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                            />
                            <a href={formData.photo} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline text-sm">View file</a>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">PDF</span>
                            <a href={formData.photo} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">View file</a>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allowed: JPG or PDF. Max size 2MB.
                    </p>
                  </div>
                ) : (
                  <div>
                    {user?.photo ? (
                      (/^data:image\//.test(user.photo)) ? (
                        <div className="flex items-center space-x-2">
                          <img 
                            src={user.photo} 
                            alt="User document" 
                            className="w-16 h-16 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Image uploaded</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">PDF</span>
                          <a href={user.photo} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline text-sm">View document</a>
                        </div>
                      )
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">
                        No document uploaded
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Address Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Address Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address as per Card */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaHome className="inline w-4 h-4 mr-2 text-orange-500" />
                  Address as per Card
                </label>
                {isEditing ? (
                  <>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your address as per official documents"
                    />
                    <div className="mt-2">
                      <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={formData.address === formData.currentAddress && formData.address !== ''}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                currentAddress: prev.address
                              }));
                            }
                          }}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span>Current address is same as address as per card</span>
                      </label>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.address || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Current Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaBuilding className="inline w-4 h-4 mr-2 text-orange-500" />
                  Current Address
                </label>
                {isEditing ? (
                  <>
                    <textarea
                      name="currentAddress"
                      value={formData.currentAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your current residential address"
                    />
                    {formData.address === formData.currentAddress && formData.address !== '' && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Same as address as per card</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.currentAddress || 'Not provided'}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaMapMarkerAlt className="inline w-4 h-4 mr-2 text-orange-500" />
                  State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your state"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.state || 'Not provided'}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaMapMarkerAlt className="inline w-4 h-4 mr-2 text-orange-500" />
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your city"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user?.city || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          

          {/* Account Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Account Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FaEnvelope className="inline w-4 h-4 mr-2 text-orange-500" />
                  Email Address
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {user?.email || 'Not provided'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed after registration
                </p>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type
                </label>
                <p className="text-gray-900 dark:text-white font-medium capitalize">
                  {user?.role || 'Voter'}
                </p>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Member Since
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {/* Last Updated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Updated
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Change Password removed */}


        </form>
      </div>
    </div>
  );
};

export default Profile;
