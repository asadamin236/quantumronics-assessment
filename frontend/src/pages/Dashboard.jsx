import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/contextCore';
import api from '../auth/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ users: 0, recentLogins: 0, securityAlerts: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (user?.role !== 'Admin') return;
      try {
        const res = await api.get('/admin/data');
        const s = res.data?.stats || {};
        setStats({
          users: s.users || 0,
          recentLogins: s.recentLogins || 0,
          securityAlerts: s.securityAlerts || 0
        });
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load dashboard stats');
      }
    };
    load();
  }, [user]);

  const roleBadge = (role) => {
    if (role === 'Admin') return 'bg-purple-100 text-purple-700';
    if (role === 'Manager') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="text-sm text-gray-600">Welcome, {user?.name}</div>
        </div>
        <button className="bg-red-600 text-white px-3 py-2 rounded" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
        <div className="font-medium">{user?.name}</div>
        <span className={`px-2 py-1 rounded-full text-xs ${roleBadge(user?.role)}`}>{user?.role}</span>
        <div className="text-gray-600">{user?.email}</div>
      </div>

      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

      {user?.role === 'Admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.users}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-500">Recent Logins (24h)</div>
            <div className="text-2xl font-bold text-green-600">{stats.recentLogins}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-500">Security Alerts</div>
            <div className="text-2xl font-bold text-red-600">{stats.securityAlerts}</div>
          </div>
        </div>
      )}

      {user?.role !== 'Admin' && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-lg font-semibold">Welcome</div>
          <div className="text-sm text-gray-600">
            Contact an administrator if you need access to user or security reports.
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

