import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const themes = {
    'Google Stitch Dark': { bg: '#0F1219', text: '#E2E8F0', accent: '#4F46E5', border: '#1E293B', font: 'System', borderRadius: 16 },
    'Google Stitch Light': { bg: '#F8FAFC', text: '#0F172A', accent: '#3B82F6', border: '#E2E8F0', font: 'System', borderRadius: 16 },
    'Neon Cyberpunk': { bg: '#09090b', text: '#0ff', accent: '#f0f', border: '#0ff', font: 'System', borderRadius: 0 },
    'NERV Tactical': { bg: '#000000', text: '#ff6600', accent: '#ffffff', border: '#ff6600', font: 'System', borderRadius: 4 },
    'Minimalist Glassmorphism': { bg: '#ffffff10', text: '#ffffff', accent: '#ffffff', border: '#ffffff40', font: 'System', borderRadius: 16 },
    'Matrix Cascade': { bg: '#000000', text: '#00ff00', accent: '#00ff00', border: '#003300', font: 'System', borderRadius: 0 },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [currentThemeName, setCurrentThemeName] = useState('Google Stitch Dark');

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('synapse_theme');
            if (savedTheme && themes[savedTheme]) {
                setCurrentThemeName(savedTheme);
            }
        };
        loadTheme();
    }, []);

    const setTheme = async (name) => {
        if (themes[name]) {
            setCurrentThemeName(name);
            await AsyncStorage.setItem('synapse_theme', name);
        }
    };

    return (
        <ThemeContext.Provider value={{ themeName: currentThemeName, theme: themes[currentThemeName], setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
