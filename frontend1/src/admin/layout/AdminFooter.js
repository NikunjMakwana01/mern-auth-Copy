import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-300 mt-auto border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm">
        <p className="font-medium">© {new Date().getFullYear()} DigiVote Admin Console</p>
        <p className="text-slate-500 mt-1">All rights reserved</p>
      </div>
    </footer>
  );
};

export default AdminFooter;


