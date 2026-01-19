import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-60 p-6">{children}</div>
    </div>
  );
};

export default Layout;
