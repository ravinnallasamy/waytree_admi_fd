import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const PreferencesContext = createContext();

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within PreferencesProvider');
    }
    return context;
};

export const PreferencesProvider = ({ children }) => {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState({
        theme: 'system',
        ui: {
            density: 'comfortable',
            sidebarCollapsed: false
        },
        notifications: {
            email: true,
            inApp: true,
            marketing: false
        }
    });
    const [loading, setLoading] = useState(true);

    // Fetch preferences on mount
    useEffect(() => {
        if (user) {
            fetchPreferences();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchPreferences = async () => {
        try {
            console.log('📥 [PREFERENCES] Fetching from backend...');
            const response = await api.get('/api/settings/me');
            if (response?.data?.preferences) {
                console.log('✅ [PREFERENCES] Loaded:', response.data.preferences);
                setPreferences(response.data.preferences);
                applyTheme(response.data.preferences.theme);
                applyDensity(response.data.preferences.ui?.density || 'comfortable');
            }
        } catch (error) {
            console.error('❌ [PREFERENCES] Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    const updatePreferences = async (updates) => {
        try {
            console.log('🎨 [PREFERENCES] Updating:', updates);

            // Optimistic update
            setPreferences(prev => ({
                ...prev,
                ...updates,
                ui: { ...prev.ui, ...(updates.ui || {}) },
                notifications: { ...prev.notifications, ...(updates.notifications || {}) }
            }));

            // Apply theme immediately if changed
            if (updates.theme) {
                console.log('🎨 [PREFERENCES] Applying theme:', updates.theme);
                applyTheme(updates.theme);
            }

            // Apply density immediately if changed
            if (updates.ui?.density) {
                console.log('📐 [PREFERENCES] Applying density:', updates.ui.density);
                applyDensity(updates.ui.density);
            }

            // Save to backend
            console.log('💾 [PREFERENCES] Saving to backend...');
            await api.put('/api/settings/me', { preferences: updates });
            console.log('✅ [PREFERENCES] Saved successfully');
        } catch (error) {
            console.error('❌ [PREFERENCES] Failed to update:', error);
            // Revert on error
            fetchPreferences();
        }
    };

    const applyDensity = (density) => {
        console.log('📐 [DENSITY] Applying density:', density);
        const root = document.documentElement;

        if (density === 'compact') {
            console.log('📦 [DENSITY] Switching to COMPACT mode');
            root.classList.add('compact');

            // Reduce padding and spacing
            const containers = document.querySelectorAll('.p-8, .p-6, .p-10');
            containers.forEach(el => {
                el.style.setProperty('padding', '1rem', 'important');
            });

            const spacing = document.querySelectorAll('.space-y-8, .space-y-6');
            spacing.forEach(el => {
                el.style.setProperty('gap', '0.75rem', 'important');
            });

            // Reduce font sizes
            const headings = document.querySelectorAll('h1, h2, h3');
            headings.forEach(el => {
                const currentSize = window.getComputedStyle(el).fontSize;
                const newSize = parseFloat(currentSize) * 0.85;
                el.style.setProperty('font-size', `${newSize}px`, 'important');
            });

            // Reduce card padding
            const cards = document.querySelectorAll('[class*="rounded-"]');
            cards.forEach(el => {
                if (el.style.padding || el.classList.toString().includes('p-')) {
                    el.style.setProperty('padding', '0.75rem', 'important');
                }
            });

        } else {
            console.log('🛋️ [DENSITY] Switching to COMFORTABLE mode');
            root.classList.remove('compact');

            // Reset to default spacing
            const allElements = document.querySelectorAll('[style]');
            allElements.forEach(el => {
                // Remove compact overrides
                if (el.style.padding && (el.style.padding === '1rem' || el.style.padding === '0.75rem')) {
                    el.style.removeProperty('padding');
                }
                if (el.style.gap === '0.75rem') {
                    el.style.removeProperty('gap');
                }
                if (el.style.fontSize) {
                    el.style.removeProperty('font-size');
                }
            });
        }
    };

    const applyTheme = (theme) => {
        console.log('🎨 [THEME] Applying theme:', theme);
        const root = document.documentElement;

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
            console.log('🎨 [THEME] System preference detected:', theme);
        }

        if (theme === 'dark') {
            console.log('🌙 [THEME] Switching to DARK mode');
            root.classList.add('dark');

            // Apply dark theme to all elements
            document.body.style.setProperty('background-color', '#0f172a', 'important');
            document.body.style.setProperty('color', '#e2e8f0', 'important');

            // Update all white backgrounds to dark
            const whiteElements = document.querySelectorAll('.bg-white, [class*="bg-gray-"]');
            whiteElements.forEach(el => {
                el.style.setProperty('background-color', '#1e293b', 'important');
                el.style.setProperty('color', '#e2e8f0', 'important');
            });

            // Update text colors
            const textElements = document.querySelectorAll('.text-gray-900, .text-gray-800, .text-gray-700, .text-black');
            textElements.forEach(el => {
                el.style.setProperty('color', '#e2e8f0', 'important');
            });

            // Update borders
            const borderElements = document.querySelectorAll('[class*="border-gray"]');
            borderElements.forEach(el => {
                el.style.setProperty('border-color', '#334155', 'important');
            });

        } else {
            console.log('☀️ [THEME] Switching to LIGHT mode');
            root.classList.remove('dark');

            // Reset to light theme
            document.body.style.setProperty('background-color', '#f8fafc', 'important');
            document.body.style.setProperty('color', '#0f172a', 'important');

            // Remove dark theme overrides
            const allElements = document.querySelectorAll('[style]');
            allElements.forEach(el => {
                if (el.style.backgroundColor && el.style.backgroundColor.includes('rgb(30, 41, 59)')) {
                    el.style.removeProperty('background-color');
                }
                if (el.style.color && el.style.color.includes('rgb(226, 232, 240)')) {
                    el.style.removeProperty('color');
                }
                if (el.style.borderColor && el.style.borderColor.includes('rgb(51, 65, 85)')) {
                    el.style.removeProperty('border-color');
                }
            });
        }
    };

    // Listen for system theme changes
    useEffect(() => {
        if (preferences.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e) => applyTheme('system');
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [preferences.theme]);

    const value = {
        preferences,
        updatePreferences,
        loading
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};
