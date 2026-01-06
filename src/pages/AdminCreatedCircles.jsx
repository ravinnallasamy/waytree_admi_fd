import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    Search,
    Filter,
    MoreVertical,
    MapPin,
    Users,
    CheckCircle,
    Clock,
    PlusCircle,
    FileText,
    Edit,
    X
} from 'lucide-react';

const AdminCreatedCircles = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();

    // Default to event (not community), but listen to query param
    const typeParam = searchParams.get('type');
    const [activeType, setActiveType] = useState(typeParam || 'event');

    // Sub Tabs based on Type
    // Events: 'pending', 'upcoming', 'completed'
    // Communities: 'pending', 'accepted'
    const [activeTab, setActiveTab] = useState('pending');

    const [searchTerm, setSearchTerm] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalEvents: 0
    });

    // Update URL when Type switches
    useEffect(() => {
        setSearchParams({ type: activeType });
        setActiveTab('pending'); // Reset sub-tab on type switch
    }, [activeType]);

    useEffect(() => {
        fetchData();
    }, [activeType, activeTab, pagination.currentPage, searchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const isCommunity = activeType === 'community';

            const params = {
                page: pagination.currentPage,
                limit: 10,
                isAdmin: 'true', // Strict Admin Filter
                search: searchTerm,
                includeDisabled: 'true'
            };

            // Set Type Filter
            params.isCommunity = isCommunity ? 'true' : 'false';
            params.isEvent = !isCommunity ? 'true' : 'false';

            // Refined Logic based on Tabs:
            if (activeTab === 'pending') {
                params.isVerified = 'false';
            } else {
                params.isVerified = 'true';

                // Date Filtering for Events
                if (!isCommunity) {
                    if (activeTab === 'upcoming') {
                        params.timeFilter = 'upcoming';
                    } else if (activeTab === 'completed') {
                        params.timeFilter = 'past';
                    }
                }
            }

            console.log('🔍 [FRONTEND] Fetching with params:', params);
            const data = await api.get('/api/events', { params });

            setEvents(data.events || []);
            setPagination({
                currentPage: data.currentPage || 1,
                totalPages: data.totalPages || 1,
                totalEvents: data.totalEvents || 0
            });
        } catch (error) {
            console.error('Error fetching admin circles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, eventId) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete this? This action cannot be undone.`)) return;

        try {
            await api.delete(`/events/${eventId}`);
            setEvents(events.filter(ev => ev._id !== eventId));
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete item');
        }
    };

    return (
        <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
            {/* Main Type Toggles (Event vs Community) */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm w-fit border border-gray-100">
                <button
                    onClick={() => setActiveType('event')}
                    className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeType === 'event'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <Calendar size={18} />
                    Events
                </button>
                <button
                    onClick={() => setActiveType('community')}
                    className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeType === 'community'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <Users size={18} />
                    Communities
                </button>
            </div>

            {/* Sub Tabs (Pending, Upcoming, etc) */}
            <div className="flex border-b border-gray-200 gap-8">
                {activeType === 'event' ? (
                    <>
                        {['pending', 'upcoming', 'completed'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </>
                ) : (
                    <>
                        {['pending', 'accepted'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </>
                )}
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />)}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        {activeType === 'event' ? <Calendar size={30} /> : <Users size={30} />}
                    </div>
                    <h3 className="text-gray-900 font-semibold">No {activeTab} {activeType}s</h3>
                    <p className="text-gray-500 text-sm mt-1">There are no items in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {events.map((item) => (
                        <div key={item._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                {/* Date/Time Block or Image */}
                                <div className="w-16 flex-shrink-0 text-center">
                                    <div className="text-xs font-bold text-red-500 uppercase tracking-wide">
                                        {item.dateTime ? new Date(item.dateTime).toLocaleString('default', { month: 'short' }) : 'N/A'}
                                    </div>
                                    <div className="text-2xl font-black text-gray-900">
                                        {item.dateTime ? new Date(item.dateTime).getDate() : '?'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                    <div className="mt-1 flex flex-col gap-1 text-sm text-gray-500">
                                        {item.dateTime && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-gray-400" />
                                                {new Date(item.dateTime).toLocaleDateString()} • {new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                                            <span className="line-clamp-1">{item.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Divider */}
                            <div className="h-px bg-gray-100 mt-4 mb-3" />

                            {/* Status & Actions Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex gap-1 text-sm font-medium text-gray-500">
                                    {/* Simulated Actions */}
                                    <button
                                        onClick={() => navigate(`/admin/events/${item._id}`)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Clock size={16} /> Details
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/edit-circle/${item._id}`)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/events/${item._id}/connections`)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Users size={16} /> Members
                                    </button>
                                </div>

                                <button
                                    onClick={(e) => handleDelete(e, item._id)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X size={16} /> Cancel Request
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCreatedCircles;
