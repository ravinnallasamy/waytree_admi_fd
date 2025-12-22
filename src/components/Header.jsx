import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title, onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
            <div className="flex items-center gap-3 md:gap-0">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 mr-2 md:hidden text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-gray-500">{user?.role === 'superadmin' ? 'Super Administrator' : 'Administrator'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        {user?.photoUrl ? (
                            <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-indigo-600 font-bold">{user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'A')}</span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
