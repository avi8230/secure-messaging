const PRIVATE_KEY_STORAGE = 'client_private_key';
const SERVER_PUBLIC_KEY_STORAGE = 'server_public_key';

export function savePrivateKey(key) {
    localStorage.setItem(PRIVATE_KEY_STORAGE, key);
}

export function getPrivateKey() {
    return localStorage.getItem(PRIVATE_KEY_STORAGE);
}

export function deletePrivateKey() {
    localStorage.removeItem(PRIVATE_KEY_STORAGE);
}

export function saveServerPublicKey(key) {
    localStorage.setItem(SERVER_PUBLIC_KEY_STORAGE, key);
}

export function getServerPublicKey() {
    return localStorage.getItem(SERVER_PUBLIC_KEY_STORAGE);
}
