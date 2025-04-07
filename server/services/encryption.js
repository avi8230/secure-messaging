const crypto = require('crypto');

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

module.exports = { encrypt, decrypt };
