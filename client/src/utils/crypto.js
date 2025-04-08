import forge from 'node-forge';

const KEY_SIZE = 2048;

export function generateKeyPair() {
    return new Promise((resolve) => {
        forge.pki.rsa.generateKeyPair({ bits: KEY_SIZE, workers: -1 }, (err, keypair) => {
            const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
            const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
            resolve({ publicKey: publicKeyPem, privateKey: privateKeyPem });
        });
    });
}

export function encryptWithPublicKey(publicKeyPem, dataObj) {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const data = JSON.stringify(dataObj);
    const encrypted = publicKey.encrypt(data, 'RSAES-PKCS1-V1_5');
    return forge.util.encode64(encrypted);
}

export function decryptWithPrivateKey(privateKeyPem, encryptedBase64) {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encrypted = forge.util.decode64(encryptedBase64);
    const decrypted = privateKey.decrypt(encrypted, 'RSAES-PKCS1-V1_5');
    return JSON.parse(decrypted);
}
