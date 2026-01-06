import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within LoadingProvider');
    }
    return context;
};

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const startLoading = (message = 'Loading...') => {
        setIsLoading(true);
        setLoadingMessage(message);
    };

    const stopLoading = () => {
        setIsLoading(false);
        setLoadingMessage('');
    };

    return (
        <LoadingContext.Provider value={{ isLoading, loadingMessage, startLoading, stopLoading }}>
            {children}
            {isLoading && (
                <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">{loadingMessage}</span>
                </div>
            )}
        </LoadingContext.Provider>
    );
};
