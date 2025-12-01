import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useStorage } from '../context/StorageContext';

const useMyCourses = () => {
    const { currentUser } = useStorage();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!currentUser) return;
            try {
                // 1. Get Enrollment
                const enrollRes = await api.get('/enrollments');
                // Filter for latest active or pending
                const myEnrollments = enrollRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const currentEnrollment = myEnrollments[0];

                if (!currentEnrollment) {
                    setLoading(false);
                    return;
                }

                // 2. Get Courses
                const { program, yearLevel, section } = currentEnrollment;
                let query = `/courses?program=${encodeURIComponent(program)}&yearLevel=${encodeURIComponent(yearLevel)}`;
                if (section) {
                    query += `&section=${encodeURIComponent(section)}`;
                }
                const coursesRes = await api.get(query);
                setCourses(coursesRes.data);

            } catch (err) {
                console.error(err);
                setError('Failed to fetch courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [currentUser]);

    return { courses, loading, error };
};

export default useMyCourses;
