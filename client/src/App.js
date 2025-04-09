import React, { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import Chat from './components/Chat';
import { getCurrentUser } from './api/auth';
import { Box, Typography } from '@mui/material';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await getCurrentUser();
                setIsAuthenticated(true);
                setEmail(res.data.email);
            } catch {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) return <Typography>Loading...</Typography>;

    return (
        <Box sx={{ p: 2 }}>
            {isAuthenticated ? (
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Connected as: <strong>{email}</strong>
                    </Typography>
                    <Chat onLogout={() => setIsAuthenticated(false)} />
                </Box>
            ) : (
                <AuthForm onLogin={() => setIsAuthenticated(true)} />
            )}
        </Box>
    );
}

export default App;
