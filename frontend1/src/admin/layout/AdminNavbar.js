import React from 'react';

const AdminNavbar = ({ onToggleSidebar }) => {
  return (
    <header className="bg-slate-900 text-slate-100 shadow">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden px-2 py-1 rounded bg-slate-800"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="font-bold tracking-wide text-xl">DigiVote Admin Dashboard</div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;


