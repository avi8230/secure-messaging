import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { sendMessage, getMessages } from '../api/messages';
import { logout } from '../api/auth';

export default function Chat({ onLogout }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const fetchMessages = async () => {
        const res = await getMessages();
        setMessages(res.data);
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // polling כל 3 שניות
        return () => clearInterval(interval);
    }, []);

    const handleSend = async () => {
        if (!message.trim()) return;
        await sendMessage(message);
        setMessage('');
        fetchMessages();
    };

    return (
        <Box maxWidth={600} mx="auto" mt={5}>
            <Typography variant="h4" gutterBottom>Chat Room</Typography>
            <List sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', mb: 2 }}>
                {messages.map((msg, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            // primary={msg.decrypted}
                            primary={msg.encrypted}
                            secondary={msg.email}
                        />
                    </ListItem>
                ))}
            </List>
            <Box display="flex" gap={1}>
                <TextField fullWidth label="Type your message" value={message} onChange={e => setMessage(e.target.value)} />
                <Button variant="contained" onClick={handleSend}>Send</Button>
            </Box>
            <Button onClick={async () => { await logout(); onLogout(); }} sx={{ mt: 2 }}>Logout</Button>
        </Box>
    );
}
