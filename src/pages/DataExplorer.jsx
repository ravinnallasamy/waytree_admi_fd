import React, { useState, useEffect } from 'react';
import { Database, Search, ChevronRight, ChevronLeft, RefreshCw, AlertCircle, DatabaseIcon, FileJson, Trash2, Edit2 } from 'lucide-react';
import api from '../utils/api';

const DataExplorer = () => {
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        if (selectedCollection) {
            fetchCollectionData();
        }
    }, [selectedCollection, page]);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const collections = await api.get('/api/data/collections');
            setCollections(collections);
            if (collections.length > 0 && !selectedCollection) {
                setSelectedCollection(collections[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching collections:', error);
            setError('Failed to fetch collections');
            setLoading(false);
        }
    };

    const fetchCollectionData = async () => {
        try {
            setDataLoading(true);
            const response = await api.get(`/data/collections/${selectedCollection}?page=${page}&limit=10`);
            setData(response.data);
            setTotalPages(response.totalPages);
            setTotalItems(response.total);
            setDataLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(`Failed to fetch data for ${selectedCollection}`);
            setDataLoading(false);
        }
    };

    const handleCollectionSelect = (name) => {
        setSelectedCollection(name);
        setPage(1);
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await api.delete(`/data/collections/${selectedCollection}/${id}`);
            fetchCollectionData();
        } catch (error) {
            setError('Failed to delete document');
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            {/* Sidebar with Collections */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <DatabaseIcon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Collections</span>
                    </div>
                    <p className="text-xs text-gray-500">Test Database Explorer</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400">Loading...</div>
                    ) : (
                        collections.map(name => (
                            <button
                                key={name}
                                onClick={() => handleCollectionSelect(name)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${selectedCollection === name
                                        ? 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-100'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <FileJson className={`w-4 h-4 ${selectedCollection === name ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <span className="truncate">{name}</span>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 capitalize flex items-center gap-2">
                            {selectedCollection || 'Select Collection'}
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {totalItems} items
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchCollectionData}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${dataLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-auto p-6">
                    {dataLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                            <p>Loading collection data...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.map((item) => (
                                <div key={item._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all">
                                    <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-mono text-gray-400">ID: {item._id}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <pre className="p-4 text-xs font-mono text-gray-700 overflow-x-auto bg-white whitespace-pre-wrap max-h-64 scrollbar-thin scrollbar-thumb-gray-200">
                                        {JSON.stringify(item, null, 2)}
                                    </pre>
                                </div>
                            ))}
                            {data.length === 0 && !dataLoading && (
                                <div className="text-center py-20 text-gray-400">
                                    <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No documents found in this collection.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-center gap-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DataExplorer;
