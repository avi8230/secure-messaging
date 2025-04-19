import axios from 'axios';
import { getPrivateKey, getServerPublicKey } from '../utils/keys';
import { encryptHybrid, decryptHybrid } from '../utils/encryption';

const API = 'https://localhost:3001/api/messages';

// Sending a message
export const sendMessage = async (message) => {
    const serverPublicKey = getServerPublicKey();
    const privateKey = getPrivateKey();

    if (!serverPublicKey || !privateKey) throw new Error('Missing RSA keys');

    const hybridEncrypted = encryptHybrid({ message }, serverPublicKey);

    const res = await axios.post(API, hybridEncrypted, { withCredentials: true });

    if (!res.data?.encryptedKey || !res.data?.encryptedData) {
        throw new Error('Missing encrypted response data');
    }

    return decryptHybrid(privateKey, res.data); // { success: true }
};

// Receive all messages
export const getMessages = async () => {
    const privateKey = getPrivateKey();
    if (!privateKey) throw new Error('Missing client private key');

    const res = await axios.get(API, { withCredentials: true });

    if (!res.data?.encryptedKey || !res.data?.encryptedData) {
        throw new Error('Missing encrypted response data');
    }

    try {
        return decryptHybrid(privateKey, res.data); // [{ message, email }, ...]
    } catch (err) {
        console.error('Decryption failed:', err);
        return [];
    }
};
