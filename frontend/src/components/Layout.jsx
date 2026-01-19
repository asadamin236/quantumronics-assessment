import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 p-6 h-screen overflow-y-auto">{children}</div>
    </div>
  );
};

export default Layout;
