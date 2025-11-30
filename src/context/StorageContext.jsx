import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const StorageContext = createContext();

const STORAGE_KEYS = {
    USERS: 'educore_users',
    STUDENTS: 'educore_students', // Extended profiles
    COURSES: 'educore_courses',
    ENROLLMENTS: 'educore_enrollments',
    ATTENDANCE: 'educore_attendance',
    GRADES: 'educore_grades',
    FINANCE: 'educore_finance',
    LMS: 'educore_lms',
    EVENTS: 'educore_events',
    LIBRARY: 'educore_library',
    CURRENT_USER: 'educore_current_user'
};

const DEFAULT_ADMIN = {
    id: '100001',
    role: 'Admin',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@educore.edu',
    password: 'admin',
    status: 'Active',
    createdAt: new Date().toISOString()
};

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
    // State for all entities
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return stored ? JSON.parse(stored) : null;
    });

    // Initialize Data
    useEffect(() => {
        const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        if (storedUsers.length === 0) {
            storedUsers.push(DEFAULT_ADMIN);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(storedUsers));
        }
        setUsers(storedUsers);
    }, []);

    // --- Authentication ---
    const login = (email, password) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) return { success: false, message: 'Invalid credentials' };
        if (user.status !== 'Active' && user.status !== 'Pending') return { success: false, message: 'Account not active' }; // Pending allowed for checking status? Maybe not login.

        // If pending, usually can't login to dashboard, but maybe to a status page.
        // For now, strict login.
        if (user.status === 'Pending') return { success: false, message: 'Account pending approval' };

        setCurrentUser(user);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        return { success: true, user };
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        window.location.href = '/login';
    };

    const register = (userData) => {
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        const newUser = {
            ...userData,
            id: generateID(userData.role),
            status: userData.role === 'Parent' ? 'Active' : 'Pending', // Auto-approve Parent
            createdAt: new Date().toISOString()
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        return { success: true, user: newUser };
    };

    // --- CRUD Helpers ---
    const saveItem = (key, item) => {
        const currentItems = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedItems = [...currentItems, item];
        localStorage.setItem(key, JSON.stringify(updatedItems));
        return updatedItems;
    };

    const getItems = (key) => {
        return JSON.parse(localStorage.getItem(key) || '[]');
    };

    const updateItem = (key, id, updates) => {
        const items = getItems(key);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            localStorage.setItem(key, JSON.stringify(items));
            // Sync users state if needed
            if (key === STORAGE_KEYS.USERS) setUsers(items);
            return true;
        }
        return false;
    };

    // --- ID Generator ---
    const generateID = (role) => {
        const year = new Date().getFullYear();
        let prefix = '99';
        if (role === 'Student') prefix = '20';
        if (role === 'Teacher') prefix = '10';
        if (role === 'Parent') prefix = '30';
        const random = Math.floor(10000 + Math.random() * 90000);
        return `${prefix}${year.toString().slice(-2)}${random}`;
    };

    return (
        <StorageContext.Provider value={{
            users,
            currentUser,
            login,
            logout,
            register,
            saveItem,
            getItems,
            updateItem,
            STORAGE_KEYS
        }}>
            {children}
        </StorageContext.Provider>
    );
};

export const useStorage = () => useContext(StorageContext);
