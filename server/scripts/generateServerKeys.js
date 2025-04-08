const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

const keysDir = path.join(__dirname, '../keys');

// create keys directory if it doesn't exist
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir);
}

fs.writeFileSync(path.join(keysDir, 'server_public.pem'), publicKey.export({ type: 'pkcs1', format: 'pem' }));
fs.writeFileSync(path.join(keysDir, 'server_private.pem'), privateKey.export({ type: 'pkcs1', format: 'pem' }));

console.log('✅ Server RSA key pair generated successfully.');
