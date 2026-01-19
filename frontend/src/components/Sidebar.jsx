import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/contextCore';

const NavItem = ({ to, label, hidden }) => {
  if (hidden) return null;
  return (
    <Link className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100" to={to}>
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'User';
  return (
    <div className="fixed left-0 top-0 h-screen w-60 bg-white border-r shadow-sm p-4">
      <div className="text-xl font-bold mb-6">Enterprise</div>
      <nav className="space-y-2">
        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/users" label="User Management" hidden={role === 'User'} />
        <NavItem to="/activitylogs" label="Activity Logs" hidden={role === 'User'} />
        <NavItem to="/securitylogs" label="Security Settings" hidden={role !== 'Admin'} />
      </nav>
    </div>
  );
};

export default Sidebar;
