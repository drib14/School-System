import axios from 'axios';

const run = async () => {
    try {
        const loginRes = await axios.post('http://localhost:5080/api/auth/login', {
            email: 'alice@student.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Got Token:', token.substring(0, 10) + '...');

        const res = await axios.get('http://localhost:5080/api/enrollments', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Status:', res.status);
        console.log('Data:', res.data);
    } catch (error) {
        console.error('Error:', error.response?.status, error.response?.data || error.message);
    }
};

run();
