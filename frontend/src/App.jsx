import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import UsersPage from './pages/UsersPage'
import ActivityLogsPage from './pages/ActivityLogsPage'
import SecurityLogsPage from './pages/SecurityLogsPage'
import Layout from './components/Layout'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute role="Admin">
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/activitylogs" element={
            <ProtectedRoute role="Admin">
              <Layout>
                <ActivityLogsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/securitylogs" element={
            <ProtectedRoute role="Admin">
              <Layout>
                <SecurityLogsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<div className="p-6">Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
