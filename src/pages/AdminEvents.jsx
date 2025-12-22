import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Tag, Plus, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import EventThumbnail from '../components/EventThumbnail';
import api from '../utils/api';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(12); // Grid view, 12 is nice

    const navigate = useNavigate();

    // Debounced Search Effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents(1, searchQuery); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Page Change Effect
    useEffect(() => {
        if (page > 1) { // Skip initial load handled by search effect
            fetchEvents(page, searchQuery);
        }
    }, [page]);

    const fetchEvents = async (pageNum = 1, search = '') => {
        try {
            setLoading(true);
            setError(null);
            console.log(`🌐 [AdminEvents] Fetching events. Page: ${pageNum}, Search: "${search}"`);

            const queryParams = new URLSearchParams({
                page: pageNum,
                limit: limit,
                search: search,
                includeDisabled: 'true' // We want to see disabled events too
            });

            // Fetch verified events with params
            const response = await api.get(`/api/events/verified?${queryParams.toString()}`);

            const fetchedEvents = response.events || [];

            // Mark verified status manually if needed, though backend sends isVerified
            const mappedEvents = fetchedEvents.map(event => ({ ...event, status: 'verified' }));

            setEvents(mappedEvents);
            setTotalPages(response.totalPages || 1);
            setPage(pageNum); // Sync state

            console.log(`📊 [AdminEvents] Loaded ${mappedEvents.length} events`);
        } catch (error) {
            console.error('❌ [AdminEvents] Error fetching events:', error);
            setError(error.message || 'Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (e, event) => {
        e.stopPropagation();
        if (togglingId === event._id) return;

        setTogglingId(event._id);
        try {
            await api.put(`/events/${event._id}/toggle-status`);

            // Update local state without refetching
            setEvents(prev => prev.map(ev =>
                ev._id === event._id ? { ...ev, isActive: !ev.isActive } : ev
            ));
        } catch (err) {
            alert(`Error updating status: ${err.message}`);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (e, eventId) => {
        e.stopPropagation();
        if (deletingId === eventId) return;

        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        setDeletingId(eventId);

        try {
            await api.delete(`/events/${eventId}`);
            // Remove from state
            setEvents(prev => prev.filter(event => event._id !== eventId));
            // If page becomes empty, maybe go back a page? (Optional optimization)
        } catch (err) {
            alert(`Error deleting event: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading && events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">Loading events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => fetchEvents(page, searchQuery)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Verified Events</h2>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/create-event/new')}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Event
                    </button>
                </div>
            </div>

            {events.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm">
                    {searchQuery ? 'No matching events found.' : 'No verified events found.'}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div
                                key={event._id}
                                onClick={() => navigate(`/admin/events/${event._id}`)}
                                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer ${event.isActive === false ? 'opacity-75 ring-2 ring-gray-200 bg-gray-50' : ''
                                    }`}
                            >
                                <div className="relative">
                                    <EventThumbnail eventId={event._id} altText={event.name} />
                                    {event.isActive === false && (
                                        <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                                                <EyeOff size={14} />
                                                Disabled
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{event.name}</h3>
                                        <div className="flex items-center gap-2">
                                            {/* Toggle Status Button */}
                                            <button
                                                onClick={(e) => handleToggleStatus(e, event)}
                                                disabled={togglingId === event._id}
                                                className={`p-1 rounded-full transition-colors ${event.isActive !== false
                                                    ? 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                                                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={event.isActive !== false ? "Disable Event" : "Enable Event"}
                                            >
                                                {togglingId === event._id ? (
                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
                                                ) : (
                                                    event.isActive !== false ? <Eye size={16} /> : <EyeOff size={16} />
                                                )}
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => handleDelete(e, event._id)}
                                                disabled={deletingId === event._id}
                                                className={`p-1 rounded-full transition-colors ${deletingId === event._id
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                                    }`}
                                                title="Delete Event"
                                            >
                                                {deletingId === event._id ? (
                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>

                                            {/* View Details Button */}
                                            <Link
                                                to={`/admin/events/${event._id}`}
                                                className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                                                title="View details"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                        </div>
                                    </div>

                                    {event.headline && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.headline}</p>
                                    )}

                                    <div className="space-y-2 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-indigo-500" />
                                            <span>{new Date(event.dateTime).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            <span>{event.location || 'Location not specified'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-indigo-600">
                                            <Users className="h-4 w-4 mr-1" />
                                            <span>{event.connectionCount || 0} Connections</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                                        {event.tags && event.tags.map((tag, index) => (
                                            <span key={index} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                <Tag size={12} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-black"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                            <span className="flex items-center px-4 py-2 text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-black"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminEvents;
