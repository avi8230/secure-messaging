import axios from 'axios';
import { getPrivateKey, getServerPublicKey } from '../utils/keys';
import forge from 'node-forge';

const API = 'https://localhost:3001/api/messages';

// Creating hybrid encryption
function encryptHybrid(dataObj, serverPublicKeyPem) {
    const aesKey = forge.random.getBytesSync(32); // 256-bit
    const iv = forge.random.getBytesSync(16);

    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(JSON.stringify(dataObj), 'utf8'));
    cipher.finish();
    const encryptedData = cipher.output.getBytes();

    const encryptedKey = forge.pki.publicKeyFromPem(serverPublicKeyPem).encrypt(aesKey, 'RSAES-PKCS1-V1_5');

    return {
        encryptedKey: forge.util.encode64(encryptedKey),
        encryptedData: {
            iv: forge.util.encode64(iv),
            data: forge.util.encode64(encryptedData),
        },
    };
}

// Decoding a hybrid response
function decryptHybrid(privateKeyPem, { encryptedKey, encryptedData }) {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const aesKey = privateKey.decrypt(forge.util.decode64(encryptedKey), 'RSAES-PKCS1-V1_5');

    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({
        iv: forge.util.decode64(encryptedData.iv),
    });
    decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedData.data)));
    const success = decipher.finish();

    if (!success) throw new Error('AES decryption failed');
    return JSON.parse(decipher.output.toString('utf8'));
}

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
