import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // This will be proxied to http://127.0.0.1:8000 in dev
    headers: {
        'Content-Type': 'application/json',
    },
});

export const uploadXRay = async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post('/yolo/detect/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const checkTaskStatus = async (taskId) => {
    const response = await api.get(`/yolo/task/${taskId}`);
    return response.data;
};

export default api;
