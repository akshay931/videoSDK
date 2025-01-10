const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  userId: { type: String, required: true },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  sendTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' }
});

module.exports = mongoose.model('Notification', notificationSchema);

