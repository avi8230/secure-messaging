const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ----- encryption -----
const key = Buffer.from(process.env.ENCRYPTION_KEY);
const iv = Buffer.from(process.env.ENCRYPTION_IV);

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('hex');
}

function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([
        decipher.update(Buffer.from(encryptedText, 'hex')),
        decipher.final()
    ]).toString('utf8');
}

// ----- hybrid encryption -----
const serverPrivateKey = fs.readFileSync(path.join(__dirname, '../keys/server_private.pem'), 'utf8');

function decryptHybrid(encryptedKeyBase64, encryptedDataBase64) {
    // Decrypt the AES key using the server's private key
    const aesKey = crypto.privateDecrypt(
        { key: serverPrivateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(encryptedKeyBase64, 'base64')
    );

    // Convert the encrypted data from base64 to Buffer
    const iv = Buffer.from(encryptedDataBase64.iv, 'base64');
    const encryptedText = Buffer.from(encryptedDataBase64.data, 'base64');

    // Create a decipher for AES
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);

    // Decrypt the data
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
}

function encryptHybrid(publicKey, dataObj) {
    // Create a random AES key and IV
    const aesKey = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16);

    // Create a cipher for AES
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);

    // Encrypt the data with AES
    let encrypted = cipher.update(JSON.stringify(dataObj));
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Encrypt the AES key with RSA using the public key
    const encryptedKey = crypto.publicEncrypt(
        { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        aesKey
    );

    return {
        encryptedKey: encryptedKey.toString('base64'),
        encryptedData: {
            iv: iv.toString('base64'),
            data: encrypted.toString('base64')
        }
    };
}

module.exports = {
    encrypt,
    decrypt,
    encryptHybrid,
    decryptHybrid
};
