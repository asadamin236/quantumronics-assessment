import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64 p-6 h-screen overflow-y-auto">{children}</div>
    </div>
  );
};

export default Layout;
