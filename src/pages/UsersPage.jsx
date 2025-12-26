import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, User, Ban, Eye, CheckCircle, RefreshCw, Mail, MapPin, Briefcase, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import UserDetailsModal from '../components/UserDetailsModal';
import api from '../utils/api';

import { useSearchParams } from 'react-router-dom';

const UsersPage = () => {
    const [searchParams] = useSearchParams();
    // Toggle state: 'user' or 'event'
    const [connectionType, setConnectionType] = useState(searchParams.get('type') === 'event' ? 'event' : 'user');

    // Update state when URL param changes
    useEffect(() => {
        const type = searchParams.get('type');
        const eventId = searchParams.get('eventId');

        if (type === 'event' || type === 'user') {
            setConnectionType(type);
        }

        // Handle direct linking to an event
        if (type === 'event' && eventId) {
            // We need to fetch the event details to set selectedEvent
            const fetchEventDetails = async () => {
                try {
                    setLoadingEvents(true);
                    const event = await api.get(`/events/${eventId}`);
                    setSelectedEvent(event);
                    fetchEventConnections(eventId);
                    setLoadingEvents(false);
                } catch (err) {
                    console.error('Error fetching deep-linked event:', err);
                    setLoadingEvents(false);
                }
            };
            fetchEventDetails();
        }
    }, [searchParams]);

    // Reset state when connectionType changes
    useEffect(() => {
        setSearchQuery('');
        setSelectedNetwork(null);
        setSelectedEvent(null);
        setConnections([]);
        setEventConnections([]);
    }, [connectionType]);

    // User Connections State
    const [networkGroups, setNetworkGroups] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [connections, setConnections] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalConnections, setTotalConnections] = useState(0);
    const [loadingConnections, setLoadingConnections] = useState(false);

    // Event Connections State
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventConnections, setEventConnections] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [loadingEventConnections, setLoadingEventConnections] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('UsersPage mounted');
        if (connectionType === 'user') {
            fetchNetworks();
        } else {
            fetchEvents();
        }
    }, [connectionType]);

    // Fetch connections when dependencies change
    // Fetch connections/events when dependencies change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (connectionType === 'event') {
                if (selectedEvent) {
                    fetchEventConnections(selectedEvent._id);
                } else {
                    fetchEvents();
                }
            } else if (connectionType === 'user' && selectedNetwork) {
                fetchConnections();
            }
        }, 500); // Common debounce

        return () => clearTimeout(timeoutId);
    }, [selectedNetwork, selectedEvent, connectionType, page, limit, searchQuery]);

    // Filter logic for Networks (Client-side)
    const filteredNetworks = networkGroups.filter(group =>
        group.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.createdBy?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchNetworks = async () => {
        try {
            setRefreshing(true);
            // Corrected endpoint from /api/network/all to /network-codes/all (which becomes /api/network-codes/all)
            const data = await api.get('/network-codes/all');
            setNetworkGroups(data);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error fetching networks:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchConnections = async (currPage = page) => {
        if (!selectedNetwork) return;

        try {
            setLoadingConnections(true);
            const params = new URLSearchParams({
                page: currPage,
                limit: limit
            });
            if (searchQuery) params.append('search', searchQuery);

            // Step 2: Corrected endpoint to match backend structure
            // Assuming connections are sub-resource of network-codes or handled by connection routes?
            // Looking at server.ts: app.use("/network-codes", networkCodeRoutes);
            // Let's assume the route is /network-codes/:codeId/connections
            const response = await api.get(`/network-codes/${selectedNetwork.code}/connections?${params.toString()}`);

            const data = response.connections || response; // Handle both structures if needed
            const pagination = response.pagination || {};

            // Map backend response
            const formattedConnections = (Array.isArray(data) ? data : []).map(conn => ({
                connectionId: conn._id,
                userId: conn.user?._id,
                name: conn.user?.name || 'Unknown User',
                email: conn.user?.email || 'N/A',
                role: conn.user?.role || 'N/A',
                location: conn.user?.location,
                avatar: conn.user?.photoUrl || conn.user?.profileImage,
                networkCodeId: conn.networkCodeId,
                networkCode: conn.codeId,
                connectionStatus: conn.isBlocked ? 'Blocked' : (conn.status || 'Connected'),
                isBlocked: conn.isBlocked || false,
                company: conn.user?.company,
                website: conn.user?.website,
                oneLiner: conn.user?.oneLiner,
                primaryGoal: conn.user?.primaryGoal,
                connectionCount: conn.user?.connectionCount
            }));

            setConnections(formattedConnections);
            setTotalPages(pagination.totalPages || 1);
            setLoadingConnections(false);
        } catch (error) {
            console.error('Error fetching connections:', error);
            setLoadingConnections(false);
        }
    };


    const toggleBlockStatus = async (user) => {
        const isBlocked = user.connectionStatus === 'Blocked';
        // Corrected endpoints for blocking/unblocking
        // Assuming these are on the network-codes route or connections route
        // If it's about network connection blocking:
        const endpoint = isBlocked
            ? `/network-codes/unblock/${user.connectionId}`
            : `/network-codes/block/${user.connectionId}`;

        try {
            await api.put(endpoint);
            // Update local state for connections
            setConnections(prev => prev.map(u => {
                if (u.connectionId === user.connectionId) {
                    return {
                        ...u,
                        connectionStatus: isBlocked ? 'Connected' : 'Blocked'
                    };
                }
                return u;
            }));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleUserClick = async (userPreview) => {
        try {
            setLoadingConnections(true); // Re-use loading state or add specific one
            // Step 3: GET /api/users/:userId
            const fullProfile = await api.get(`/users/${userPreview.userId}`);

            setSelectedUser({
                ...userPreview,
                ...fullProfile,
                avatar: fullProfile.photoUrl || fullProfile.profileImage || userPreview.avatar
            });
            setLoadingConnections(false);
        } catch (error) {
            console.error('Error fetching full user profile:', error);
            // Fallback to preview data if fetch fails
            setSelectedUser(userPreview);
            setLoadingConnections(false);
        }
    };

    const handleNetworkSelect = (group) => {
        setSelectedNetwork(group);
        setSearchQuery('');
        setPage(1);
    };

    const handleBack = () => {
        if (connectionType === 'user') {
            setSelectedNetwork(null);
        } else {
            setSelectedEvent(null);
        }
        setSearchQuery('');
        setConnections([]);
        setEventConnections([]);
    };

    // Event Connections Functions
    const fetchEvents = async () => {
        try {
            setLoadingEvents(true);
            // Use server-side search if searchQuery exists and we are in event mode (and not inside a specific event)
            const params = new URLSearchParams({
                limit: 20, // Reasonable limit
                page: 1,   // Reset to page 1 for simple list view
            });

            if (searchQuery && !selectedEvent) {
                params.append('search', searchQuery);
            }

            const response = await api.get(`/api/event-connections/events?${params.toString()}`);

            if (response.success && Array.isArray(response.events)) {
                setEvents(response.events);
            } else {
                setEvents([]);
            }

            setLoadingEvents(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError(error.response?.data?.message || 'Failed to load events');
            setLoadingEvents(false);
        }
    };

    const fetchEventConnections = async (eventId) => {
        const requestId = Math.random().toString(36).substring(2, 9);
        const log = (message, data = {}) => {
            console.log(`[${requestId}] [Frontend] ${message}`, Object.keys(data).length ? data : '');
        };

        try {
            log('🔄 Fetching event connections', { eventId });
            setLoadingEventConnections(true);

            // First verify the event exists
            log('🔍 Verifying event exists...');
            const eventResponse = await api.get(`/events/${eventId}`);

            if (!eventResponse) {
                throw new Error('Event not found');
            }

            log('✅ Event verified, fetching connections...');
            // Using the new endpoint for event connections
            const params = new URLSearchParams({ limit: 100 });
            if (searchQuery) params.append('search', searchQuery);

            const response = await api.get(`/event-connections/${eventId}/connections?${params.toString()}`);

            log('📊 Received connections data', {
                count: response.connections?.length || 0,
                eventId
            });

            setEventConnections(response.connections || []);
            setError(null);
        } catch (error) {
            console.error(`[${requestId}] ❌ Error in fetchEventConnections:`, {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                stack: error.stack
            });
            setError(error.response?.data?.message || error.message || 'Failed to load event connections');
            setEventConnections([]);
        } finally {
            setLoadingEventConnections(false);
        }
    };

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setSearchQuery('');
        setPage(1);
        fetchEventConnections(event._id);
    };



    if (loading) {
        return <div className="p-6 text-center">Loading users...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Toggle Buttons */}


            <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {connectionType === 'user'
                            ? (selectedNetwork ? `Network: ${selectedNetwork.code}` : `User Connections (${networkGroups.length})`)
                            : (selectedEvent ? `Event: ${selectedEvent.name}` : `Event Connections (${events.length})`)
                        }
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {connectionType === 'user'
                            ? (selectedNetwork
                                ? `Manage users in this network (Total: ${selectedNetwork.connectionCount || 0})`
                                : 'Select a Network Code to view connected users')
                            : (selectedEvent
                                ? `Manage connections for this event (Total: ${eventConnections.length})`
                                : 'Select an Event to view connected members')
                        }
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={
                                connectionType === 'user'
                                    ? (selectedNetwork ? "Search users..." : "Search networks...")
                                    : (selectedEvent ? "Search members..." : "Search events...")
                            }
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (selectedNetwork || selectedEvent) setPage(1); // Reset page on search
                            }}
                            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64 text-black"
                        />
                    </div>

                    <div className="flex gap-3">
                        {(selectedNetwork || selectedEvent) && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                            >
                                <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                                Back
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (connectionType === 'user') {
                                    if (selectedNetwork) {
                                        fetchConnections();
                                    } else {
                                        fetchNetworks();
                                    }
                                } else {
                                    if (selectedEvent) {
                                        fetchEventConnections(selectedEvent._id);
                                    } else {
                                        fetchEvents();
                                    }
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
                            disabled={refreshing || loadingConnections || loadingEvents || loadingEventConnections}
                        >
                            <RefreshCw className={`w-4 h-4 ${(refreshing || loadingConnections || loadingEvents || loadingEventConnections) ? 'animate-spin' : ''}`} />
                            {refreshing || loadingEvents || loadingEventConnections ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>

            {connectionType === 'user' ? (
                !selectedNetwork ? (
                    // Network List View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNetworks.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                {searchQuery ? 'No matching networks found.' : 'No network codes found.'}
                            </div>
                        ) : (
                            filteredNetworks.map((group) => (
                                <button
                                    key={group._id}
                                    onClick={() => handleNetworkSelect(group)}
                                    className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between w-full mb-4">
                                        <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-600 transition-colors">
                                            <User className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {group.code}
                                    </h3>

                                    {/* Connection counts below network name */}
                                    <div className="flex flex-wrap gap-2 my-2">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                            {group.memberStats?.accepted || 0} Accepted
                                        </span>
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                                            {group.memberStats?.pending || 0} Pending
                                        </span>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                            {group.connectionCount || 0} Total
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500">
                                        Created by: {group.createdBy?.name || 'Unknown'}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between text-indigo-600 font-medium text-sm">
                                        <span>View Connections</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    // Selected Network Users View
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="flex-grow">
                            {loadingConnections ? (
                                <div className="p-10 text-center text-gray-500">Loading connections...</div>
                            ) : connections.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p>{searchQuery ? 'No matching users found.' : 'No users connected to this network code yet.'}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                                            <tr>
                                                <th className="px-6 py-3">User</th>
                                                <th className="px-6 py-3">Contact Info</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {connections.map((user) => (
                                                <tr key={user.connectionId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                                                                {user.avatar ? (
                                                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User className="w-5 h-5 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                                <div className="text-xs text-gray-500">ID: {user.userId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                                {user.email}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                                                {user.role}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                                {user.location || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.connectionStatus === 'Connected'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : user.connectionStatus === 'Blocked'
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                            }`}>
                                                            {user.connectionStatus === 'Connected' && <CheckCircle className="w-3 h-3" />}
                                                            {user.connectionStatus === 'Blocked' && <Ban className="w-3 h-3" />}
                                                            {user.connectionStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleUserClick(user)}
                                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title="View Profile"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleBlockStatus(user)}
                                                                className={`p-2 rounded-lg transition-colors ${user.connectionStatus === 'Blocked'
                                                                    ? 'text-green-600 hover:bg-green-50'
                                                                    : 'text-red-500 hover:bg-red-50'
                                                                    }`}
                                                                title={user.connectionStatus === 'Blocked' ? "Unblock User" : "Block User"}
                                                            >
                                                                {user.connectionStatus === 'Blocked' ? (
                                                                    <CheckCircle className="w-4 h-4" />
                                                                ) : (
                                                                    <Ban className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {connections.length > 0 && (
                            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Rows per page:</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 bg-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600">
                                        Page {page} of {totalPages}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            ) : (
                // Event Connections View
                !selectedEvent ? (
                    // Events List View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingEvents ? (
                            <div className="col-span-full text-center py-10 text-gray-500">Loading events...</div>
                        ) : events.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-500">
                                {searchQuery ? 'No matching events found.' : 'No events found.'}
                            </div>
                        ) : (
                            events.map((event) => (
                                <button
                                    key={event._id}
                                    onClick={() => handleEventSelect(event)}
                                    className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between w-full mb-4">
                                        <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-600 transition-colors">
                                            <Calendar className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {event.name}
                                    </h3>
                                    {event.headline && (
                                        <p className="text-sm text-gray-600 mb-2">{event.headline}</p>
                                    )}

                                    {/* Connection count */}
                                    <div className="flex flex-wrap gap-2 my-2">
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                                            {event.connectionCount || 0} Members
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-sm text-gray-500">
                                        <p className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {event.location}
                                        </p>
                                        <p>
                                            {new Date(event.dateTime).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-indigo-600 font-medium text-sm">
                                        <span>View Connections</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    // Selected Event Connections View
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="flex-grow">
                            {loadingEventConnections ? (
                                <div className="p-10 text-center text-gray-500">Loading connections...</div>
                            ) : eventConnections.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p>{searchQuery ? 'No matching members found.' : 'No members connected to this event yet.'}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                                            <tr>
                                                <th className="px-6 py-3">Member</th>
                                                <th className="px-6 py-3">Contact Info</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {eventConnections
                                                .map((member) => (
                                                    <tr key={member.connectionId} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                                                                    {member.avatar ? (
                                                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User className="w-5 h-5 text-gray-400" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{member.name}</div>
                                                                    <div className="text-xs text-gray-500">ID: {member.userId}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                                    {member.email}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                                                    {member.role}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                                    {member.location || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                                                                <CheckCircle className="w-3 h-3" />
                                                                {member.connectionStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleUserClick(member)}
                                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title="View Profile"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )
            )}

            {/* User Details Modal */}
            <UserDetailsModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </div>
    );
};

export default UsersPage;
