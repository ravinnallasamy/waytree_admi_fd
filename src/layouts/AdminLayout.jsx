import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard': return 'Pending Approvals';
            case '/admin/circles': return 'Verified Circles Library';
            case '/admin/create-circle': return 'Establish New Circle';
            case '/create-event': return 'Create New Event';
            case '/admin/events': return 'Verified Events';
            case '/admin/permission': return 'Pending Approvals';
            case '/admin/users': return 'Manage Connections';
            case '/admin/user-manipulation': return 'Manage Users';
            case '/settings': return 'Settings';
            default: return 'Admin Panel';
        }
    };


    return (
        <div className="flex min-h-screen bg-gray-50 font-sans relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 flex flex-col min-w-0 transition-all duration-300">
                <Header title={getPageTitle()} onMenuClick={toggleSidebar} />
                <main className="flex-1 p-4 md:p-8 overflow-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
