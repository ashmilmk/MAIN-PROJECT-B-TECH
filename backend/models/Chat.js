const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: { // User's message
        type: String,
        required: true,
        trim: true
    },
    response: { // Bot's response
        type: String,
        required: true
    },
    isFlagged: { // Flagged for admin attention
        type: Boolean,
        default: false
    },
    resolved: { // If admin dealt with it
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);
