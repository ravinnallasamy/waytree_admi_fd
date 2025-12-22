import React, { useState, useEffect } from 'react';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
    Calendar,
    Clock,
    MapPin,
    Upload,
    X,
    Image as ImageIcon,
    Video,
    Type,
    AlignLeft,
    Tag,
    Save
} from 'lucide-react';

const CreateEventForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        eventName: '',
        headline: '',
        description: '',
        date: '',
        time: '',
        location: ''
    });
    const [errors, setErrors] = useState({});
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingEvents, setPendingEvents] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed - Name: ${name}, Value:`, value);
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };
            console.log('New form data:', newData);
            return newData;
        });
    };

    useEffect(() => {
        if (!isActive) {
            fetchPendingEvents();
        }
    }, [isActive]);

    const fetchPendingEvents = async () => {
        try {
            const data = await api.get('/api/events/pending');
            setPendingEvents(data.events || data);
        } catch (error) {
            console.error('Error fetching pending events:', error);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];

        files.forEach(file => {
            // Check if file size is greater than 2MB (2 * 1024 * 1024 bytes)
            if (file.size > 2 * 1024 * 1024) {
                alert(`File "${file.name}" is too large. Please upload images smaller than 2MB to ensure fast loading.`);
            } else {
                validFiles.push(file);
            }
        });

        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setImages([...images, ...newImages]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo({
                file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simple validation
        const newErrors = {};
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        if (!formData.eventName) newErrors.eventName = 'Event name is required';
        if (!formData.headline) newErrors.headline = 'Headline is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.location) newErrors.location = 'Location is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            // Convert images to Base64
            const imageBase64Promises = images.map(img => toBase64(img.file));
            const base64Images = await Promise.all(imageBase64Promises);

            // Format date and time to ISO string
            const dateTime = new Date(`${formData.date}T${formData.time}`);
            if (isNaN(dateTime.getTime())) {
                throw new Error('Invalid date or time format');
            }

            const newEvent = {
                title: formData.eventName,
                headline: formData.headline,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                dateTime: dateTime.toISOString(),
                location: formData.location,
                images: base64Images.map(b64 => ({ preview: b64 })),
                video,
                tags,
                status: isActive ? 'verified' : 'pending'
            };

            console.log('Submitting event:', {
                ...newEvent,
                images: '[BASE64_IMAGES]', // Don't log actual base64 data
                video: video ? '[VIDEO_DATA]' : null
            });

            const response = await api.post('/api/events', newEvent);
            console.log('Event created successfully:', response.data);

            alert('Event created successfully!');
            if (isActive) {
                navigate('/admin/events');
            } else {
                navigate('/admin/permission');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert(`Error creating event: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
                    <p className="text-gray-500 mt-1">Fill in the details to publish a new event</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/create-event')}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Type className="w-4 h-4" />
                                Event Name
                            </label>
                            <input
                                name="eventName"
                                value={formData.eventName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="e.g. Tech Conference 2024"
                            />
                            {errors.eventName && <p className="text-red-500 text-xs">{errors.eventName}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <AlignLeft className="w-4 h-4" />
                                Headline
                            </label>
                            <input
                                name="headline"
                                value={formData.headline}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="A catchy headline for your event"
                            />
                            {errors.headline && <p className="text-red-500 text-xs">{errors.headline}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                            placeholder="Describe your event..."
                        />
                        {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                    </div>
                </div>

                {/* Date & Location Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-4">Date & Location</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Date
                            </label>
                            <DatePicker
                                selected={formData.date ? new Date(formData.date + 'T00:00:00') : null}
                                onChange={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                                dateFormat="yyyy-MM-dd"
                                minDate={new Date()}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholderText="Select date"
                            />
                            {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Time
                            </label>
                            <DatePicker
                                selected={formData.time ? new Date(`2000-01-01T${formData.time}:00`) : null}
                                onChange={(date) => setFormData({ ...formData, time: date ? format(date, 'HH:mm') : '' })}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="HH:mm"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholderText="Select time"
                            />
                            {errors.time && <p className="text-red-500 text-xs">{errors.time}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Location
                            </label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="Event venue or address"
                            />
                            {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
                        </div>
                    </div>
                </div>

                {/* Media Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-4">Media</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Image Upload */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Event Images
                            </label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm text-gray-600">Click to upload images (Max 2MB)</span>
                                </label>
                            </div>

                            {images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Video Upload */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Event Video (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoUpload}
                                    className="hidden"
                                    id="video-upload"
                                />
                                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm text-gray-600">Click to upload video</span>
                                </label>
                            </div>

                            {video && (
                                <div className="relative mt-4 rounded-lg overflow-hidden bg-gray-100">
                                    <video src={video.preview} controls className="w-full h-48 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setVideo(null)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-4">Settings</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Tags
                            </label>
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="Type and press Enter to add tags"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag, idx) => (
                                    <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-700">Event Status</label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isActive ? 'bg-indigo-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                    {isActive ? 'Active' : 'Off'}
                                </span>
                            </div>
                            <div className={`text-xs rounded-lg p-3 ${isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                {isActive ? (
                                    <p>
                                        <strong>Active:</strong> Event will be published directly to the Verified Events page and visible to all users immediately.
                                    </p>
                                ) : (
                                    <p>
                                        <strong>Off:</strong> Event will be sent to Pending Approval page and requires approval before being visible to users.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/create-event')}
                        className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>

            {/* Pending Events Section */}
            {!isActive && (
                <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        Pending Events
                    </h2>

                    {pendingEvents.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No pending events found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingEvents.map((event) => (
                                <div key={event._id} className="flex gap-3 p-3 border border-gray-100 rounded-lg hover:border-indigo-100 transition-colors bg-gray-50/50">
                                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                        {event.photos && event.photos.length > 0 ? (
                                            <img src={event.photos[0]} alt={event.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium text-gray-900 line-clamp-1 text-sm">{event.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{event.description}</p>
                                        <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(event.dateTime).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreateEventForm;
