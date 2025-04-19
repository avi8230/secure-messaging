import forge from 'node-forge';

const KEY_SIZE = 2048;

export function generateKeyPair() {
    return new Promise((resolve) => {
        // Generate a key pair using forge
        forge.pki.rsa.generateKeyPair({ bits: KEY_SIZE, workers: -1 }, (err, keypair) => {
            // Convert the keypair to PEM format
            const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
            const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
            // Resolve the promise with the PEM keys
            resolve({ publicKey: publicKeyPem, privateKey: privateKeyPem });
        });
    });
}

// ----- hybrid encryption -----
export function encryptHybrid(dataObj, serverPublicKeyPem) {
    // Generate a random AES key and IV
    const aesKey = forge.random.getBytesSync(32); // 256-bit
    const iv = forge.random.getBytesSync(16);

    // Encrypt the data with AES
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(JSON.stringify(dataObj), 'utf8'));
    cipher.finish();
    const encryptedData = cipher.output.getBytes();

    // Encrypt the AES key with RSA
    const encryptedKey = forge.pki.publicKeyFromPem(serverPublicKeyPem).encrypt(aesKey, 'RSAES-PKCS1-V1_5');

    // Return the encrypted key and data
    return {
        encryptedKey: forge.util.encode64(encryptedKey),
        encryptedData: {
            iv: forge.util.encode64(iv),
            data: forge.util.encode64(encryptedData),
        },
    };
}

export function decryptHybrid(privateKeyPem, { encryptedKey, encryptedData }) {
    // Create a private key from the PEM string
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    // Decrypt the AES key with RSA
    const aesKey = privateKey.decrypt(forge.util.decode64(encryptedKey), 'RSAES-PKCS1-V1_5');

    // Create a decipher for AES
    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({
        iv: forge.util.decode64(encryptedData.iv),
    });
    // Decrypt the data
    decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedData.data)));
    const success = decipher.finish();

    if (!success) throw new Error('AES decryption failed');
    return JSON.parse(decipher.output.toString('utf8'));
}
