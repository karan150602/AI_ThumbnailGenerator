const mongoose = require('mongoose');

const thumbnailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  promptText: { type: String, required: true, maxlength: 500 },
  style: {
    type: String,
    enum: ['Minimalist', 'Bold', 'Cinematic', 'Gaming'],
    required: true
  },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Thumbnail', thumbnailSchema);
