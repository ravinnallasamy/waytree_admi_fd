import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const EventThumbnail = ({ eventId, altText }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchThumbnail = async () => {
            try {
                const data = await api.get(`/events/${eventId}/thumbnail`);
                if (isMounted && data.thumbnail) {
                    setImageSrc(data.thumbnail);
                }
            } catch (error) {
                console.error("Error loading thumbnail:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchThumbnail();
        return () => { isMounted = false; };
    }, [eventId]);

    if (loading) {
        return (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center animate-pulse">
                <span className="text-gray-400 text-sm">Loading...</span>
            </div>
        );
    }

    if (!imageSrc) {
        return (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                No Image
            </div>
        );
    }

    return (
        <img
            src={imageSrc}
            alt={altText}
            className="w-full h-48 object-cover"
            loading="lazy"
        />
    );
};

export default EventThumbnail;
