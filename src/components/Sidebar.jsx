import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Calendar, Users, CheckCircle, AlertCircle, X, Shield, Database, UserCog, Network } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

import { useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { icon: AlertCircle, label: 'Pending Approvals', path: '/dashboard' },
        { icon: LayoutDashboard, label: 'Verified Circles', path: '/admin/circles' },
        { icon: PlusCircle, label: 'Create Circle', path: '/admin/create-circle' },
        { icon: Network, label: 'User Connections', path: '/admin/users?type=user' },
        { icon: Calendar, label: 'Circle Members', path: '/admin/users?type=event' },
        { icon: Users, label: 'Manage Users', path: '/admin/user-manipulation' },
        { icon: Shield, label: 'Admin Management', path: '/admin/management', superOnly: true },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];



    const filteredNavItems = navItems.filter(item => {
        if (item.superOnly && user?.role !== 'superadmin') return false;
        return true;
    });

    const isLinkActive = (itemPath) => {
        const currentPath = location.pathname + location.search;
        if (itemPath.includes('?')) {
            return currentPath === itemPath;
        }
        return location.pathname === itemPath || (location.pathname.startsWith(itemPath) && itemPath !== '/');
    };

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="p-6 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">EventAdmin</span>
                </div>
                <button
                    onClick={onClose}
                    className="md:hidden p-1 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={() =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isLinkActive(item.path)
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
