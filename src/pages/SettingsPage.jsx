import React, { useState, useEffect } from 'react';
import {
    User,
    Bell,
    Shield,
    Moon,
    Sun,
    Monitor,
    Save,
    ToggleLeft,
    ToggleRight,
    Layout,
    Database,
    CheckCircle,
    AlertTriangle,
    Sliders
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

const SettingsPage = () => {
    const { user: currentUser } = useAuth();
    const { preferences, updatePreferences } = usePreferences();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'

    // Platform Settings State (Admin Only)
    const [platformSettings, setPlatformSettings] = useState({
        verification: {
            autoVerifyEvents: false,
            autoVerifyCommunities: false,
            requirePhoneVerification: false
        },
        limits: {
            maxDailyEventsPerUser: 5,
            maxUploadSizeMB: 10
        },
        features: {
            enableNetworkCodes: true,
            maintenanceMode: false
        },
        security: {
            enforceMfa: false
        }
    });

    useEffect(() => {
        fetchPlatformSettings();
    }, []);

    const fetchPlatformSettings = async () => {
        try {
            setLoading(true);

            // Fetch Platform Settings (if admin)
            if (currentUser?.role === 'superadmin' || currentUser?.role === 'admin') {
                const platformRes = await api.get('/api/settings/platform');
                if (platformRes.data?.data) {
                    setPlatformSettings(platformRes.data.data);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setLoading(false);
        }
    };

    // Generic Update Handler for User Preferences
    const handlePreferenceChange = async (section, key, value) => {
        setSaveStatus('saving');

        try {
            if (section === 'theme') {
                await updatePreferences({ theme: value });
            } else {
                await updatePreferences({ [section]: { [key]: value } });
            }

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (error) {
            console.error('Save failed', error);
            setSaveStatus('error');
        }
    };

    // Platform Update Handler
    const handlePlatformChange = async (section, key, value) => {
        setPlatformSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));

        updatePlatformSettingsDebounced({ [section]: { [key]: value } });
    };

    const updatePlatformSettingsDebounced = async (updates) => {
        setSaveStatus('saving');
        try {
            await api.put('/api/settings/platform', updates);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (error) {
            console.error('Save failed', error);
            setSaveStatus('error');
        }
    };

    // Reusable Toggle Component
    const Toggle = ({ checked, onChange, label, description }) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div>
                <p className="font-bold text-gray-900">{label}</p>
                {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${checked ? 'left-6' : 'left-1'}`} />
            </button>
        </div>
    );

    if (loading) return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

    const tabs = [
        { id: 'general', label: 'General', icon: Sliders },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy & Security', icon: Shield },
        { id: 'platform', label: 'Platform Config', icon: Database, adminOnly: true }
    ];

    return (
        <div className="flex h-full bg-gray-50/50">
            {/* Sidebar / Tabs */}
            <div className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col">
                <h1 className="text-2xl font-black text-gray-900 mb-8 px-2">Settings</h1>
                <nav className="space-y-1">
                    {tabs.map(tab => {
                        if (tab.adminOnly && currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') return null;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === tab.id
                                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                {saveStatus && (
                    <div className={`mt-auto px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${saveStatus === 'saved' ? 'bg-green-50 text-green-600' :
                        saveStatus === 'saving' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                        }`}>
                        {saveStatus === 'saving' && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                        {saveStatus === 'saved' && <CheckCircle size={14} />}
                        {saveStatus === 'error' && <AlertTriangle size={14} />}
                        <span className="capitalize">{saveStatus === 'saving' ? 'Saving...' : saveStatus}</span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-3xl">

                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Monitor size={20} className="text-indigo-600" /> Interface Theme
                                </h2>
                                <div className="grid grid-cols-3 gap-4">
                                    {['light', 'dark', 'system'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => handlePreferenceChange('theme', null, mode)}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${preferences.theme === mode
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                                                }`}
                                        >
                                            {mode === 'light' && <Sun size={24} />}
                                            {mode === 'dark' && <Moon size={24} />}
                                            {mode === 'system' && <Monitor size={24} />}
                                            <span className="font-bold capitalize text-sm">{mode}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Layout size={20} className="text-indigo-600" /> Layout Density
                                </h2>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input
                                            type="radio"
                                            name="density"
                                            checked={preferences.ui?.density === 'comfortable'}
                                            onChange={() => handlePreferenceChange('ui', 'density', 'comfortable')}
                                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-600"
                                        />
                                        <div>
                                            <span className="font-bold text-gray-900 block">Comfortable</span>
                                            <span className="text-sm text-gray-500">More whitespace, easier to scan.</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input
                                            type="radio"
                                            name="density"
                                            checked={preferences.ui?.density === 'compact'}
                                            onChange={() => handlePreferenceChange('ui', 'density', 'compact')}
                                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-600"
                                        />
                                        <div>
                                            <span className="font-bold text-gray-900 block">Compact</span>
                                            <span className="text-sm text-gray-500">More data on screen, for power users.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                            <div className="space-y-2">
                                <Toggle
                                    label="Email Notifications"
                                    description="Receive updates and alerts via email."
                                    checked={preferences.notifications.email}
                                    onChange={(val) => handlePreferenceChange('notifications', 'email', val)}
                                />
                                <Toggle
                                    label="In-App Alerts"
                                    description="Get notified immediately within the dashboard."
                                    checked={preferences.notifications.inApp}
                                    onChange={(val) => handlePreferenceChange('notifications', 'inApp', val)}
                                />
                                <Toggle
                                    label="Marketing & Updates"
                                    description="News about new features and improvements."
                                    checked={preferences.notifications.marketing}
                                    onChange={(val) => handlePreferenceChange('notifications', 'marketing', val)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Platform Settings (Admin) */}
                    {activeTab === 'platform' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-rose-500">
                                <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                    <CheckCircle size={20} className="text-rose-500" /> Verification Rules
                                </h2>
                                <p className="text-gray-500 text-sm mb-6">Control how content is verified on the platform.</p>

                                <div className="space-y-2">
                                    <Toggle
                                        label="Auto-Verify Events"
                                        description="Automatically approve new events without admin review."
                                        checked={platformSettings.verification.autoVerifyEvents}
                                        onChange={(val) => handlePlatformChange('verification', 'autoVerifyEvents', val)}
                                    />
                                    <Toggle
                                        label="Auto-Verify Communities"
                                        description="Automatically approve new communities."
                                        checked={platformSettings.verification.autoVerifyCommunities}
                                        onChange={(val) => handlePlatformChange('verification', 'autoVerifyCommunities', val)}
                                    />
                                    <Toggle
                                        label="Require Phone for Organizers"
                                        description="Organizers must verify phone number before creating events."
                                        checked={platformSettings.verification.requirePhoneVerification}
                                        onChange={(val) => handlePlatformChange('verification', 'requirePhoneVerification', val)}
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Limits & Quotas</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Max Daily Events Per User</label>
                                        <input
                                            type="number"
                                            value={platformSettings.limits.maxDailyEventsPerUser}
                                            onChange={(e) => handlePlatformChange('limits', 'maxDailyEventsPerUser', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Max Upload Size (MB)</label>
                                        <input
                                            type="number"
                                            value={platformSettings.limits.maxUploadSizeMB}
                                            onChange={(e) => handlePlatformChange('limits', 'maxUploadSizeMB', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Feature Flags</h2>
                                <div className="space-y-2">
                                    <Toggle
                                        label="Enable Network Codes"
                                        description="Allow users to create and join private network circles."
                                        checked={platformSettings.features.enableNetworkCodes}
                                        onChange={(val) => handlePlatformChange('features', 'enableNetworkCodes', val)}
                                    />
                                    <Toggle
                                        label="Maintenance Mode"
                                        description="Disable public access to the app (Admins only)."
                                        checked={platformSettings.features.maintenanceMode}
                                        onChange={(val) => handlePlatformChange('features', 'maintenanceMode', val)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
                            <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Privacy & Security</h2>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">These settings are managed centrally by the IT department for admin accounts.</p>
                            <button className="px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                View Security Policy
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
