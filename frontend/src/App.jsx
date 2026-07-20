import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import SlotBookingFlow from './pages/SlotBookingFlow';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminHotels from './pages/AdminHotels';
import AdminPrasadam from './pages/AdminPrasadam';
import AdminPooja from './pages/AdminPooja';
import AdminVisitors from './pages/AdminVisitors';
import AdminReports from './pages/AdminReports';

// 1. Auth Guard for Devotees/Users
function UserRouteGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'user') {
    return <Navigate to="/admin" replace />;
  }

  return <Layout>{children}</Layout>;
}

// 2. Auth Guard for Admins
function AdminRouteGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

// 3. Prevent Logged In Users from seeing Login
function PublicRouteGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-500" />
      </div>
    );
  }

  if (user) {
    return user.role === 'admin' 
      ? <Navigate to="/admin" replace /> 
      : <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Portal (Login/Register) */}
            <Route 
              path="/login" 
              element={
                <PublicRouteGuard>
                  <Login />
                </PublicRouteGuard>
              } 
            />

            {/* Devotee Dashboard & Booking flow */}
            <Route 
              path="/dashboard" 
              element={
                <UserRouteGuard>
                  <UserDashboard />
                </UserRouteGuard>
              } 
            />
            <Route 
              path="/book" 
              element={
                <UserRouteGuard>
                  <SlotBookingFlow />
                </UserRouteGuard>
              } 
            />

            {/* Admin Management portals */}
            <Route 
              path="/admin" 
              element={
                <AdminRouteGuard>
                  <AdminDashboard />
                </AdminRouteGuard>
              } 
            />
            <Route 
              path="/admin/bookings" 
              element={
                <AdminRouteGuard>
                  <AdminBookings />
                </AdminRouteGuard>
              } 
            />
            <Route 
              path="/admin/hotels" 
              element={
                <AdminRouteGuard>
                  <AdminHotels />
                </AdminRouteGuard>
              } 
            />
            <Route 
              path="/admin/prasadam" 
              element={
                <AdminRouteGuard>
                  <AdminPrasadam />
                </AdminRouteGuard>
              } 
            />
            <Route 
              path="/admin/pooja" 
              element={
                <AdminRouteGuard>
                  <AdminPooja />
                </AdminRouteGuard>
              } 
            />
            <Route 
              path="/admin/visitors" 
              element={
                <AdminRouteGuard>
                  <AdminVisitors />
                </AdminRouteGuard>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <AdminRouteGuard>
                  <AdminReports />
                </AdminRouteGuard>
              } 
            />

            {/* Fallbacks */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
