const Notification = require('../models/notification');

async function checkDuplication(notification) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const similarNotification = await Notification.findOne({
    userId: notification.userId,
    message: notification.message,
    createdAt: { $gte: oneHourAgo },
    status: 'sent'
  });

  return !!similarNotification;
}

module.exports = { checkDuplication };

