import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const StorageContext = createContext();

export const STORAGE_KEYS = {
    // Keep these for backward compatibility or future use if we need constants
    USERS: 'educore_users',
    STUDENTS: 'educore_students',
};

// Keep academic data as static constants for now
export const ACADEMIC_DATA = {
    departments: ['Preschool', 'Elementary', 'Junior High School', 'Senior High School', 'College'],
    programs: {
        'Preschool': ['Kindergarten'],
        'Elementary': ['Elementary Education'],
        'Junior High School': ['Junior High School'],
        'Senior High School': ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL'],
        'College': ['BS Computer Science', 'BS Information Technology', 'BS Business Administration', 'Bachelor of Secondary Education', 'BS Nursing']
    },
    yearLevels: {
        'Kindergarten': ['Kinder'],
        'Elementary Education': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
        'Junior High School': ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
        'STEM': ['Grade 11', 'Grade 12'],
        'ABM': ['Grade 11', 'Grade 12'],
        'HUMSS': ['Grade 11', 'Grade 12'],
        'GAS': ['Grade 11', 'Grade 12'],
        'TVL': ['Grade 11', 'Grade 12'],
        'BS Computer Science': ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        'BS Information Technology': ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        'BS Business Administration': ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        'Bachelor of Secondary Education': ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        'BS Nursing': ['1st Year', '2nd Year', '3rd Year', '4th Year']
    },
    sections: ['A', 'B', 'C', 'D'],
    subjects: {
        'Kinder': ['Reading', 'Writing', 'Math', 'Arts'],
        'Grade 1': ['Math', 'English', 'Science', 'Filipino', 'MAPEH'],
        'Grade 7': ['Algebra', 'Biology', 'English 7', 'Filipino 7', 'Asian History'],
        'Grade 11': ['Oral Comm', 'Gen Math', 'Earth Science', 'Komunikasyon'],
        '1st Year': ['Programming 1', 'Intro to Computing', 'Purposive Comm', 'Math in Modern World']
    }
};

export const StorageProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setCurrentUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setCurrentUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, user: data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            // Don't auto-login, wait for verification
            return { success: true, user: data };
        } catch (error) {
             return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const verify = async (email, code) => {
         try {
            const { data } = await api.post('/auth/verify', { email, code });
            setCurrentUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true, user: data };
        } catch (error) {
             return {
                success: false,
                message: error.response?.data?.message || 'Verification failed'
            };
        }
    }

    // --- Temporary Adapters for Existing Components ---
    // We will eventually replace these with direct API calls in the components
    const getItems = (key) => {
        // Fallback to local storage for now while we migrate
        return JSON.parse(localStorage.getItem(key) || '[]');
    };

    const saveItem = (key, item) => {
         const currentItems = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedItems = [...currentItems, item];
        localStorage.setItem(key, JSON.stringify(updatedItems));
        return updatedItems;
    };

    const updateItem = (key, id, updates) => {
         const items = getItems(key);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            localStorage.setItem(key, JSON.stringify(items));
            return true;
        }
        return false;
    };

    return (
        <StorageContext.Provider value={{
            currentUser,
            login,
            logout,
            register,
            verify,
            getItems, // Deprecated, but kept for compatibility
            saveItem, // Deprecated, but kept for compatibility
            updateItem, // Deprecated, but kept for compatibility
            STORAGE_KEYS
        }}>
            {!loading && children}
        </StorageContext.Provider>
    );
};

export const useStorage = () => useContext(StorageContext);
