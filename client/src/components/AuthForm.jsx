import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { login, register } from '../api/auth';

export default function AuthForm({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        try {
            if (isLogin) await login({ email, password });
            else await register({ email, password });
            onLogin();
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <Box display="flex" flexDirection="column" maxWidth={300} mx="auto" mt={10}>
            <Typography variant="h5">{isLogin ? 'Login' : 'Register'}</Typography>
            <TextField label="Email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type="password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <Typography color="error">{error}</Typography>}
            <Button variant="contained" onClick={handleSubmit}>{isLogin ? 'Login' : 'Register'}</Button>
            <Button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </Button>
        </Box>
    );
}
