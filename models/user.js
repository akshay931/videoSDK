const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  preferences: {
    channels: [{ type: String, enum: ['email', 'sms', 'push'] }],
    quietHours: {
      start: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
      end: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }
    },
    notificationLimit: { type: Number, default: 3 }
  }
});

module.exports = mongoose.model('User', userSchema);

