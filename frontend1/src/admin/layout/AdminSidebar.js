import React from 'react';
import { NavLink } from 'react-router-dom';

const linkBase = "block px-3 py-2 rounded text-sm text-slate-200 hover:bg-slate-700";
const active = "bg-slate-800";

const AdminSidebar = ({ onNavigate }) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 p-4 space-y-2 h-full">
      <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Menu</div>
      <NavLink to="/admin" end onClick={onNavigate} className={({isActive})=>isActive?`${linkBase} ${active}`:linkBase}>Home</NavLink>
      <NavLink to="/admin/users" onClick={onNavigate} className={({isActive})=>isActive?`${linkBase} ${active}`:linkBase}>Manage Users</NavLink>
      <NavLink to="/admin/elections" onClick={onNavigate} className={({isActive})=>isActive?`${linkBase} ${active}`:linkBase}>Manage Elections</NavLink>
      <NavLink to="/admin/election-history" onClick={onNavigate} className={({isActive})=>isActive?`${linkBase} ${active}`:linkBase}>Election History</NavLink>
      <NavLink to="/admin/candidates" onClick={onNavigate} className={({isActive})=>isActive?`${linkBase} ${active}`:linkBase}>Manage Candidates</NavLink>
      <NavLink to="/admin/results" onClick={onNavigate} className={({isActive})=>isActive?`${linkBase} ${active}`:linkBase}>Manage Results</NavLink>
      <NavLink to="/admin/settings" onClick={onNavigate} className={({isActive})=>isActive?`${linkBase} ${active}`:linkBase}>Settings</NavLink>
    </aside>
  );
};

export default AdminSidebar;


