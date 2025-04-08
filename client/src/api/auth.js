import axios from 'axios';

axios.defaults.withCredentials = true;

const API = 'https://localhost:3001/api/auth';

export const register = (data) => axios.post(`${API}/register`, data);
export const login = (data) => axios.post(`${API}/login`, data);
export const logout = () => axios.post(`${API}/logout`);

export const updatePublicKey = (publicKey) =>
    axios.post(`${API}/update-public-key`, { publicKey });
