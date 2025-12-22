import React from 'react';
import { X, Mail, MapPin, Briefcase, Calendar, Shield, Globe, Target, User } from 'lucide-react';

const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pb-6">
                    <div className="relative -mt-16 mb-4">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-gray-400" />
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-gray-500 capitalize">{user.role}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Mail className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                                    <p className="text-sm text-gray-900 font-medium truncate max-w-[120px]" title={user.email}>{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">Location</p>
                                    <p className="text-sm text-gray-900 font-medium truncate max-w-[120px]" title={user.location}>{user.location || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Briefcase className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">Company</p>
                                    <p className="text-sm text-gray-900 font-medium truncate max-w-[120px]" title={user.company}>{user.company || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Shield className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase">Status</p>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' :
                                        user.connectionStatus === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {user.connectionStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {user.oneLiner && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">One Liner</p>
                                <p className="text-sm text-gray-900 italic">"{user.oneLiner}"</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target className="w-4 h-4 text-indigo-600" />
                                    <p className="text-xs text-gray-500 font-medium uppercase">Primary Goal</p>
                                </div>
                                <p className="text-sm text-gray-900 font-medium capitalize">{user.primaryGoal || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Connections</p>
                                <p className="text-sm text-gray-900 font-medium">{user.connectionCount || 0}</p>
                            </div>
                        </div>

                        {user.website && (
                            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Globe className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-500 font-medium uppercase">Website</p>
                                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate block">
                                        {user.website}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
