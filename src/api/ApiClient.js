import axios from 'axios';

const ApiClient = axios.create({
    baseURL: 'http://localhost:5050/api/auth/login', // 백엔드 URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청에 JWT 토큰 포함
ApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default ApiClient;
