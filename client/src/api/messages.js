import axios from 'axios';
axios.defaults.withCredentials = true;

const API = 'https://localhost:3001/api/messages';

export const sendMessage = (message) => axios.post(API, { message });
export const getMessages = () => axios.get(API);
