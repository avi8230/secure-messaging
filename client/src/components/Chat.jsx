import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { sendMessage, getMessages } from '../api/messages';
import { logout } from '../api/auth';
import { deletePrivateKey } from '../utils/keys';

export default function Chat({ onLogout }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const fetchMessages = async () => {
        try {
            const decryptedMessages = await getMessages();
            setMessages(decryptedMessages);
        } catch (err) {
            console.error('Failed to get messages:', err);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // polling every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const handleSend = async () => {
        if (!message.trim()) return;
        try {
            await sendMessage(message);
            setMessage('');
            fetchMessages();
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleLogout = async () => {
        await logout();
        deletePrivateKey();
        onLogout();
    };

    return (
        <Box maxWidth={600} mx="auto" mt={5}>
            <Typography variant="h4" gutterBottom>Chat Room</Typography>

            <List sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', mb: 2 }}>
                {messages.map((msg, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={msg.message}
                            secondary={msg.email}
                        />
                    </ListItem>
                ))}
            </List>

            <Box display="flex" gap={1}>
                <TextField
                    fullWidth
                    label="Type your message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
                <Button variant="contained" onClick={handleSend}>Send</Button>
            </Box>

            <Button onClick={handleLogout} sx={{ mt: 2 }}>Logout</Button>
        </Box>
    );
}
