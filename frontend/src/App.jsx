// src/App.jsx - FINAL COMPLETE VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import style from "./App.module.css"

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { LoadingProvider } from './context/LoadingContext';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Pages
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Hostel Pages
import Hostels from './pages/hostels/Hostels';
import HostelDetail from './pages/hostels/HostelDetail';
import AddHostel from './pages/hostels/AddHostel';
import EditHostel from './pages/hostels/EditHostel';
import MyHostels from './pages/hostels/MyHostels';

// Booking Pages
import Bookings from './pages/bookings/Bookings';
import BookingDetail from './pages/bookings/BookingDetail';
import PaymentSuccess from './pages/bookings/PaymentSuccess';
import PaymentFailed from './pages/bookings/PaymentFailed';

// Message Pages
import Messages from './pages/messages/Messages';
import NewMessage from './pages/messages/NewMessage';

// Profile Pages
import Profile from './pages/profile/Profile';
import ChangePassword from './pages/profile/ChangePassword';

// Public Pages
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <LoadingProvider>
              <Toaster position="top-right" />
              
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/owner-dashboard" element={
                    <RoleRoute allowedRoles={['owner', 'admin']}>
                      <OwnerDashboard />
                    </RoleRoute>
                  } />
                  <Route path="/admin-dashboard" element={
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  } />
                  
                  {/* Hostels */}
                  <Route path="/hostels" element={<Hostels />} />
                  <Route path="/hostels/:id" element={<HostelDetail />} />
                  <Route path="/add-hostel" element={
                    <RoleRoute allowedRoles={['owner', 'admin']}>
                      <AddHostel />
                    </RoleRoute>
                  } />
                  <Route path="/edit-hostel/:id" element={
                    <RoleRoute allowedRoles={['owner', 'admin']}>
                      <EditHostel />
                    </RoleRoute>
                  } />
                  <Route path="/my-hostels" element={
                    <RoleRoute allowedRoles={['owner', 'admin']}>
                      <MyHostels />
                    </RoleRoute>
                  } />
                  
                  {/* Bookings */}
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/bookings/:id" element={<BookingDetail />} />
                  <Route path="/payment-success/:id" element={<PaymentSuccess />} />
                  <Route path="/payment-failed/:id" element={<PaymentFailed />} />
                  
                  {/* Messages */}
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:userId" element={<Messages />} />
                  <Route path="/messages/new" element={<NewMessage />} />
                  <Route path="/messages/new/:recipientId" element={<NewMessage />} />
                  
                  {/* Profile */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </LoadingProvider>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;