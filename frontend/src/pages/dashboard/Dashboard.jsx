// src/pages/dashboard/Dashboard.jsx - STYLED & ENHANCED
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../api';
import { Link } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaChartBar, FaCalendar, FaMoneyBill, FaStar, FaSpinner } from 'react-icons/fa';
import "./Dashboard.css"

// --- Sub-Component for Loading State ---
const LoadingState = () => (
    <div className="hostelhub-loading-state flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
        <FaSpinner className="animate-spin text-4xl text-teal-500" />
        <p className="ml-4 text-gray-600">Loading dashboard...</p>
    </div>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
    const { user } = useAuth();
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch bookings with hostel data populated (assuming API supports this)
            const bookingsResponse = await bookingsAPI.getBookings({ limit: 5, populate: 'hostel' });
            setRecentBookings(bookingsResponse.data.bookings || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Non-critical error, but log it
        } finally {
            setLoading(false);
        }
    };

    const getRoleStats = () => {
        // Stats are initialized to zero/default values
        // NOTE: Real-world implementation requires dedicated API endpoints for these counts/sums.
        
        switch (user.role) {
            case 'student':
                const successfulBookings = recentBookings.filter(b => b.paymentStatus === 'success');
                const totalSpent = successfulBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
                
                return [
                    { title: 'Active Bookings', value: successfulBookings.length, icon: <FaCalendar /> },
                    { title: 'Total Spent', value: `GH₵${totalSpent.toFixed(2)}`, icon: <FaMoneyBill /> },
                    { title: 'Reviews Given', value: '0', icon: <FaStar /> } // Placeholder
                ];
            
            case 'owner':
                return [
                    { title: 'My Hostels', value: '0', icon: <FaHome /> }, // Placeholder
                    { title: 'Total Bookings', value: '0', icon: <FaCalendar /> }, // Placeholder
                    { title: 'Total Revenue', value: 'GH₵0', icon: <FaMoneyBill /> } // Placeholder
                ];
            
            case 'admin':
                return [
                    { title: 'Total Users', value: '0', icon: <FaUser /> }, // Placeholder
                    { title: 'Total Hostels', value: '0', icon: <FaHome /> }, // Placeholder
                    { title: 'Total Bookings', value: '0', icon: <FaCalendar /> } // Placeholder
                ];
            
            default:
                return [];
        }
    };

    if (loading) {
        return <LoadingState />;
    }
    
    // --- Helper Component for Quick Action Links ---
    const QuickActionButton = ({ to, Icon, label }) => (
        <Link to={to} className="hostelhub-quick-action flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 text-teal-600">
            <Icon className="hostelhub-quick-action-icon text-3xl mb-2" />
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );

    // --- Helper Component for Stat Card ---
    const StatCard = ({ title, value, icon }) => (
        <div className="hostelhub-stat-card p-6 bg-white rounded-lg shadow-lg border-t-4 border-teal-500">
            <div className="hostelhub-stat-icon text-4xl text-teal-500 mb-2">{icon}</div>
            <p className="hostelhub-stat-value text-3xl font-bold text-gray-800">{value}</p>
            <h3 className="hostelhub-stat-title text-sm uppercase tracking-wider text-gray-500">{title}</h3>
        </div>
    );
    
    // --- Render Logic ---
    return (
        <div className="hostelhub-dashboard p-6 md:p-10 bg-gray-50 min-h-screen">
            
            {/* Header Section */}
            <div className="hostelhub-dashboard-header mb-8 border-b pb-4">
                <h1 className="hostelhub-dashboard-title text-3xl font-bold text-gray-800">
                    Welcome back, {user.name}!
                </h1>
                <p className="hostelhub-dashboard-subtitle text-gray-600 mt-1">
                    {user.role === 'student' ? 'Track your bookings and discover new hostels.'
                        : user.role === 'owner' ? 'Manage your listed hostels and view booking performance.'
                        : 'System-wide overview and administrative controls.'}
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="hostelhub-dashboard-quick-actions grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <QuickActionButton to="/hostels" Icon={FaHome} label="Browse Hostels" />
                <QuickActionButton to="/bookings" Icon={FaBook} label="My Bookings" />
                <QuickActionButton to="/profile" Icon={FaUser} label="Profile" />

                {user.role === 'owner' && (
                    <QuickActionButton to="/add-hostel" Icon={FaHome} label="Add Hostel" />
                )}
                
                {user.role === 'admin' && (
                    <QuickActionButton to="/admin-dashboard" Icon={FaChartBar} label="Admin Panel" />
                )}
            </div>

            {/* Stats Grid */}
            <div className="hostelhub-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {getRoleStats().map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Recent Bookings Section (Student Role) */}
            {user.role === 'student' && recentBookings.length > 0 && (
                <div className="hostelhub-recent-section">
                    <h2 className="hostelhub-section-title text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
                        Recent Bookings
                    </h2>
                    <div className="hostelhub-recent-bookings space-y-4">
                        {recentBookings.slice(0, 3).map(booking => (
                            <div key={booking._id} className="hostelhub-booking-item flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-teal-500 transition duration-300">
                                <div className="hostelhub-booking-info">
                                    <h4 className="hostelhub-booking-hostel text-lg font-semibold text-gray-800">
                                        {booking.hostel?.name || 'Hostel Not Found'}
                                    </h4>
                                    <p className="hostelhub-booking-date text-sm text-gray-500">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    <p className="hostelhub-booking-status text-sm">
                                        Status: 
                                        <span className={`hostelhub-status-${booking.paymentStatus} font-semibold text-xs ml-2 px-2 py-0.5 rounded-full ${booking.paymentStatus === 'success' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'}`}>
                                            {booking.paymentStatus}
                                        </span>
                                    </p>
                                    <Link to={`/bookings/${booking._id}`} className="hostelhub-booking-view text-sm text-teal-600 font-medium hover:text-teal-800">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                        <Link to="/bookings" className="text-teal-600 hover:text-teal-800 font-medium">
                            View All Bookings &rarr;
                        </Link>
                    </div>
                </div>
            )}
            
            {/* Fallback for other roles/no bookings */}
            {user.role !== 'student' && (
                 <div className="hostelhub-recent-section">
                    <h2 className="hostelhub-section-title text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
                        {user.role === 'owner' ? 'Recent Activity' : 'Admin Tools'}
                    </h2>
                    <div className="p-6 bg-white rounded-lg text-center text-gray-500">
                        No recent data to display for your role.
                    </div>
                 </div>
            )}
            
        </div>
    );
};

export default Dashboard;