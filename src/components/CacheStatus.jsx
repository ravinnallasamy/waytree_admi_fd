import React, { useState, useEffect } from 'react';
import cacheManager from '../utils/cache';
import { Database, Zap } from 'lucide-react';

/**
 * Cache Status Indicator - Shows cache statistics
 * Add this to your dashboard or settings page
 */
const CacheStatus = () => {
    const [stats, setStats] = useState({ size: 0, keys: [] });
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const updateStats = () => {
            setStats(cacheManager.getStats());
        };

        updateStats();
        const interval = setInterval(updateStats, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, []);

    const handleClearCache = () => {
        cacheManager.clear();
        setStats({ size: 0, keys: [] });
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Database size={16} className="text-indigo-600" />
                        <span className="font-bold text-sm text-gray-900">Cache Status</span>
                    </div>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                        {showDetails ? 'Hide' : 'Show'}
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-green-500" />
                    <span className="text-sm text-gray-600">
                        {stats.size} cached {stats.size === 1 ? 'item' : 'items'}
                    </span>
                </div>

                {showDetails && stats.size > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-2 font-medium">Cached Endpoints:</div>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {stats.keys.map((key, index) => (
                                <div key={index} className="text-xs text-gray-600 truncate bg-gray-50 px-2 py-1 rounded">
                                    {key.split(':')[0]}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {stats.size > 0 && (
                    <button
                        onClick={handleClearCache}
                        className="mt-3 w-full text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded font-medium transition-colors"
                    >
                        Clear Cache
                    </button>
                )}

                {stats.size === 0 && (
                    <div className="text-xs text-gray-400 italic">No cached data</div>
                )}
            </div>
        </div>
    );
};

export default CacheStatus;
