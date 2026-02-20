import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // This will be proxied to http://127.0.0.1:8000 in dev
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
