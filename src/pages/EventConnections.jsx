import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Mail, Phone, Calendar, MapPin,
    Plus, Upload, X, Edit2, Trash2, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../utils/api';

const EventConnections = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    // Data State
    const [connections, setConnections] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Modal & Form States
    const [showManualModal, setShowManualModal] = useState(false);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [manualMember, setManualMember] = useState({ name: '', phoneNumber: '' });
    const [editingMember, setEditingMember] = useState(null);
    const [excelFile, setExcelFile] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch event details
            const eventRes = await api.get(`/events/${eventId}`);
            setEvent(eventRes);

            // Fetch connections
            const params = new URLSearchParams({
                page: currentPage,
                limit: limit
            });
            if (searchQuery) params.append('search', searchQuery);

            const connectionsRes = await api.get(`/event-connections/${eventId}/connections?${params.toString()}`);

            if (connectionsRes && connectionsRes.success) {
                setConnections(connectionsRes.connections || []);
                setTotalPages(connectionsRes.pagination?.totalPages || 1);
            } else {
                setConnections([]);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [eventId, currentPage, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Search Handler ---
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    // --- Action Handlers ---

    const handleAddManualMember = async () => {
        if (!manualMember.name) return setFormError('Name is required');
        try {
            setSubmitting(true);
            setFormError(null);
            await api.post('/api/event-connections/add-member', {
                eventId: eventId,
                ...manualMember
            });
            setShowManualModal(false);
            setManualMember({ name: '', phoneNumber: '' });
            fetchData(); // Refresh list
        } catch (err) {
            console.error('Manual Add Error:', err);
            setFormError(err.message || 'Failed to add member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExcelUpload = async () => {
        if (!excelFile) return;
        const formData = new FormData();
        formData.append('file', excelFile);
        formData.append('eventId', eventId);

        const token = localStorage.getItem('adminToken');

        try {
            setSubmitting(true);
            // Using fetch directly for FormData to avoid Content-Type header issues with some axios wrappers
            // Adjust URL based on your env or hardcoded fallback
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

            const response = await fetch(`${baseUrl}/api/event-connections/upload-members`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setShowExcelModal(false);
                setExcelFile(null);
                fetchData();
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

    const handleDeleteMember = async (member) => {
        if (!window.confirm(`Are you sure you want to remove ${member.name}?`)) return;
        try {
            // Adjust endpoint if needed to match generic delete route
            // Utilizing same logic as UsersPage
            const userIdParam = member.userId || '';
            await api.delete(`/api/event-connections/members/${member.connectionId}?eventId=${eventId}&source=${member.source}&userId=${userIdParam}`);
            fetchData();
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
            fetchData();
        } catch (err) {
            setFormError(err.message || 'Failed to update member');
        } finally {
            setSubmitting(false);
        }
    };


    // --- Render Helpers ---

    if (loading && !event) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-10">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-sm text-red-700 font-bold">{error}</p>
                </div>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" /> Back
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{event?.name}</h1>
                    <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                        <MapPin size={16} /> {event?.location}
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <Calendar size={16} /> {event?.dateTime ? new Date(event.dateTime).toLocaleDateString() : 'N/A'}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-xl shadow-indigo-100">
                        <Plus size={18} /> Add Member
                    </button>
                    <button onClick={() => setShowExcelModal(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-xl shadow-emerald-100">
                        <Upload size={18} /> Upload Excel
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-black"
                        />
                    </form>
                </div>

                {/* Table View */}
                {loading ? (
                    <div className="p-20 text-center animate-pulse text-gray-400 font-bold">Loading members...</div>
                ) : connections.length === 0 ? (
                    <div className="p-20 text-center text-gray-400">
                        <User size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No members found.</p>
                        <p className="text-sm">Try adding a new member or adjusting your search.</p>
                    </div>
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
                                    {connections.map((m) => (
                                        <tr key={m.connectionId || m._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                                                        {m.avatar || m.user?.photoUrl ? (
                                                            <img src={m.avatar || m.user?.photoUrl} className="w-full h-full object-cover" alt={m.name} />
                                                        ) : (
                                                            <User size={18} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="font-bold text-gray-900">{m.name || m.user?.name || 'Unknown'}</div>
                                                        {m.company && <div className="text-[10px] font-bold text-indigo-500 uppercase">{m.company}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    {(m.phoneNumber || m.user?.phone) && (
                                                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                                            <Phone size={14} className="text-gray-400" />
                                                            {m.phoneNumber || m.user?.phone}
                                                        </div>
                                                    )}
                                                    {(m.email || m.user?.email) && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Mail size={14} className="text-gray-400" />
                                                            {m.email || m.user?.email}
                                                        </div>
                                                    )}
                                                    {(!m.phoneNumber && !m.user?.phone && !m.email && !m.user?.email) && (
                                                        <span className="text-gray-400 text-xs italic">No contact info</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${m.source === 'excel' ? 'bg-emerald-50 text-emerald-600' :
                                                        m.source === 'manual' ? 'bg-blue-50 text-blue-600' :
                                                            'bg-indigo-50 text-indigo-600'
                                                    }`}>
                                                    {m.source || 'App'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {(m.source === 'manual' || m.source === 'excel') && (
                                                        <button
                                                            onClick={() => handleEditMember(m)}
                                                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteMember(m)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="border-t border-gray-100 px-8 py-5 flex items-center justify-between bg-gray-50/30">
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* --- Modals --- */}

            {/* Manual Add Modal */}
            {showManualModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-black">Add Member Manually</h2>
                            <button onClick={() => { setShowManualModal(false); setFormError(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            {formError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">{formError}</div>}
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

            {/* Excel Upload Modal */}
            {showExcelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-black">Upload Excel</h2>
                            <button onClick={() => { setShowExcelModal(false); setExcelFile(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>

                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer relative">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={(e) => setExcelFile(e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {excelFile ? (
                                <>
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                                        <Calendar size={32} />
                                    </div>
                                    <p className="font-bold text-gray-900">{excelFile.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">{(excelFile.size / 1024).toFixed(2)} KB</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <p className="font-bold text-gray-900">Click to upload or drag file</p>
                                    <p className="text-sm text-gray-500 mt-1">Supports .xlsx and .xls</p>
                                </>
                            )}
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => { setShowExcelModal(false); setExcelFile(null); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                            <button onClick={handleExcelUpload} disabled={!excelFile || submitting} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50">{submitting ? 'Uploading...' : 'Upload File'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-black">Edit Member</h2>
                            <button onClick={() => { setShowEditModal(false); setEditingMember(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            {formError && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">{formError}</div>}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Member Name</label>
                                <input type="text" value={editingMember.name} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input type="text" value={editingMember.phoneNumber} onChange={(e) => setEditingMember({ ...editingMember, phoneNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900" />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => { setShowEditModal(false); setEditingMember(null); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                            <button onClick={handleSaveEdit} disabled={submitting} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">{submitting ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventConnections;
