// frontend/src/api/axiosConfig.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Sesuaikan dengan URL dan port backend Anda
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;