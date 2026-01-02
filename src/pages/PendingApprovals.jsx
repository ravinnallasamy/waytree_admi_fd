import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Tag, Trash2, Eye, CheckCircle, Search, Users, Globe, Clock } from 'lucide-react';
import api from '../utils/api';
import EventThumbnail from '../components/EventThumbnail';

const PendingApprovals = () => {
    const [activeTab, setActiveTab] = useState('events'); // 'events' or 'communities'
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const endpoint = '/api/events';
            const params = new URLSearchParams({
                verified: 'false',
                search: searchQuery,
                includeDisabled: 'true',
                [activeTab === 'events' ? 'isEvent' : 'isCommunity']: 'true'
            });

            // Additionally ensure exclusivity for clear separation
            if (activeTab === 'events') params.append('isCommunity', 'false');
            else params.append('isEvent', 'false');

            const response = await api.get(`${endpoint}?${params.toString()}`);
            setItems(response.events || []);
        } catch (error) {
            console.error('Error fetching pending circles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (actionId) return;
        setActionId(id);
        try {
            const endpoint = `/events/approve/${id}`;
            await api.put(endpoint);
            setItems(prev => prev.filter(item => item._id !== id));
        } catch (error) {
            alert('Approval failed: ' + error.message);
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (id) => {
        if (actionId) return;
        if (!window.confirm('Are you sure you want to reject this circle?')) return;

        setActionId(id);
        try {
            const endpoint = `/events/${id}`;
            await api.delete(endpoint);
            setItems(prev => prev.filter(item => item._id !== id));
        } catch (error) {
            alert('Rejection failed: ' + error.message);
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Clock className="text-amber-500 w-8 h-8" />
                        Pending Approvals
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Verify new circles before they go live</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'events'
                            ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Calendar size={18} />
                        Events
                    </button>
                    <button
                        onClick={() => setActiveTab('communities')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'communities'
                            ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Users size={18} />
                        Communities
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            {items.length} Awaiting Review
                        </div>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search pending ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-black transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-bold text-lg animate-pulse">Loading queue...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-32 bg-gray-50/50 rounded-3xl border-4 border-dashed border-gray-200">
                            < Globe size={80} className="text-gray-100 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900">Queue Clear!</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2 font-medium">
                                No pending {activeTab} at the moment. You're all caught up.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.map((item) => (
                                <div key={item._id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col transform hover:-translate-y-2">
                                    <div className="relative h-56 overflow-hidden">
                                        <EventThumbnail eventId={item._id} altText={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black shadow-xl tracking-widest uppercase">
                                            Pending
                                        </div>
                                        {activeTab === 'communities' && (
                                            <div className="absolute bottom-4 left-4 bg-purple-600/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                Community
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-black text-black mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1 font-medium leading-relaxed">
                                            {item.description || 'No description provided.'}
                                        </p>

                                        <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                                                <MapPin className="w-4 h-4 text-indigo-500" />
                                                <span className="truncate">{item.location}</span>
                                            </div>
                                            {activeTab === 'events' ? (
                                                <div className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                                    <span>{item.dateTime ? new Date(item.dateTime).toLocaleDateString() : 'TBD'}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                                                    <Tag className="w-4 h-4 text-indigo-500" />
                                                    <span className="truncate">{(item.tags || []).join(', ') || 'No tags'}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleApprove(item._id)}
                                                disabled={actionId === item._id}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95 disabled:opacity-50"
                                            >
                                                {actionId === item._id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircle size={20} />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                disabled={actionId === item._id}
                                                className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all border border-red-100 hover:border-red-200 active:scale-95 disabled:opacity-50"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PendingApprovals;
