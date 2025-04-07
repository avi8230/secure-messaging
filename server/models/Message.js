const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    encrypted: { type: String, required: true },
});

module.exports = mongoose.model('Message', messageSchema);
