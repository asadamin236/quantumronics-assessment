import React from 'react';

const iconColor = (success) => (success ? 'text-green-600' : 'text-red-600');

const LogList = ({ logs }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold">Login Activity</h3>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          {logs.map((l) => (
            <div key={l._id} className="flex gap-3">
              <div className={`mt-1 ${iconColor(l.success)}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div className="flex-1 border-b pb-3">
                <div className="flex justify-between">
                  <div className="font-medium">{l.email}</div>
                  <div className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="mr-2">Provider: {l.provider}</span>
                  <span className="mr-2">IP: {l.ip || 'N/A'}</span>
                  <span className="mr-2">UA: {l.userAgent?.slice(0, 40) || 'N/A'}...</span>
                  <span className={`ml-2 ${l.success ? 'text-green-600' : 'text-red-600'}`}>{l.success ? 'Success' : 'Failed'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogList;
