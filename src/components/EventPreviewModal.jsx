
import React, { useState } from 'react';
import { X, Calendar, MapPin, Tag, FileText, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const EventPreviewModal = ({ event, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!event) return null;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % event.photos.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + event.photos.length) % event.photos.length);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header / Image Carousel */}
                <div className="relative h-64 md:h-80 bg-gray-100 flex-shrink-0">
                    {event.photos && event.photos.length > 0 ? (
                        <>
                            <img
                                src={event.photos[currentImageIndex]}
                                alt={`Event visual ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Navigation Arrows */}
                            {event.photos.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all"
                                    >
                                        <ChevronRight size={24} />
                                    </button>

                                    {/* Indicators */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {event.photos.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="flex flex-col items-center gap-2">
                                <Tag size={40} />
                                No images available
                            </span>
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="flex flex-col gap-6">

                        {/* Title & Headline */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${event.isCommunity ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {event.isCommunity ? 'Community' : 'Event'}
                                </span>
                                {event.isVerified ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        Verified
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        Pending Review
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{event.name}</h2>
                            {event.headline && (
                                <p className="text-lg text-indigo-600 font-medium">{event.headline}</p>
                            )}
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Location</p>
                                    <p className="font-medium text-gray-900">{event.location || 'Online/TBD'}</p>
                                </div>
                            </div>

                            {!event.isCommunity && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Date & Time</p>
                                        <p className="font-medium text-gray-900">
                                            {event.dateTime
                                                ? new Date(event.dateTime).toLocaleString(undefined, {
                                                    weekday: 'short', month: 'short', day: 'numeric',
                                                    hour: 'numeric', minute: '2-digit'
                                                })
                                                : 'Multiple Sessions'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 md:col-span-2">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-500">
                                    <Tag size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {event.tags && event.tags.length > 0 ? (
                                            event.tags.map((tag, i) => (
                                                <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600">
                                                    #{tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">No tags</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">About this {event.isCommunity ? 'Community' : 'Event'}</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {event.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* PDF Documents */}
                        {event.pdfFiles && event.pdfFiles.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText size={20} className="text-red-500" />
                                    Attached Documents
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {event.pdfFiles.map((pdfUrl, idx) => {
                                        // Attempt to extract filename from URL
                                        const filename = pdfUrl.split('/').pop().split('?')[0].split('_').slice(2).join('_') || `Document ${idx + 1}.pdf`;

                                        return (
                                            <a
                                                key={idx}
                                                href={pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors group"
                                            >
                                                <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate" title={filename}>{filename}</p>
                                                    <p className="text-xs text-blue-600 flex items-center gap-1 group-hover:underline">
                                                        View PDF <ExternalLink size={10} />
                                                    </p>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Gradient Fade */}
                <div className="h-4 bg-gradient-to-t from-white to-transparent absolute bottom-0 left-0 right-0 pointer-events-none" />
            </div>
        </div>
    );
};

export default EventPreviewModal;
