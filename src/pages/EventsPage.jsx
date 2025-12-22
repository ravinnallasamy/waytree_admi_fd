import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EventThumbnail from '../components/EventThumbnail';
import api from '../utils/api';

const EventsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        setEvents([]);
        setPage(1);
        setHasMore(true);
        fetchEvents(1);
    }, [activeTab]);

    const fetchEvents = async (pageNum) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        setError(null);
        try {
            const endpoint = activeTab === 'all'
                ? `/api/events/verified?page=${pageNum}&limit=9`
                : `/api/events/pending?page=${pageNum}&limit=9`;

            const data = await api.get(endpoint);

            // Handle the paginated response format
            const newEvents = data.events || [];
            const totalPages = data.totalPages || 1;
            
            console.log('📊 Events data received:', {
                count: newEvents.length,
                total: data.totalEvents || newEvents.length,
                page: data.currentPage || 1,
                totalPages
            });

            if (pageNum === 1) {
                setEvents(newEvents);
            } else {
                setEvents(prev => [...prev, ...newEvents]);
            }

            setHasMore(pageNum < totalPages);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchEvents(nextPage);
    };

    const handleAccept = async (id) => {
        if (!confirm('Are you sure you want to approve this event?')) return;
        try {
            await api.put(`/events/approve/${id}`);
            // Remove from list if in permissions tab
            if (activeTab === 'permissions') {
                setEvents(events.filter(e => e._id !== id));
            }
            alert('Event approved successfully!');
        } catch (err) {
            console.error(err);
            alert('Error approving event');
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Are you sure you want to reject (delete) this event?')) return;
        try {
            await api.delete(`/events/reject/${id}`);
            setEvents(events.filter(e => e._id !== id));
            alert('Event rejected successfully!');
        } catch (err) {
            console.error(err);
            alert('Error rejecting event');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Events</h1>
                <button
                    onClick={() => navigate('/create-event/new')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create New Event
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 px-1 text-sm font-medium transition-all duration-200 relative ${activeTab === 'all'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Verified Events
                </button>
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`pb-3 px-1 text-sm font-medium transition-all duration-200 relative ${activeTab === 'permissions'
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Pending Approval
                </button>
            </div>

            {/* Event List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading events...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">Error: {error}</div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No events found</h3>
                        <p className="text-gray-500 mt-1">
                            {activeTab === 'all'
                                ? "There are no verified events to display."
                                : "There are no pending events requiring approval."}
                        </p>
                    </div>
                ) : (
                    <>
                        {events.map((event) => (
                            <div key={event._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-full md:w-48 h-48 md:h-32 flex-shrink-0 rounded-lg overflow-hidden">
                                    <EventThumbnail eventId={event._id} altText={event.name} />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                                    <p className="text-gray-500 text-sm max-w-xl line-clamp-2">{event.description}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            {new Date(event.dateTime).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>

                                {activeTab === 'permissions' ? (
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => navigate(`/admin/events/${event._id}`)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all border border-gray-200 font-medium"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleAccept(event._id)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 hover:shadow-sm transition-all border border-green-200 font-medium"
                                        >
                                            <Check className="w-4 h-4" />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(event._id)}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 hover:shadow-sm transition-all border border-red-200 font-medium"
                                        >
                                            <X className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col md:flex-row items-center gap-3">
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium border border-green-100">
                                            <Check className="w-4 h-4" />
                                            Verified
                                        </div>
                                        <button
                                            onClick={() => navigate(`/admin/events/${event._id}`)}
                                            className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-sm"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {hasMore && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EventsPage;
