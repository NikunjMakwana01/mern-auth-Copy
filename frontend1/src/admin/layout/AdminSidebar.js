import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaUsers, FaVoteYea, FaHistory, FaUserTie, 
  FaChartBar, FaBell, FaUserShield, FaCog 
} from 'react-icons/fa';

const AdminSidebar = ({ onNavigate }) => {
  const linkBase = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all duration-200";
  const active = "bg-slate-800 text-white shadow-md";

  const menuItems = [
    { to: "/admin", icon: FaHome, label: "Home", end: true },
    { to: "/admin/users", icon: FaUsers, label: "Manage Users" },
    { to: "/admin/elections", icon: FaVoteYea, label: "Manage Elections" },
    { to: "/admin/election-history", icon: FaHistory, label: "Election History" },
    { to: "/admin/candidates", icon: FaUserTie, label: "Manage Candidates" },
    { to: "/admin/results", icon: FaChartBar, label: "Manage Results" },
    { to: "/admin/notifications", icon: FaBell, label: "Notifications" },
    { to: "/admin/access-roles", icon: FaUserShield, label: "Access & Roles" },
    { to: "/admin/settings", icon: FaCog, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Navigation</div>
        <div className="text-xs text-slate-500">Admin Panel</div>
      </div>
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : ''}`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex-shrink-0">
        <div className="text-xs text-slate-500 text-center">
          DigiVote Admin v1.0
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;


