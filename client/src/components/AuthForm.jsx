import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { login, register, updatePublicKey } from '../api/auth';
import { generateKeyPair } from '../utils/crypto';
import {
    savePrivateKey,
    saveServerPublicKey,
    deletePrivateKey,
} from '../utils/keys';

export default function AuthForm({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        try {
            const response = isLogin
                ? await login({ email, password })
                : await register({ email, password });

            // 1. Save the server's public key
            const { serverPublicKey } = response.data;
            saveServerPublicKey(serverPublicKey);

            // 2. Generate keys for the client
            const { publicKey, privateKey } = await generateKeyPair();
            savePrivateKey(privateKey);

            // 3. Send the client's public key to the server
            await updatePublicKey(publicKey);

            // 4. Enable login continuation
            onLogin();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <Box display="flex" flexDirection="column" maxWidth={300} mx="auto" mt={10}>
            <Typography variant="h5">{isLogin ? 'Login' : 'Register'}</Typography>
            <TextField
                label="Email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="Password"
                type="password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button variant="contained" onClick={handleSubmit}>
                {isLogin ? 'Login' : 'Register'}
            </Button>
            <Button onClick={() => {
                deletePrivateKey(); // Clear the private key on logout
                setIsLogin(!isLogin);
            }}>
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </Button>
        </Box>
    );
}
