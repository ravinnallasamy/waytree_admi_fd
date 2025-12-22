import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Check, X, Eye } from 'lucide-react';
import EventThumbnail from '../components/EventThumbnail';
import api from '../utils/api';

const AdminPermission = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPendingEvents(1, searchQuery);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        if (page > 1) fetchPendingEvents(page, searchQuery);
    }, [page]);

    const fetchPendingEvents = async (pageNum = 1, search = '') => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: pageNum,
                limit: 10,
                search: search
            });
            const data = await api.get(`/api/events/pending?${queryParams.toString()}`);

            setEvents(data.events || []);
            setTotalPages(data.totalPages || 1);
            setPage(pageNum);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Removed client-side filteredEvents logic

    const handleApprove = async (id) => {
        if (!confirm('Are you sure you want to approve this event?')) return;
        try {
            await api.put(`/events/approve/${id}`);
            setEvents(events.filter(e => e._id !== id));
            // alert('Event approved successfully!'); // Reduced alert noise
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
            // alert('Event rejected successfully!'); // Reduced alert noise
        } catch (err) {
            console.error(err);
            alert('Error rejecting event');
        }
    };

    if (loading && events.length === 0) return <div className="flex justify-center items-center h-64 text-gray-500">Loading pending events...</div>;
    if (error) return <div className="text-red-500 text-center mt-10">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
                <div className="w-full md:w-64 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search pending events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                </div>
            </div>

            {events.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow-sm">
                    {searchQuery ? 'No matching pending events found.' : 'No pending events found.'}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredEvents.map((event) => (
                        <div key={event._id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6 items-start md:items-center border border-gray-100 hover:border-indigo-100 transition-colors">
                            {/* Image Thumbnail */}
                            <div className="w-full md:w-32 h-48 md:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <EventThumbnail eventId={event._id} altText={event.name} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{event.name}</h3>
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(event.dateTime).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={14} />
                                        {event.location}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => setSelectedEvent(event)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Eye size={16} />
                                    View
                                </button>
                                <button
                                    onClick={() => handleApprove(event._id)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow"
                                >
                                    <Check size={16} />
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(event._id)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow"
                                >
                                    <X size={16} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.name}</h2>
                                <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-gray-100 rounded-full">
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>

                            {selectedEvent.photos && selectedEvent.photos.length > 0 && (
                                <img src={selectedEvent.photos[0]} alt={selectedEvent.name} className="w-full h-64 object-cover rounded-xl mb-6" />
                            )}

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Headline</h4>
                                    <p className="text-gray-900">{selectedEvent.headline || 'N/A'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Date & Time</h4>
                                        <p className="text-gray-900">{new Date(selectedEvent.dateTime).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</h4>
                                        <p className="text-gray-900">{selectedEvent.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        handleReject(selectedEvent._id);
                                        setSelectedEvent(null);
                                    }}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => {
                                        handleApprove(selectedEvent._id);
                                        setSelectedEvent(null);
                                    }}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                                >
                                    Approve Event
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPermission;
