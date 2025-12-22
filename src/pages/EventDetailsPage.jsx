import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    Calendar, MapPin, Tag, ArrowLeft, Clock, CheckCircle,
    User, FileText, Download, Share2, Heart
} from 'lucide-react';

const EventDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            console.log('EventDetailsPage: Fetching event with ID:', id);
            try {
                const data = await api.get(`/events/${id}`);
                console.log('EventDetailsPage: Fetched data:', data);
                setEvent(data);
            } catch (err) {
                console.error('EventDetailsPage: Error fetching event:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEventDetails();
        } else {
            setError("No Event ID provided");
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-red-500">
                <p className="text-xl font-semibold mb-2">Error loading event</p>
                <p>{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-500">
                <p className="text-xl font-semibold mb-2">Event Not Found</p>
                <p>The requested event data is empty.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return { full: 'N/A', time: 'N/A', day: '?', month: '?' };
        const date = new Date(dateString);
        return {
            full: date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            day: date.getDate(),
            month: date.toLocaleDateString(undefined, { month: 'short' })
        };
    };

    const dateInfo = formatDate(event.dateTime);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section with Glassmorphism */}
            <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    {event.photos && event.photos.length > 0 ? (
                        <img
                            src={event.photos[0]}
                            alt={event.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                {/* Navigation Bar (Absolute) */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/30 transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex gap-3">
                        <button className="p-2 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/30 transition-all">
                            <Share2 size={20} />
                        </button>
                        <button className="p-2 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/30 transition-all">
                            <Heart size={20} />
                        </button>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    {event.isVerified ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/80 backdrop-blur-sm text-white rounded-full text-xs font-semibold uppercase tracking-wide">
                                            <CheckCircle size={12} /> Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/80 backdrop-blur-sm text-white rounded-full text-xs font-semibold uppercase tracking-wide">
                                            <Clock size={12} /> Pending
                                        </span>
                                    )}
                                    {event.tags && event.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/10 rounded-full text-xs font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">{event.name}</h1>
                                {event.headline && (
                                    <p className="text-lg md:text-xl text-gray-200 font-light max-w-2xl">{event.headline}</p>
                                )}
                            </div>

                            {/* Date Badge (Desktop) */}
                            <div className="hidden md:flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[100px]">
                                <span className="text-sm uppercase tracking-wider text-gray-300">{dateInfo.month}</span>
                                <span className="text-4xl font-bold">{dateInfo.day}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Info Cards (Mobile/Tablet friendly grid) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium mb-1">Date & Time</p>
                                    <p className="font-semibold text-gray-900">{dateInfo.full}</p>
                                    <p className="text-sm text-gray-600">{dateInfo.time}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-pink-50 rounded-xl text-pink-600">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium mb-1">Location</p>
                                    <p className="font-semibold text-gray-900">{event.location}</p>
                                    <a href={`https://maps.google.com/?q=${event.location}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                                        View on Map
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                                About Event
                            </h3>
                            <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </div>
                        </div>

                        {/* Gallery */}
                        {(event.photos?.length > 0 || event.videos?.length > 0) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                                    Gallery
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {event.photos?.map((photo, index) => (
                                        <div key={`photo-${index}`} className="rounded-xl overflow-hidden aspect-square shadow-sm hover:shadow-md transition-all group relative cursor-pointer">
                                            <img
                                                src={photo}
                                                alt={`Gallery ${index}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    ))}
                                    {event.videos?.map((video, index) => (
                                        <div key={`video-${index}`} className="rounded-xl overflow-hidden aspect-square shadow-sm bg-black relative">
                                            <video src={video} className="w-full h-full object-cover opacity-80" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center pl-1">
                                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Creator Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Organizer</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                                    {/* Initials or User Icon */}
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {/* Assuming createdBy might be populated object or ID */}
                                        {event.createdBy && typeof event.createdBy === 'object' ? (event.createdBy.name || "Event Organizer") : "Event Organizer"}
                                    </p>
                                    <p className="text-xs text-gray-500">Verified Organizer</p>
                                </div>
                            </div>
                            <button className="w-full mt-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                View Profile
                            </button>
                        </div>

                        {/* Files & Documents Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-gray-400" />
                                Documents & Files
                            </h3>

                            {event.attachments && event.attachments.length > 0 ? (
                                <div className="space-y-3">
                                    {event.attachments.map((file, index) => (
                                        <a
                                            key={index}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-400">{file.type || 'Document'}</p>
                                                </div>
                                            </div>
                                            <Download size={16} className="text-gray-300 group-hover:text-indigo-600" />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">No documents attached</p>
                                </div>
                            )}
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;
