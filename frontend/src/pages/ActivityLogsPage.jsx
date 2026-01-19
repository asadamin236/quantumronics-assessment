import React, { useEffect, useState } from 'react';
import api from '../auth/api';
import LogList from '../components/LogList';

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/logs', { params: { page: p, limit: 5, success: true } });
      setLogs(res.data.logs || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pages.push(i);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Activity Logs</h2>
        {error && <span className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm">{error}</span>}
      </div>
      <div className="overflow-x-auto">
        <LogList logs={logs} />
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            disabled={page <= 1 || loading}
            onClick={() => load(page - 1)}
          >
            Previous
          </button>
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`px-3 py-1 text-sm border rounded ${p === page ? 'bg-gray-900 text-white' : 'bg-white'}`}
              disabled={loading}
              onClick={() => load(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            disabled={page >= totalPages || loading}
            onClick={() => load(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
