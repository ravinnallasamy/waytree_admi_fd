import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import {
    Calendar, Clock, MapPin, Upload, X, Image as ImageIcon,
    Video, Type, AlignLeft, Tag, Save, Users, FileText,
    Link as LinkIcon, AlertCircle, Plus
} from 'lucide-react';
import api from '../utils/api';

const CreateCircle = () => {
    const navigate = useNavigate();
    const [createType, setCreateType] = useState('event'); // 'event' or 'community'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerified, setIsVerified] = useState(true);

    // Shared State for Event & Community (matches add_event_screen.dart)
    const [formData, setFormData] = useState({
        name: '',
        headline: '',
        description: '',
        date: '',
        time: '',
        location: '',
        tags: []
    });

    const [media, setMedia] = useState({
        images: [], // { file, preview }
        videos: [], // { file, preview }
        pdfs: []    // { file, name, base64 }
    });

    const [tagInput, setTagInput] = useState('');

    // Helpers
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        if (!file) return resolve(null);
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleFileUpload = async (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'images') {
            const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
            const newImages = await Promise.all(validFiles.map(async file => ({
                file,
                preview: URL.createObjectURL(file),
                base64: await toBase64(file)
            })));
            setMedia(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        } else if (type === 'pdfs') {
            const validFiles = files.filter(file => file.type === 'application/pdf');
            const newPdfs = await Promise.all(validFiles.map(async file => ({
                file,
                name: file.name,
                base64: await toBase64(file)
            })));
            setMedia(prev => ({ ...prev, pdfs: [...prev.pdfs, ...newPdfs] }));
        }
    };

    const removeFile = (type, index) => {
        setMedia(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    const handleTagAdd = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim().replace(',', '');
            if (tag && !formData.tags.includes(tag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const dateTime = formData.date && formData.time
                ? new Date(`${formData.date}T${formData.time}`)
                : null;

            const payload = {
                name: formData.name,
                headline: formData.headline,
                description: formData.description,
                dateTime: dateTime ? dateTime.toISOString() : null,
                location: formData.location,
                photos: media.images.map(img => img.base64),
                videos: media.videos.map(v => v.base64),
                pdfFiles: media.pdfs.map(p => p.base64),
                tags: formData.tags,
                isEvent: createType === 'event',
                isCommunity: createType === 'community',
                isVerified: isVerified,
                isActive: true
            };

            await api.post('/api/events', payload);
            alert(`${createType === 'event' ? 'Event' : 'Community'} created successfully!`);
            navigate(isVerified ? '/admin/circles' : '/dashboard');
        } catch (error) {
            console.error('Error creating circle:', error);
            alert('Failed to create circle: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Circle</h1>
                    <p className="text-gray-500 mt-1">Both events and communities now share the same feature-rich field set</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner w-full md:w-auto">
                    <button
                        onClick={() => setCreateType('event')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${createType === 'event'
                                ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Calendar size={18} />
                        Event
                    </button>
                    <button
                        onClick={() => setCreateType('community')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${createType === 'community'
                                ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Users size={18} />
                        Community
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className={`px-8 py-4 flex justify-between items-center transition-colors duration-500 ${createType === 'event' ? 'bg-indigo-600' : 'bg-purple-600'}`}>
                    <span className="text-white font-semibold flex items-center gap-2">
                        {createType === 'event' ? <Calendar size={20} /> : <Users size={20} />}
                        {createType === 'event' ? 'Event Details' : 'Community Profile'}
                    </span>
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Auto-Verify</span>
                        <button
                            onClick={() => setIsVerified(!isVerified)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isVerified ? 'bg-green-400' : 'bg-white/20'
                                }`}
                        >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isVerified ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: BASIC INFO */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Type className="w-4 h-4 text-indigo-500" />
                                    {createType === 'event' ? 'Event Name' : 'Community Name'}
                                </label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 text-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    placeholder={createType === 'event' ? "e.g. Innovation Summit 2024" : "e.g. Founders Circle"}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <AlignLeft className="w-4 h-4 text-indigo-500" />
                                    Headline
                                </label>
                                <input
                                    value={formData.headline}
                                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 text-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Brief catchphrase"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <AlignLeft className="w-4 h-4 text-indigo-500" />
                                    Description
                                </label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="6"
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 text-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none"
                                    placeholder="Detailed information..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-indigo-500" />
                                    Tags
                                </label>
                                <input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagAdd}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 text-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Enter tags (comma or enter)"
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold flex items-center gap-1">
                                            {tag}
                                            <X size={12} className="cursor-pointer" onClick={() => removeTag(tag)} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: LOGISTICS & MEDIA */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                    Location
                                </label>
                                <input
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 text-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Venue or Link"
                                />
                            </div>

                            {createType === 'event' && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            Date
                                        </label>
                                        <DatePicker
                                            required={createType === 'event'}
                                            selected={formData.date ? new Date(formData.date + 'T00:00:00') : null}
                                            onChange={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                                            dateFormat="yyyy-MM-dd"
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 text-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            Time
                                        </label>
                                        <DatePicker
                                            required={createType === 'event'}
                                            selected={formData.time ? new Date(`2000-01-01T${formData.time}:00`) : null}
                                            onChange={(date) => setFormData({ ...formData, time: date ? format(date, 'HH:mm') : '' })}
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            dateFormat="HH:mm"
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 text-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                                    Media Gallery (Photos)
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {media.images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm group">
                                            <img src={img.preview} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeFile('images', idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {media.images.length < 8 && (
                                        <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all text-gray-400 group">
                                            <Plus size={24} className="group-hover:text-indigo-600 mb-1" />
                                            <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'images')} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-500" />
                                    Contextual PDFs (Rich RAG Data)
                                </label>
                                <div className="space-y-2">
                                    {media.pdfs.map((pdf, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileText className="shrink-0 text-red-500" size={18} />
                                                <span className="text-xs font-bold text-gray-600 truncate">{pdf.name}</span>
                                            </div>
                                            <button type="button" onClick={() => removeFile('pdfs', idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {media.pdfs.length < 5 && (
                                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all text-gray-500">
                                            <Upload size={18} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Upload Detail PDF</span>
                                            <input type="file" multiple accept="application/pdf" onChange={(e) => handleFileUpload(e, 'pdfs')} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-gray-100">
                        <div className="flex-1 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-xs leading-relaxed font-medium">
                                <strong>RAG Pipeline Enabled:</strong> These PDF files and descriptions will be automatically indexed for the <strong>Waytree AI Assistant</strong>, enabling users to ask detailed questions about this {createType}.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-12 py-4 ${createType === 'event' ? 'bg-indigo-600' : 'bg-purple-600'} text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50`}
                            >
                                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={20} />}
                                {isSubmitting ? 'Saving...' : `Create ${createType === 'event' ? 'Event' : 'Community'}`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCircle;
