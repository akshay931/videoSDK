const Notification = require('../models/notification');

async function getUrgentAlerts() {
  return Notification.find({
    priority: 'high',
    status: 'pending'
  }).sort({ createdAt: 1 });
}

module.exports = { getUrgentAlerts };

