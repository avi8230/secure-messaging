require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const { encrypt } = require('../services/encryption');
const bcrypt = require('bcrypt');

async function loadData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete old data (optional)
        // await User.deleteMany();
        // await Message.deleteMany();

        // Create users
        const users = await User.insertMany([
            {
                email: 'user1@example.com',
                password: await bcrypt.hash('password123', 10)
            },
            {
                email: 'user2@example.com',
                password: await bcrypt.hash('password123', 10)
            }
        ]);

        console.log('✅ Users created');

        // Create messages with encryption
        const messages = await Message.insertMany([
            {
                user: users[0]._id,
                encrypted: encrypt('שלום לכולם!')
            },
            {
                user: users[1]._id,
                encrypted: encrypt('מה שלומכם היום?')
            }
        ]);

        console.log('✅ Messages created');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error loading data:', err);
        process.exit(1);
    }
}

loadData();
