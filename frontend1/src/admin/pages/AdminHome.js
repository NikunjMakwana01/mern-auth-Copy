import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FaUser, FaEnvelope, FaMobileAlt } from 'react-icons/fa';

const AdminHome = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait a bit for AdminLayout to finish auth check
    const loadAdmin = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/api/admin-auth/me');
        if (res.data?.success && res.data?.data?.admin) {
          setAdmin(res.data.data.admin);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          setError('Session expired. Please login again.');
        } else {
          // Network error - retry once
          console.warn('Failed to load admin info, retrying...');
          setTimeout(async () => {
            try {
              const retryRes = await api.get('/api/admin-auth/me');
              if (retryRes.data?.success && retryRes.data?.data?.admin) {
                setAdmin(retryRes.data.data.admin);
                setError(null);
              } else {
                setError('Failed to load admin info');
              }
            } catch (retryError) {
              setError('Network error. Please refresh the page.');
            } finally {
              setLoading(false);
            }
          }, 2000);
          return; // Don't set loading to false yet
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Small delay to ensure AdminLayout auth is ready
    const timer = setTimeout(loadAdmin, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Home</h1>
        <p className="text-slate-600 mt-2">Quick overview and shortcuts.</p>
      </div>

      <aside className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Your Profile</h2>
          {loading ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                  <FaUser className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-slate-900 dark:text-slate-100 font-medium">
                    {admin?.fullName || 'Admin'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Administrator</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className="text-slate-500" />
                <span className="text-slate-800 dark:text-slate-200 text-sm">{admin?.email || '-'}</span>
              </div>

              <div className="flex items-center gap-3">
                <FaMobileAlt className="text-slate-500" />
                <span className="text-slate-800 dark:text-slate-200 text-sm">{admin?.mobile || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default AdminHome;


