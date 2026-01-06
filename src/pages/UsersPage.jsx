import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronUp,
    User,
    Ban,
    Eye,
    CheckCircle,
    RefreshCw,
    Mail,
    MapPin,
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Users,
    Plus,
    Upload,
    X,
    Search,
    Edit2,
    Trash2
} from 'lucide-react';
import UserDetailsModal from '../components/UserDetailsModal';
import api from '../utils/api';
import { useSearchParams } from 'react-router-dom';

const SearchComponent = ({ value, onChange, placeholder }) => (
    <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-black"
        />
    </div>
);

const UsersPage = () => {
    const [searchParams] = useSearchParams();
    const [connectionType, setConnectionType] = useState(searchParams.get('type') === 'event' ? 'event' : 'user');
    const [subType, setSubType] = useState('events');

    useEffect(() => {
        const type = searchParams.get('type');
        if (type === 'event' || type === 'user') setConnectionType(type);
    }, [searchParams]);

    const [networkGroups, setNetworkGroups] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [connections, setConnections] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingConnections, setLoadingConnections] = useState(false);

    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [eventConnections, setEventConnections] = useState([]);
    const [loadingEventConnections, setLoadingEventConnections] = useState(false);

    const [showManualModal, setShowManualModal] = useState(false);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [manualMember, setManualMember] = useState({ name: '', phoneNumber: '' });
    const [excelFile, setExcelFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    // Network Code Management States
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'create_network'
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);
    const [selectedUserForNetwork, setSelectedUserForNetwork] = useState(null);
    const [userSearchQuery, setUserSearchQuery] = useState('');

    const [showEditNetworkModal, setShowEditNetworkModal] = useState(false);
    const [editingNetworkCode, setEditingNetworkCode] = useState(null);
    const [newNetworkCode, setNewNetworkCode] = useState({ code: '', name: '', description: '', autoConnect: false });

    // Circle Members View States
    const [circleFilter, setCircleFilter] = useState('events'); // 'events', 'communities'

    const fetchAll = useCallback(() => {
        if (connectionType === 'user') {
            fetchNetworks();
            if (selectedNetwork) fetchConnections(page);
        } else {
            if (selectedEvent) {
                fetchEventConnections(selectedEvent._id);
            } else {
                fetchEvents();
            }
        }
    }, [connectionType, selectedNetwork, selectedEvent, page, subType, searchQuery]);

    useEffect(() => {
        const timeoutId = setTimeout(fetchAll, 50);
        return () => clearTimeout(timeoutId);
    }, [connectionType, subType, selectedNetwork, selectedEvent, page, limit, searchQuery]);

    const fetchNetworks = async () => {
        try {
            setRefreshing(true);
            const data = await api.get('/api/network-codes/all');
            setNetworkGroups(data);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error fetching networks:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            setLoadingAvailableUsers(true);
            const params = new URLSearchParams({
                nonBlockedOnly: 'true',
                limit: 50
            });
            if (userSearchQuery) params.append('search', userSearchQuery);
            const response = await api.get(`/api/users/all?${params.toString()}`);
            setAvailableUsers(response.users || []);
            setLoadingAvailableUsers(false);
        } catch (error) {
            console.error('Error fetching available users:', error);
            setLoadingAvailableUsers(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'create_network') {
            const timeoutId = setTimeout(fetchAvailableUsers, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [viewMode, userSearchQuery]);

    const fetchConnections = async (currPage = page) => {
        if (!selectedNetwork) return;
        try {
            setLoadingConnections(true);
            const params = new URLSearchParams({ page: currPage, limit: limit });
            if (searchQuery) params.append('search', searchQuery);
            const response = await api.get(`/api/network-codes/${selectedNetwork.code}/connections?${params.toString()}`);
            setConnections(response.connections || response);
            setTotalPages(response.pagination?.totalPages || 1);
            setLoadingConnections(false);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching connections:', error);
            setLoadingConnections(false);
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoadingEvents(true);
            const params = new URLSearchParams({
                limit: 20,
                page: 1
            });
            if (searchQuery && !selectedEvent) params.append('search', searchQuery);
            const response = await api.get(`/api/event-connections/events?${params.toString()}`);
            setEvents(response.events || []);
            setLoadingEvents(false);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setLoadingEvents(false);
            setLoading(false);
        }
    };

    const fetchEventConnections = async (eventId) => {
        try {
            setLoadingEventConnections(true);
            const params = new URLSearchParams({
                limit: limit,
                page: page
            });
            if (searchQuery) params.append('search', searchQuery);

            const response = await api.get(`/api/event-connections/${eventId}/connections?${params.toString()}`);
            setEventConnections(response.connections || []);
            setTotalPages(response.pagination?.pages || response.pagination?.totalPages || 1);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching event connections:', error);
            setError('Failed to load members');
            setLoading(false);
        } finally {
            setLoadingEventConnections(false);
        }
    };

    const handleNetworkSelect = (network) => {
        setSelectedNetwork(network);
        setPage(1);
        setSearchQuery('');
    };

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        setPage(1);
        setSearchQuery('');
    };

    const handleAddManualMember = async () => {
        if (!manualMember.name) return setFormError('Name is required');
        try {
            setSubmitting(true);
            setFormError(null);
            await api.post('/api/event-connections/add-member', {
                eventId: selectedEvent._id,
                ...manualMember
            });
            setShowManualModal(false);
            setManualMember({ name: '', phoneNumber: '' });
            fetchEventConnections(selectedEvent._id);
        } catch (err) {
            console.error('Manual Add Error:', err);
            setFormError(err.message || 'Failed to add member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMember = async (member) => {
        if (!window.confirm(`Are you sure you want to remove ${member.name}?`)) return;
        try {
            await api.delete(`/api/event-connections/members/${member.connectionId}?eventId=${selectedEvent._id}&source=${member.source}&userId=${member.userId || ''}`);
            fetchEventConnections(selectedEvent._id);
        } catch (err) {
            alert('Failed to delete member: ' + err.message);
        }
    };

    const handleEditMember = (member) => {
        setEditingMember(member);
        setShowEditModal(true);
        setFormError(null);
    };

    const handleSaveEdit = async () => {
        if (!editingMember.name) return setFormError('Name is required');
        try {
            setSubmitting(true);
            setFormError(null);
            await api.put(`/api/event-connections/members/${editingMember.connectionId}`, {
                name: editingMember.name,
                phoneNumber: editingMember.phoneNumber
            });
            setShowEditModal(false);
            setEditingMember(null);
            fetchEventConnections(selectedEvent._id);
        } catch (err) {
            setFormError(err.message || 'Failed to update member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExcelUpload = async () => {
        if (!excelFile) return;
        const formData = new FormData();
        formData.append('file', excelFile);
        formData.append('eventId', selectedEvent._id);
        const token = localStorage.getItem('adminToken');
        try {
            setSubmitting(true);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/event-connections/upload-members`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                setShowExcelModal(false);
                setExcelFile(null);
                fetchEventConnections(selectedEvent._id);
                const msg = `Added: ${data.addedCount}, Duplicates: ${data.duplicateCount}`;
                alert('Upload Complete! ' + msg);
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error uploading excel:', error);
            alert('Error uploading excel');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateNetwork = async () => {
        if (!newNetworkCode.code || !newNetworkCode.name) return setFormError('Code and Name are required');
        if (!selectedUserForNetwork) return setFormError('Please select a user first');

        try {
            setSubmitting(true);
            setFormError(null);
            await api.post('/api/network-codes/create', {
                ...newNetworkCode,
                userId: selectedUserForNetwork._id
            });
            setViewMode('list');
            setSelectedUserForNetwork(null);
            setNewNetworkCode({ code: '', name: '', description: '', autoConnect: false });
            fetchNetworks();
        } catch (err) {
            setFormError(err.message || 'Failed to create network code');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateNetwork = async () => {
        if (!editingNetworkCode.name) return setFormError('Name is required');
        try {
            setSubmitting(true);
            setFormError(null);
            await api.put(`/api/network-codes/${editingNetworkCode._id}`, {
                name: editingNetworkCode.name,
                description: editingNetworkCode.description,
                isBlocked: editingNetworkCode.isBlocked,
                isVerified: editingNetworkCode.isVerified,
                autoConnect: editingNetworkCode.autoConnect
            });
            setShowEditNetworkModal(false);
            setEditingNetworkCode(null);
            fetchNetworks();
        } catch (err) {
            setFormError(err.message || 'Failed to update network');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNetwork = async (id) => {
        if (!window.confirm('Are you sure you want to delete this network code? All connections will be affected.')) return;
        try {
            await api.delete(`/api/network-codes/${id}`);
            setShowEditNetworkModal(false);
            setEditingNetworkCode(null);
            fetchNetworks();
        } catch (err) {
            alert('Failed to delete network: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-black text-gray-900">Loading connections...</h2>
            </div>
        );
    }

    return (
        <div className="flex-1 p-10 bg-gray-50/50 overflow-y-auto">
            {/* Header */}
            <div className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        {connectionType === 'user' ? 'Network Connections' : 'Circle Members'}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {connectionType === 'user'
                            ? 'Manage network codes and their connected members'
                            : 'Manage memberships for all events and communities'}
                    </p>
                </div>
                {connectionType === 'user' && !selectedNetwork && viewMode === 'list' && (
                    <button onClick={() => setViewMode('create_network')} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm shadow-xl shadow-indigo-100">
                        <Plus size={18} /> Create Network Code
                    </button>
                )}
                {viewMode === 'create_network' && (
                    <button onClick={() => { setViewMode('list'); setSelectedUserForNetwork(null); }} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2">
                        <ChevronLeft size={16} /> Back to List
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            {viewMode === 'list' && !selectedNetwork && !selectedEvent && (
                <div className="flex gap-4 mb-8 animate-in fade-in duration-300">
                    <div className="flex-1">
                        <SearchComponent
                            placeholder={connectionType === 'user' ? "Search network codes or members..." : "Search all circles (events/communities)..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* TOGGLE BUTTON FIX: Changed condition from 'circle' to 'event' */}
                    {connectionType === 'event' && (
                        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                            {['events', 'communities'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setCircleFilter(filter)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all duration-300 ${circleFilter === filter
                                        ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}


            {/* Back to Overview for Members View */}
            {(selectedNetwork || selectedEvent) && (
                <div className="flex gap-4 mb-8">
                    <button onClick={() => { setSelectedNetwork(null); setSelectedEvent(null); setPage(1); }} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
                        <ChevronLeft size={16} /> Back to Overview
                    </button>
                </div>
            )}

            {connectionType === 'user' ? (
                // User Base View
                viewMode === 'create_network' ? (
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden p-8 animate-in slide-in-from-bottom-5 duration-500">
                        {!selectedUserForNetwork ? (
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-2xl font-black text-gray-900">Step 1: Choose a User</h2>
                                    <p className="text-sm text-gray-500 font-medium">Search and select the user who will own this network code.</p>
                                </div>

                                <div className="relative max-w-xl">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email or company..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-black"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {loadingAvailableUsers ? (
                                        <div className="col-span-full py-10 text-center animate-pulse text-gray-400 font-black uppercase">Loading users...</div>
                                    ) : availableUsers.length === 0 ? (
                                        <div className="col-span-full py-10 text-center text-gray-400 font-bold">No unblocked users found.</div>
                                    ) : (
                                        availableUsers.map((u) => (
                                            <button
                                                key={u._id}
                                                onClick={() => setSelectedUserForNetwork(u)}
                                                className="flex items-center gap-4 p-4 rounded-3xl border border-gray-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all text-left"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20} /></div>}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-gray-900 truncate">{u.name}</span>
                                                    <span className="text-[10px] font-medium text-gray-400 truncate">{u.email}</span>
                                                    {u.company && <span className="text-[10px] font-black text-indigo-500 uppercase mt-0.5">{u.company}</span>}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-6 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm overflow-hidden flex-shrink-0">
                                        {selectedUserForNetwork.photoUrl ? <img src={selectedUserForNetwork.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24} /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900">{selectedUserForNetwork.name}</h3>
                                                <p className="text-sm font-medium text-indigo-600">{selectedUserForNetwork.email}</p>
                                            </div>
                                            <button onClick={() => setSelectedUserForNetwork(null)} className="text-xs font-black text-gray-400 hover:text-red-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">Change User</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black text-gray-900">Step 2: Network Details</h2>
                                    {formError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold animate-pulse">{formError}</div>}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Network Code</label>
                                            <input type="text" value={newNetworkCode.code} onChange={(e) => setNewNetworkCode({ ...newNetworkCode, code: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 uppercase" placeholder="E.g. TECH24" />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                                            <input type="text" value={newNetworkCode.name} onChange={(e) => setNewNetworkCode({ ...newNetworkCode, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900" placeholder="E.g. Engineering Team" />
                                        </div>
                                        <div className="col-span-full">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                            <textarea value={newNetworkCode.description} onChange={(e) => setNewNetworkCode({ ...newNetworkCode, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 min-h-[120px]" placeholder="What is this network for?" />
                                        </div>
                                        <div className="col-span-full flex items-center justify-between p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                            <div>
                                                <div className="text-sm font-black text-indigo-900 uppercase tracking-tight">Auto Connect</div>
                                                <p className="text-[10px] text-indigo-600 font-medium mt-0.5">Allow users to join this network automatically without approval.</p>
                                            </div>
                                            <button
                                                onClick={() => setNewNetworkCode({ ...newNetworkCode, autoConnect: !newNetworkCode.autoConnect })}
                                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${newNetworkCode.autoConnect ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}
                                            >
                                                {newNetworkCode.autoConnect ? 'Enabled' : 'Disabled'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button
                                            onClick={handleCreateNetwork}
                                            disabled={submitting}
                                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                        >
                                            {submitting ? 'Setting up Network...' : 'Confirm & Create Network'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : !selectedNetwork ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {networkGroups.filter(g => !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.code.toLowerCase().includes(searchQuery.toLowerCase())).map((group) => (
                            <div key={group._id} className="group relative">
                                <button onClick={() => handleNetworkSelect(group)} className="w-full bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all text-left overflow-hidden flex flex-col">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                                        <Users size={120} />
                                    </div>
                                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900">{group.name}</h3>
                                    <div className="mt-2 inline-block px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-lg tracking-widest">{group.code}</div>
                                    <div className="mt-8 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connections</span>
                                            <span className="text-xl font-black text-indigo-600">{group.connectionCount || 0}</span>
                                        </div>
                                        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs">View Members</div>
                                    </div>
                                </button>
                                {/* Management Overlay */}
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingNetworkCode(group); setShowEditNetworkModal(true); }}
                                        className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Member List for Network
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                        {loadingConnections ? (
                            <div className="p-20 text-center animate-pulse text-gray-400 font-bold">Loading system connections...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-5">Profile</th>
                                            <th className="px-8 py-5">Location/Contact</th>
                                            <th className="px-8 py-5">Interests</th>
                                            <th className="px-8 py-5">Network Code</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {connections.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                                                            {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400" />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="font-bold text-gray-900">{u.name}</div>
                                                            <div className="text-[10px] font-bold text-indigo-500 uppercase">{u.role || 'Member'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 mb-1">
                                                        <MapPin size={14} className="text-gray-400" /> {u.location || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium">{u.email}</div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(u.interests || []).slice(0, 2).map((interest, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">{interest}</span>
                                                        ))}
                                                        {(u.interests || []).length > 2 && <span className="text-[10px] text-gray-400">+{u.interests.length - 2} more</span>}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg inline-block">{u.networkCode}</div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button onClick={() => setSelectedUser(u)} className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="border-t border-gray-100 px-8 py-5 flex items-center justify-between bg-gray-50/30">
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Page {page} of {totalPages}</div>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"><ChevronLeft size={20} /></button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                // Circles & Events View
                !selectedEvent ? (
                    loadingEvents ? (
                        <div className="flex-1 flex items-center justify-center min-h-[400px]">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {events
                                .filter(e => {
                                    if (circleFilter === 'events') return !e.isCommunity;
                                    if (circleFilter === 'communities') return e.isCommunity;
                                    return true;
                                })
                                .filter(e => !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((event) => (
                                    <button key={event._id} onClick={() => handleEventSelect(event)} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all text-left relative overflow-hidden flex flex-col">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                                            {event.isCommunity ? <Users size={120} /> : <Calendar size={120} />}
                                        </div>
                                        <div className={`p-4 rounded-2xl w-fit mb-6 transition-colors ${event.isCommunity ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600'} group-hover:text-white`}>
                                            {event.isCommunity ? <Users size={24} /> : <Calendar size={24} />}
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 line-clamp-1">{event.name}</h3>
                                        <p className="text-gray-500 text-sm font-medium mt-1 line-clamp-2 min-h-[40px]">{event.headline || 'No headline'}</p>
                                        <div className="mt-6 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Members</span>
                                                <span className="text-xl font-black text-indigo-600">{event.connectionCount || 0}</span>
                                            </div>
                                            <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs">View Members</div>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    )
                ) : (
                    // Selected Event View
                    <div className="space-y-6">
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm shadow-xl shadow-indigo-100">
                                <Plus size={18} /> Add Member
                            </button>
                            <button onClick={() => setShowExcelModal(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-black text-sm shadow-xl shadow-emerald-100">
                                <Upload size={18} /> Upload Excel
                            </button>
                        </div>
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            {loadingEventConnections ? (
                                <div className="p-20 text-center animate-pulse text-gray-400 font-bold">Loading members...</div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                                <tr>
                                                    <th className="px-8 py-5">Member</th>
                                                    <th className="px-8 py-5">Contact Info</th>
                                                    <th className="px-8 py-5">Source</th>
                                                    <th className="px-8 py-5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {eventConnections.map((m) => (
                                                    <tr key={m.connectionId} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                                                                    {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" /> : <User size={18} className="text-gray-400" />}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <div className="font-bold text-gray-900">{m.name}</div>
                                                                    {m.company && <div className="text-[10px] font-bold text-indigo-500 uppercase">{m.company}</div>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="text-sm font-medium text-gray-900">{m.phoneNumber || 'N/A'}</div>
                                                            <div className="text-xs text-gray-500">{m.email}</div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${m.source === 'excel' ? 'bg-emerald-50 text-emerald-600' : m.source === 'manual' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                                {m.source}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {(m.source === 'manual' || m.source === 'excel') && (
                                                                    <button onClick={() => handleEditMember(m)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                                                                )}
                                                                <button onClick={() => handleDeleteMember(m)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="border-t border-gray-100 px-8 py-5 flex items-center justify-between bg-gray-50/30">
                                        <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Page {page} of {totalPages}</div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"><ChevronLeft size={20} /></button>
                                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"><ChevronRight size={20} /></button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            )}

            {/* Manual Add Modal */}
            {showManualModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-black">Add Member Manually</h2>
                            <button onClick={() => { setShowManualModal(false); setFormError(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            {formError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold animate-pulse">{formError}</div>}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Member Name</label>
                                <input type="text" value={manualMember.name} onChange={(e) => setManualMember({ ...manualMember, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input type="text" value={manualMember.phoneNumber} onChange={(e) => setManualMember({ ...manualMember, phoneNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900" placeholder="+1234567890" />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => { setShowManualModal(false); setFormError(null); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                            <button onClick={handleAddManualMember} disabled={submitting} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">{submitting ? 'Adding...' : 'Add Member'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Member Modal */}
            {showEditModal && editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-black">Edit Member</h2>
                            <button onClick={() => { setShowEditModal(false); setEditingMember(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            {formError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold animate-pulse">{formError}</div>}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Member Name</label>
                                <input type="text" value={editingMember.name} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input type="text" value={editingMember.phoneNumber} onChange={(e) => setEditingMember({ ...editingMember, phoneNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900" placeholder="+1234567890" />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => { setShowEditModal(false); setEditingMember(null); setFormError(null); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                            <button onClick={handleSaveEdit} disabled={submitting} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">{submitting ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Excel Upload Modal */}
            {showExcelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-black">Upload Member Excel</h2>
                            <button onClick={() => setShowExcelModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="border-4 border-dashed border-gray-50 rounded-3xl p-10 flex flex-col items-center text-center">
                            <Upload size={48} className="text-emerald-500 mb-4" />
                            <p className="text-sm font-medium text-gray-500">Select .xlsx or .xls file</p>
                            <input type="file" id="excelFile" accept=".xlsx, .xls" className="hidden" onChange={(e) => setExcelFile(e.target.files[0])} />
                            <label htmlFor="excelFile" className="mt-6 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold cursor-pointer hover:bg-emerald-100 border border-emerald-100">Choose File</label>
                            {excelFile && <p className="mt-3 text-xs font-bold text-emerald-600">{excelFile.name}</p>}
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowExcelModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                            <button onClick={handleExcelUpload} disabled={submitting || !excelFile} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50">{submitting ? 'Uploading...' : 'Upload'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal code for Create Network is gone, handled in-page now */}

            {/* Edit Member Modal */}

            {/* Edit Network Modal */}
            {showEditNetworkModal && editingNetworkCode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-black">Manage Network</h2>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{editingNetworkCode.code}</span>
                            </div>
                            <button onClick={() => { setShowEditNetworkModal(false); setEditingNetworkCode(null); setFormError(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            {formError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold animate-pulse">{formError}</div>}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Network Name</label>
                                <input type="text" value={editingNetworkCode.name} onChange={(e) => setEditingNetworkCode({ ...editingNetworkCode, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea value={editingNetworkCode.description} onChange={(e) => setEditingNetworkCode({ ...editingNetworkCode, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 min-h-[100px]" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700">Blocked Status</span>
                                <button
                                    onClick={() => setEditingNetworkCode({ ...editingNetworkCode, isBlocked: !editingNetworkCode.isBlocked })}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editingNetworkCode.isBlocked ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                                >
                                    {editingNetworkCode.isBlocked ? 'Blocked' : 'Active'}
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700">Auto Connect</span>
                                <button
                                    onClick={() => setEditingNetworkCode({ ...editingNetworkCode, autoConnect: !editingNetworkCode.autoConnect })}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editingNetworkCode.autoConnect ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}
                                >
                                    {editingNetworkCode.autoConnect ? 'Enabled' : 'Disabled'}
                                </button>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button onClick={() => { setShowEditNetworkModal(false); setEditingNetworkCode(null); setFormError(null); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                                <button onClick={handleUpdateNetwork} disabled={submitting} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">{submitting ? 'Updating...' : 'Save Changes'}</button>
                            </div>
                            <button onClick={() => handleDeleteNetwork(editingNetworkCode._id)} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all text-xs flex items-center justify-center gap-2">
                                <Trash2 size={14} /> Delete Network Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
};

export default UsersPage;
