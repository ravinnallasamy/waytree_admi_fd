import React, { useState, useEffect } from 'react';

/**
 * Optimized Image component with lazy loading and caching
 */
const CachedImage = ({
    src,
    alt = '',
    className = '',
    fallback = '/placeholder.png',
    loading = 'lazy',
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!src) {
            setImageSrc(fallback);
            setIsLoading(false);
            return;
        }

        // Check if image is already cached in browser
        const img = new Image();

        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
            setHasError(false);
        };

        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            setImageSrc(fallback);
            setIsLoading(false);
            setHasError(true);
        };

        img.src = src;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, fallback]);

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
            )}
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={alt}
                    className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    loading={loading}
                    {...props}
                />
            )}
        </div>
    );
};

export default CachedImage;
