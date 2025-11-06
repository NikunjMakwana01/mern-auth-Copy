import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs">
        © {new Date().getFullYear()} DigiVote Admin Console
      </div>
    </footer>
  );
};

export default AdminFooter;


