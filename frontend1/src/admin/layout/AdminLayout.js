import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';
import AdminSidebar from './AdminSidebar';
import { Navigate } from 'react-router-dom';
import api from '../../utils/api';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsLoading(false);
        setIsAuthed(false);
        return;
      }
      
      // Set token in headers first
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        const response = await api.get('/api/admin-auth/me');
        if (response.data?.success && response.data?.data?.admin) {
          setIsAuthed(true);
        } else {
          // Invalid response format
          localStorage.removeItem('adminToken');
          delete api.defaults.headers.common['Authorization'];
          setIsAuthed(false);
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401 || status === 403) {
          // Unauthorized - clear token and redirect
          localStorage.removeItem('adminToken');
          delete api.defaults.headers.common['Authorization'];
          setIsAuthed(false);
        } else {
          // Network/server error - retry once after delay
          console.warn('Network error during admin auth check, retrying...');
          setTimeout(async () => {
            try {
              const retryResponse = await api.get('/api/admin-auth/me');
              if (retryResponse.data?.success && retryResponse.data?.data?.admin) {
                setIsAuthed(true);
              } else {
                throw new Error('Invalid response format');
              }
            } catch (retryError) {
              const retryStatus = retryError?.response?.status;
              if (retryStatus === 401 || retryStatus === 403) {
                localStorage.removeItem('adminToken');
                delete api.defaults.headers.common['Authorization'];
                setIsAuthed(false);
              } else {
                // Network error - keep token but assume authenticated for now
                console.warn('Retry failed, keeping admin session');
                setIsAuthed(true);
              }
            } finally {
              setIsLoading(false);
            }
          }, 2000);
          return; // Don't set loading to false yet, wait for retry
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAuth();
  }, []);

  // Prevent browser back navigation when pressing Backspace outside inputs
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Backspace') return;
      const target = e.target;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable === true
      );
      if (!isInput) {
        e.preventDefault();
      } else if ((target.readOnly || target.disabled)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      <AdminNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 relative">
        {/* Sidebar: fixed on md+, overlay drawer on small screens */}
        <div className={`
          md:static md:translate-x-0 md:block
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-200 ease-out
          absolute z-40 h-full md:h-auto
        `}
        >
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 p-6 md:ml-0">{children}</main>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;


