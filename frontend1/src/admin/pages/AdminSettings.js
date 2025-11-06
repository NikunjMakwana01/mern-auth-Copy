import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminSettings = () => {
  const { logout } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <div className="mt-4">
        <button onClick={logout} className="px-4 py-2 rounded bg-red-600 text-white">Logout</button>
      </div>
    </div>
  );
};

export default AdminSettings;


